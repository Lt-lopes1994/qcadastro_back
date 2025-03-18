import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure com suas credenciais de SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'seu-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'sua-senha-app',
      },
    });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'QCadastro <noreply@qcadastro.com>',
      to,
      subject: 'Código de Verificação - QCadastro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Verificação de Email</h2>
          <p>Olá,</p>
          <p>Seu código de verificação é:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código é válido por 30 minutos.</p>
          <p>Se você não solicitou este código, ignore este email.</p>
          <p>Atenciosamente,<br>Equipe QCadastro</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new Error('Falha ao enviar email de verificação');
    }
  }
}
