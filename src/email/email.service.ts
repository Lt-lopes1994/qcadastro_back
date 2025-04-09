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

  async sendDocumentApprovedEmail(
    to: string,
    data: { nome: string; tipoDocumento: string },
  ): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://qualityentregas.com.br/wp-content/uploads/2023/09/Ativo-2.png" alt="Quality Entregas Logo" style="max-width: 200px;">
        </div>
        <h2 style="color: #4CAF50; text-align: center;">Documentos Aprovados!</h2>
        <p>Olá, <strong>${data.nome}</strong>!</p>
        <p>Temos boas notícias para você! Seus <strong>${data.tipoDocumento}</strong> foram analisados e <strong>APROVADOS</strong> pela nossa equipe.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px;">Agora você está apto a iniciar suas atividades em nossa plataforma.</p>
        </div>
        
        <p>Em breve nossa equipe entrará em contato para orientá-lo sobre os próximos passos. Se tiver alguma dúvida, não hesite em nos contatar.</p>
        
        <p>Data de aprovação: <strong>${new Date().toLocaleDateString('pt-BR')}</strong></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0;">Atenciosamente,</p>
          <p style="margin: 5px 0;"><strong>Equipe Quality Entregas</strong></p>
        </div>
      </div>
    `;

    const plainText = `Documentos Aprovados!\n\nOlá, ${data.nome}!\n\nTemos boas notícias para você! Seus ${data.tipoDocumento} foram analisados e APROVADOS pela nossa equipe.\n\nAgora você está apto a iniciar suas atividades em nossa plataforma.\n\nEm breve nossa equipe entrará em contato para orientá-lo sobre os próximos passos. Se tiver alguma dúvida, não hesite em nos contatar.\n\nData de aprovação: ${new Date().toLocaleDateString('pt-BR')}\n\nAtenciosamente,\nEquipe Quality Entregas`;

    const payload = {
      api_user: this.apiUser,
      api_key: this.apiKey,
      to: [
        {
          email: to,
          name: data.nome || to.split('@')[0],
        },
      ],
      from: {
        name: this.fromName,
        email: this.fromEmail,
        reply_to: this.replyTo,
      },
      subject: `Seus ${data.tipoDocumento} foram Aprovados - Quality Entregas`,
      html: htmlContent,
      text: plainText,
      campanhaid: `documento-aprovado-${new Date().getTime()}`,
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
      throw new Error('Falha ao enviar email de aprovação de documentos');
    }
  }

  async sendDocumentRejectedEmail(
    to: string,
    data: { nome: string; tipoDocumento: string; motivo: string },
  ): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://qualityentregas.com.br/wp-content/uploads/2023/09/Ativo-2.png" alt="Quality Entregas Logo" style="max-width: 200px;">
        </div>
        <h2 style="color: #F44336; text-align: center;">Infelizmente seu cadastro não foi aprovado!</h2>
        <p>Olá, <strong>${data.nome}</strong>!</p>
        <p>Infelizmente, seus <strong>${data.tipoDocumento}</strong> foram analisados e não atenderam aos critérios necessários para aprovação.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #F44336; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px;"><strong>Motivo:</strong> ${data.motivo}</p>
        </div>
        
        <p>Por favor, faça as correções necessárias e submeta novamente seus documentos através da plataforma. Caso tenha dúvidas sobre o procedimento ou precise de ajuda, entre em contato com nossa equipe de suporte.</p>
        
        <p>Data da análise: <strong>${new Date().toLocaleDateString('pt-BR')}</strong></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0;">Atenciosamente,</p>
          <p style="margin: 5px 0;"><strong>Equipe Quality Entregas</strong></p>
        </div>
      </div>
    `;

    const plainText = `Documentos Precisam de Revisão\n\nOlá, ${data.nome}!\n\nSeus ${data.tipoDocumento} foram analisados pela nossa equipe e precisam de algumas correções.\n\nMotivo: ${data.motivo}\n\nPor favor, faça as correções necessárias e submeta novamente seus documentos através da plataforma. Caso tenha dúvidas sobre o procedimento ou precise de ajuda, entre em contato com nossa equipe de suporte.\n\nData da análise: ${new Date().toLocaleDateString('pt-BR')}\n\nAtenciosamente,\nEquipe Quality Entregas`;

    const payload = {
      api_user: this.apiUser,
      api_key: this.apiKey,
      to: [
        {
          email: to,
          name: data.nome || to.split('@')[0],
        },
      ],
      from: {
        name: this.fromName,
        email: this.fromEmail,
        reply_to: this.replyTo,
      },
      subject: `Seus ${data.tipoDocumento} precisam de revisão - Quality Entregas`,
      html: htmlContent,
      text: plainText,
      campanhaid: `documento-rejeitado-${new Date().getTime()}`,
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
      throw new Error('Falha ao enviar email de rejeição de documentos');
    }
  }
}
