import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisteredUser } from './entity/user.entity';
import { ProcessoJudicial } from './entity/processo-judicial.entity';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { SecurityService } from '../security/security.service';
import { BruteForceProtectionService } from '../security/brute-force-protection.service';
import { NetrinResponseDto } from './dto/processos-judiciais.dto';
import axios from 'axios';
import { FileStorageService } from '../portador/services/file-storage.service';
import { EnderecoService } from '../portador/services/endereco.service';
import { CreateEnderecoDto } from '../portador/dto/create-endereco.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
    @InjectRepository(ProcessoJudicial)
    private processoRepository: Repository<ProcessoJudicial>,
    private emailService: EmailService,
    private smsService: SmsService,
    private securityService: SecurityService,
    private bruteForceService: BruteForceProtectionService,
    private readonly enderecoService: EnderecoService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async createUser(userData: Partial<RegisteredUser>): Promise<RegisteredUser> {
    // Extrair a senha do objeto userData
    const { password, ...otherUserData } = userData;

    // Gerar hash da senha se ela foi fornecida
    const hashedPassword = password
      ? await this.securityService.hashPassword(password)
      : undefined;

    // Gerar códigos de verificação iniciais
    const emailVerificationCode = this.generateVerificationCode();
    const phoneVerificationCode = this.generateVerificationCode();

    // Configurar valores padrão com a senha hasheada
    const user = this.userRepository.create({
      ...otherUserData,
      password: hashedPassword, // Senha hasheada
      emailVerificationCode,
      emailVerified: false,
      phoneVerificationCode,
      phoneVerified: false,
      role: 'user',
      isActive: true,
      lgpdAcceptedAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    // Opcionalmente enviar os códigos no momento do registro
    if (userData.email) {
      try {
        await this.emailService.sendVerificationEmail(
          userData.email,
          emailVerificationCode,
        );
      } catch (error) {
        console.log('Erro ao enviar email de verificação:', error);
      }
    }

    if (userData.phoneNumber) {
      await this.smsService.sendVerificationSms(
        userData.phoneNumber,
        phoneVerificationCode,
      );
    }

    // Buscar e salvar processos judiciais se o CPF for fornecido
    if (userData.cpf) {
      try {
        console.log('Buscando processos judiciais para o CPF:', userData.cpf);

        await this.fetchProcessosJudiciais(savedUser.id, userData.cpf);
      } catch (error) {
        console.error('Erro ao buscar processos judiciais:', error);
        // Não interrompemos o fluxo em caso de erro na API externa
      }
    }

    return savedUser;
  }

  async findUserByEmail(email: string): Promise<RegisteredUser | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserByPhone(phoneNumber: string): Promise<RegisteredUser | null> {
    return this.userRepository.findOne({ where: { phoneNumber } });
  }

  async findUserByCpf(cpf: string): Promise<RegisteredUser | null> {
    return this.userRepository.findOne({ where: { cpf } });
  }

  async sendEmailVerificationCode(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado com este email');
    }

    // Gerar novo código de verificação
    const verificationCode = this.generateVerificationCode();
    user.emailVerificationCode = verificationCode;
    await this.userRepository.save(user);

    // Enviar o código por email usando o serviço de email
    await this.emailService.sendVerificationEmail(email, verificationCode);
  }

  async sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
    const user = await this.findUserByPhone(phoneNumber);
    if (!user) {
      throw new NotFoundException(
        'Usuário não encontrado com este número de telefone',
      );
    }

    // Gerar novo código de verificação
    const verificationCode = this.generateVerificationCode();
    user.phoneVerificationCode = verificationCode;
    await this.userRepository.save(user);

    // Enviar o código por SMS usando o serviço de SMS
    await this.smsService.sendVerificationSms(phoneNumber, verificationCode);
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado com este email');
    }

    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Código de verificação inválido');
    }

    user.emailVerified = true;
    await this.userRepository.save(user);
    return true;
  }

  async verifyPhone(phoneNumber: string, code: string): Promise<boolean> {
    const user = await this.findUserByPhone(phoneNumber);
    if (!user) {
      throw new NotFoundException(
        'Usuário não encontrado com este número de telefone',
      );
    }

    if (user.phoneVerificationCode !== code) {
      throw new BadRequestException('Código de verificação inválido');
    }

    user.phoneVerified = true;
    await this.userRepository.save(user);
    return true;
  }

  async login(
    cpf: string,
    password: string,
    ipAddress: string,
  ): Promise<RegisteredUser> {
    // Verificar se o IP está bloqueado
    const isBlocked = await this.bruteForceService.isIpBlocked(ipAddress);
    if (isBlocked) {
      throw new BadRequestException(
        'Acesso temporariamente bloqueado devido a múltiplas tentativas falhas',
      );
    }

    const user = await this.findUserByCpf(cpf);
    if (!user) {
      await this.bruteForceService.recordLoginAttempt(ipAddress, cpf, false);
      throw new NotFoundException('Usuário não encontrado com este CPF');
    }

    // Verificar a senha
    const isPasswordValid = await this.securityService.verifyPassword(
      user.password,
      password,
    );
    if (!isPasswordValid) {
      await this.bruteForceService.recordLoginAttempt(ipAddress, cpf, false);
      throw new BadRequestException('Senha incorreta');
    }

    // Registrar login bem-sucedido
    await this.bruteForceService.recordLoginAttempt(ipAddress, cpf, true);

    return user;
  }

  async saveProcessosJudiciais(
    userId: number,
    netrinData: NetrinResponseDto,
  ): Promise<ProcessoJudicial[]> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    const savedProcessos: ProcessoJudicial[] = [];

    // Acessar os processos no objeto recebido
    const processos = netrinData.processosCPF?.processos || [];

    if (processos.length > 0) {
      // Para cada processo na resposta do Netrin
      for (const processoData of processos) {
        // Criar um novo objeto ProcessoJudicial
        const processo = new ProcessoJudicial();

        // Mapear os campos que queremos salvar
        processo.userId = userId;
        processo.numero =
          processoData.numeroProcessoUnico ||
          processoData.numero ||
          'Sem número';
        processo.numeroProcessoUnico = processoData.numeroProcessoUnico || '';
        processo.urlProcesso = processoData.urlProcesso || '';
        processo.grauProcesso = processoData.grauProcesso || 0;
        processo.unidadeOrigem = processoData.unidadeOrigem || '';
        processo.assuntosCNJ = processoData.assuntosCNJ || null;

        // Dados adicionais relevantes
        processo.tribunal = processoData.tribunal || '';
        processo.estado = processoData.uf || '';

        // Extrair o tipo do processo (classe processual)
        processo.tipo = processoData.classeProcessual?.nome || '';

        // Definir status do processo
        if (processoData.status && typeof processoData.status === 'object') {
          processo.status = processoData.status.statusProcesso || '';
        } else {
          processo.status = 'EM TRAMITACAO'; // Status padrão
        }

        // Identificar assunto principal dos assuntosCNJ
        if (processoData.assuntosCNJ && processoData.assuntosCNJ.length > 0) {
          const assuntoPrincipal = processoData.assuntosCNJ.find(
            (a) => a.ePrincipal,
          );
          if (assuntoPrincipal) {
            processo.assuntoPrincipal = assuntoPrincipal.titulo;
          }
        }

        // Salvar partes do processo
        processo.partes = processoData.partes || null;

        // Salvar o processo no banco de dados
        const savedProcesso = await this.processoRepository.save(processo);
        savedProcessos.push(savedProcesso);
      }
    }

    return savedProcessos;
  }

  async completeRegistration(
    userId: number,
    data: { nome: string; endereco: CreateEnderecoDto },
    foto?: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Atualizar nome do usuário
    const [firstName, ...lastNameParts] = data.nome.split(' ');
    user.firstName = firstName;
    user.lastName = lastNameParts.join(' ');

    // Salvar foto, se fornecida
    if (foto) {
      const fotoPath = await this.fileStorageService.saveFile(
        foto,
        'user-photos',
      );
      user.fotoPath = fotoPath;
    }

    // Salvar endereço
    await this.enderecoService.create(data.endereco, userId);

    // Atualizar usuário no banco
    await this.userRepository.save(user);

    return { message: 'Cadastro concluído com sucesso' };
  }

  async updateProfile(
    userId: number,
    data: { nome?: string; endereco?: CreateEnderecoDto },
    foto?: Express.Multer.File,
  ) {
    console.log('Dados recebidos para atualização:', data, foto);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Atualizar nome se fornecido
    if (data.nome) {
      const [firstName, ...lastNameParts] = data.nome.split(' ');
      user.firstName = firstName;
      user.lastName = lastNameParts.join(' ');
    }

    // Atualizar foto se fornecida
    if (foto) {
      // Se já existe uma foto, deletar a antiga
      if (user.fotoPath) {
        await this.fileStorageService.deleteFile(user.fotoPath);
      }
      const fotoPath = await this.fileStorageService.saveFile(
        foto,
        'user-photos',
      );
      user.fotoPath = fotoPath;
    }

    // Atualizar endereço se fornecido
    if (data.endereco) {
      // Buscar endereço existente
      const enderecoExistente = await this.enderecoService.findByUser(userId);

      if (enderecoExistente && enderecoExistente.length > 0) {
        // Atualizar endereço existente
        await this.enderecoService.update(
          enderecoExistente[0].id,
          data.endereco,
        );
      } else {
        // Criar novo endereço se não existe
        await this.enderecoService.create(data.endereco, userId);
      }
    }

    // Salvar alterações do usuário
    await this.userRepository.save(user);

    return { message: 'Perfil atualizado com sucesso' };
  }

  private generateVerificationCode(): string {
    // Gera um código numérico de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async fetchProcessosJudiciais(
    userId: number,
    cpf: string,
  ): Promise<ProcessoJudicial[]> {
    try {
      // Verificar se o usuário existe
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
      }

      // Token da API Netrin (idealmente deveria estar em variáveis de ambiente)
      const token = process.env.NETRIN_TOKEN;
      const url = `https://api.netrin.com.br/v1/consulta-composta?token=${token}&s=processos-full&cpf=${cpf}`;

      // Fazer a requisição para a API Netrin
      try {
        const response = await axios.get(url);
        console.log('Resposta da API Netrin:', response.data);

        // Salvar os processos retornados
        if (response.data) {
          return this.saveProcessosJudiciais(userId, response.data);
        }

        return [];
      } catch (error) {
        console.error('Erro ao buscar processos judiciais:', error);
        // Não lançar erro para não interromper o fluxo de criação do usuário
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar processos judiciais:', error);
      // Não lançar erro para não interromper o fluxo de criação do usuário
      return [];
    }
  }
}
