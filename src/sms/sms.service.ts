/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client;

  constructor() {
    // Configure com suas credenciais Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID || 'seu_account_sid';
    const authToken = process.env.TWILIO_AUTH_TOKEN || 'seu_auth_token';
    this.client = twilio(accountSid, authToken);
  }

  async sendVerificationSms(phoneNumber: string, code: string): Promise<void> {
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+15555555555';

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
