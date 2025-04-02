/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private apiUser: string;
  private apiKey: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUser = this.configService.get<string>('IAGENTE_SMS_USER') ?? '';
    this.apiKey = this.configService.get<string>('IAGENTE_SMS_KEY') ?? '';
    this.apiUrl = this.configService.get<string>('IAGENTE_SMS_URL') ?? '';
  }

  async sendVerificationSms(phoneNumber: string, code: string): Promise<void> {
    try {
      const url = `${this.apiUrl}?metodo=envio&usuario=${this.apiUser}&senha=${this.apiKey}&celular=${phoneNumber.replace(/\D/g, '')}&mensagem=Seu código de verificação QCadastro é: ${code}
      Não compartilhe esse código com ninguém. Ele é exclusivo para você e tem validade de 30 minutos. Não responda a esse SMS.`;

      const response = await axios.get(url);

      // O iagenteSMS retorna um código numérico no response.data
      if (!response.data.startsWith('OK')) {
        throw new Error(`Erro no envio: ${response.data}`);
      }
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      throw new Error('Falha ao enviar SMS de verificação');
    }
  }
}
