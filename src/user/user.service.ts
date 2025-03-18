import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    // Gerar códigos de verificação iniciais
    const emailVerificationCode = this.generateVerificationCode();
    const phoneVerificationCode = this.generateVerificationCode();

    // Configurar valores padrão
    const user = this.userRepository.create({
      ...userData,
      emailVerificationCode,
      emailVerified: false,
      phoneVerificationCode,
      phoneVerified: false,
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

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserByPhone(phoneNumber: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phoneNumber } });
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

  private generateVerificationCode(): string {
    // Gera um código numérico de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Outros métodos para verificar CPF, etc.
}
