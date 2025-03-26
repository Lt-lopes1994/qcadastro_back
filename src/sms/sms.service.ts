/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client;

  constructor(private configService: ConfigService) {
    // Configurar com credenciais Twilio do ambiente apropriado
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.client = twilio(accountSid, authToken);
  }

  async sendVerificationSms(phoneNumber: string, code: string): Promise<void> {
    const twilioPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await this.client.messages.create({
        body: `Seu código de verificação QCadastro é: ${code}`,
        from: twilioPhone,
        to: `+55${phoneNumber}`,
      });
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      throw new Error('Falha ao enviar SMS de verificação');
    }
  }
}
