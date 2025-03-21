/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
      await this.emailService.sendVerificationEmail(
        userData.email,
        emailVerificationCode,
      );
    }

    if (userData.phoneNumber) {
      await this.smsService.sendVerificationSms(
        userData.phoneNumber,
        phoneVerificationCode,
      );
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
  ): Promise<any> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se o CPF corresponde ao usuário
    if (user.cpf !== netrinData.cpf) {
      throw new BadRequestException(
        'O CPF informado não corresponde ao usuário',
      );
    }

    // Atualizar o status do CPF no usuário
    user.cpfStatus = 'VERIFICADO';
    await this.userRepository.save(user);

    // Salvar cada processo judicial
    // Interface for the processo judicial data from Netrin
    interface ProcessoJudicialNetrinData {
      numero: string;
      dataNotificacao?: string;
      tipo: string;
      assuntoPrincipal: string;
      status: string;
      varaJulgadora: string;
      tribunal: string;
      tribunalLevel: string;
      tribunalTipo: string;
      tribunalCidade: string;
      estado: string;
      partes: any; // Using any since we don't know the exact structure
    }

    const processosPromises: Promise<ProcessoJudicial>[] =
      netrinData.processosCPF.processos.map(
        async (
          processo: ProcessoJudicialNetrinData,
        ): Promise<ProcessoJudicial> => {
          const novoProcesso = new ProcessoJudicial();
          novoProcesso.numero = processo.numero;
          novoProcesso.dataNotificacao = processo.dataNotificacao
            ? new Date(processo.dataNotificacao)
            : (null as unknown as Date);
          novoProcesso.tipo = processo.tipo;
          novoProcesso.assuntoPrincipal = processo.assuntoPrincipal;
          novoProcesso.status = processo.status;
          novoProcesso.varaJulgadora = processo.varaJulgadora;
          novoProcesso.tribunal = processo.tribunal;
          novoProcesso.tribunalLevel = processo.tribunalLevel;
          novoProcesso.tribunalTipo = processo.tribunalTipo;
          novoProcesso.tribunalCidade = processo.tribunalCidade;
          novoProcesso.estado = processo.estado;
          novoProcesso.partes = processo.partes;
          novoProcesso.userId = userId;

          return this.processoRepository.save(novoProcesso);
        },
      );

    await Promise.all(processosPromises);

    return {
      message: 'Dados de processos judiciais salvos com sucesso',
      totalProcessos: netrinData.processosCPF.totalProcessos,
    };
  }

  private generateVerificationCode(): string {
    // Gera um código numérico de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Outros métodos para verificar CPF, etc.
}
