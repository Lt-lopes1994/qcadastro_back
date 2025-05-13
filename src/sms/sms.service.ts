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
    // Carregar as configurações e adicionar logs para depuração
    this.apiUser = this.configService.get<string>('IAGENTE_SMS_USER') ?? '';
    this.apiKey = this.configService.get<string>('IAGENTE_SMS_KEY') ?? '';
    this.apiUrl = this.configService.get<string>('IAGENTE_SMS_URL') ?? '';

    console.log('SMS Service Initialized:');
    console.log('- API User:', this.apiUser);
    console.log('- API Key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('- API URL:', this.apiUrl);

    // Se as configurações estiverem vazias, usar valores diretos
    if (!this.apiUser || !this.apiKey) {
      console.warn(
        'SMS credentials not found in environment, using hardcoded values',
      );
      this.apiUser = 'bruno.lopes@qualityentregas.com.br';
      this.apiKey = 'Master@312';
    }

    if (!this.apiUrl) {
      this.apiUrl = 'https://api.iagentesms.com.br/webservices/http.php';
    }
  }

  async sendVerificationSms(phoneNumber: string, code: string): Promise<void> {
    try {
      // Formatar a mensagem
      const mensagem = `Seu código de verificação QCadastro é: ${code}. Use no após o primeiro login para validação.`;

      // Codificar a mensagem para URL
      const mensagemCodificada = encodeURIComponent(mensagem);

      // Formatar o número de telefone (remover caracteres não numéricos)
      const celular = phoneNumber.replace(/\D/g, '');

      // Construir a URL exatamente como no exemplo que funciona
      const url = `${this.apiUrl}?metodo=envio&usuario=${encodeURIComponent(this.apiUser)}&senha=${encodeURIComponent(this.apiKey)}&celular=${celular}&mensagem=${mensagemCodificada}`;

      // Log da URL sem expor a senha
      const safeLogUrl = url.replace(encodeURIComponent(this.apiKey), '*****');
      console.log('Enviando SMS - URL:', safeLogUrl);

      // Fazer a requisição GET
      const response = await axios.get(url);

      console.log(`Resposta do SMS para ${phoneNumber}:`, response.data);

      // Verificar resposta - o iagenteSMS geralmente retorna "OK: [número]"
      if (
        !response.data ||
        (typeof response.data === 'string' && !response.data.startsWith('OK'))
      ) {
        throw new Error(`Erro na resposta do serviço: ${response.data}`);
      }
    } catch (error) {
      console.error('Erro detalhado ao enviar SMS:', error);
      throw new Error('Falha ao enviar SMS de verificação');
    }
  }
}
