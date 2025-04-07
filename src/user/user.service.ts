/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  async resendVerificationCode(
    email: string,
    phoneNumber: string,
  ): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado com este email');
    }

    // Enviar o código de verificação por email
    await this.sendEmailVerificationCode(email);

    // Enviar o código de verificação por SMS
    await this.sendPhoneVerificationCode(phoneNumber);
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    const savedProcessos: ProcessoJudicial[] = [];
    const processos = netrinData.processosCPF?.processos || [];

    console.log(`Encontrados ${processos.length} processos para salvar`);

    if (processos.length > 0) {
      for (const processoData of processos) {
        try {
          const processo = new ProcessoJudicial();

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

          processo.tribunal = processoData.tribunal || '';
          processo.estado = processoData.uf || '';
          processo.tipo = processoData.classeProcessual?.nome || '';

          if (processoData.status && typeof processoData.status === 'object') {
            processo.status = processoData.status.statusProcesso || '';
          } else {
            processo.status = 'EM TRAMITACAO';
          }

          if (processoData.assuntosCNJ && processoData.assuntosCNJ.length > 0) {
            const assuntoPrincipal = processoData.assuntosCNJ.find(
              (a) => a.ePrincipal,
            );
            if (assuntoPrincipal) {
              processo.assuntoPrincipal = assuntoPrincipal.titulo;
            }
          }

          processo.partes = processoData.partes || null;

          console.log(`Salvando processo ${processo.numero}`);
          const savedProcesso = await this.processoRepository.save(processo);
          console.log(`Processo ${savedProcesso.id} salvo com sucesso`);

          savedProcessos.push(savedProcesso);
        } catch (error) {
          console.error(`Erro ao salvar processo:`, error);
        }
      }
    }

    console.log(`Total de processos salvos: ${savedProcessos.length}`);
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

  async filterNewUsers(
    startDate: Date,
    endDate: Date,
  ): Promise<RegisteredUser[]> {
    // Imprimir datas para debug
    console.log('Buscando usuários entre:', startDate, 'e', endDate);

    // Converter as datas para um formato consistente
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Garantir que o final do dia seja incluído (23:59:59.999)
    end.setHours(23, 59, 59, 999);

    console.log('Start ajustado:', start);
    console.log('End ajustado:', end);

    try {
      // Verificar usuários existentes para debug
      const allUsers = await this.userRepository.find();
      console.log(`Total de usuários no sistema: ${allUsers.length}`);

      if (allUsers.length > 0) {
        // Mostrar alguns exemplos de datas de criação para debug
        console.log(
          'Exemplos de createdAt:',
          allUsers.slice(0, 3).map((u) => u.createdAt),
        );
      }

      // Usar between para simplificar a consulta de data
      const users = await this.userRepository
        .createQueryBuilder('user')
        .where('DATE(user.createdAt) >= DATE(:startDate)', { startDate: start })
        .andWhere('DATE(user.createdAt) <= DATE(:endDate)', { endDate: end })
        .andWhere('user.role = :role', { role: 'user' })
        .orderBy('user.createdAt', 'DESC')
        .getMany();

      console.log(
        `Encontrados ${users.length} usuários entre ${start} e ${end}`,
      );
      return users;
    } catch (error) {
      console.error('Erro ao filtrar usuários por data:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<
    (Partial<RegisteredUser> & { processosCount: number })[]
  > {
    try {
      // Buscar todos os usuários
      const users = await this.userRepository.find();

      // Buscar a contagem de processos para cada usuário
      const usersWithProcessosCount = await Promise.all(
        users.map(async (user) => {
          // Contar processos judiciais para este usuário
          const processosCount = await this.processoRepository.count({
            where: { userId: user.id },
          });

          // Remover campos sensíveis e adicionar contagem de processos
          const {
            password,
            passwordResetToken,
            emailVerificationCode,
            phoneVerificationCode,
            ...userData
          } = user;

          return {
            ...userData,
            processosCount,
          };
        }),
      );

      return usersWithProcessosCount;
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      throw error;
    }
  }

  async getUserById(userId: number): Promise<RegisteredUser | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
      }

      // Verificar se o usuário tem processos judiciais
      const processosFull = await this.processoRepository.find({
        where: { userId },
      });
      if (processosFull.length > 0) {
        user.processosFull = processosFull;
      } else {
        user.processosFull = [];
      }

      // Remover campos sensíveis
      const { password, ...userData } = user;

      return userData as RegisteredUser;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
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

      const token = process.env.NETRIN_TOKEN;
      const url = `https://api.netrin.com.br/v1/consulta-composta?token=${token}&s=processos-full&cpf=${cpf}`;

      try {
        const response = await axios.get(url);

        // Corrigir o acesso aos dados - a estrutura correta é response.data.processosFull
        if (
          response.data &&
          response.data.processosFull &&
          response.data.processosFull.processos
        ) {
          // Criar um objeto no formato esperado pelo saveProcessosJudiciais
          const processosData = {
            processosCPF: {
              processos: response.data.processosFull.processos,
            },
          };

          return this.saveProcessosJudiciais(userId, processosData);
        }

        return [];
      } catch (error) {
        console.error('Erro ao buscar processos judiciais:', error);
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar processos judiciais:', error);
      return [];
    }
  }
}
