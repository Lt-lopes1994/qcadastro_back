/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmailService {
  private readonly apiUser: string;
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly fromName: string;
  private readonly fromEmail: string;
  private readonly replyTo: string;

  constructor() {
    // Configurações do iagenteSMTP
    this.apiUser = process.env.IAGENTE_API_USER || 'qe@qualityentregas.com.br';
    this.apiKey =
      process.env.IAGENTE_API_KEY || 'c062a5c36b98f75b4188f969f517f3da';
    this.apiUrl =
      process.env.IAGENTE_API_URL ||
      'https://api.iagentesmtp.com.br/api/v3/send/';
    this.fromName = process.env.EMAIL_FROM_NAME || 'QCadastro';
    this.fromEmail =
      process.env.EMAIL_FROM_EMAIL || 'noreply@qualityentregas.com.br';
    this.replyTo = process.env.EMAIL_REPLY_TO || 'qe@qualityentregas.com.br';
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Verificação de Email</h2>
        <p>Olá,</p>
        <p>Seu código de verificação é:</p>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Este código é válido por 30 minutos.</p>
        <p>Se você não solicitou este código, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Quality Entregas</p>
      </div>
    `;

    const plainText = `Verificação de Email\n\nOlá,\n\nSeu código de verificação é: ${code}\n\nEste código é válido por 30 minutos.\n\nSe você não solicitou este código, ignore este email.\n\nAtenciosamente,\nEquipe Quality Entregas`;

    const payload = {
      api_user: this.apiUser,
      api_key: this.apiKey,
      to: [
        {
          email: to,
          name: to.split('@')[0], // Nome do destinatário baseado no email
        },
      ],
      from: {
        name: this.fromName,
        email: this.fromEmail,
        reply_to: this.replyTo,
      },
      subject: 'Código de Verificação - QCadastro',
      html: htmlContent,
      text: plainText,
      campanhaid: `verification-email-${new Date().getTime()}`, // Identificador único opcional
    };

    try {
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status !== 'ok') {
        throw new Error('Falha ao enviar email');
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new Error('Falha ao enviar email de verificação');
    }
  }
}
