import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CertificateManagerService {
  private readonly logger = new Logger(CertificateManagerService.name);
  private readonly certDirectory: string;

  constructor(private configService: ConfigService) {
    this.certDirectory = path.dirname(
      this.configService.get<string>('CENPROT_CERT_PATH') || '',
    );
  }

  /**
   * Atualiza o certificado com uma nova versão
   * @param newCertificateBuffer Buffer contendo o novo certificado
   * @param password Senha do novo certificado
   */
  async updateCertificate(
    newCertificateBuffer: Buffer,
    password: string,
  ): Promise<boolean> {
    if (!this.certDirectory) {
      this.logger.error('Diretório de certificados não configurado');
      return false;
    }

    try {
      // Backup do certificado atual
      const currentPath =
        this.configService.get<string>('CENPROT_CERT_PATH') || '';
      if (fs.existsSync(currentPath)) {
        const backupPath = `${currentPath}.backup-${Date.now()}`;
        fs.copyFileSync(currentPath, backupPath);
        this.logger.log(`Backup do certificado criado: ${backupPath}`);
      }

      // Salvar o novo certificado
      fs.writeFileSync(currentPath, newCertificateBuffer, { mode: 0o600 });

      // Atualizar a senha no ambiente (isto requer reinicialização da aplicação ou uma solução mais complexa)
      // Esta implementação é simplificada e pode precisar ser adaptada ao seu sistema
      this.logger.log(
        'Certificado atualizado com sucesso. A senha deve ser atualizada no arquivo .env',
      );

      return true;
    } catch (error) {
      this.logger.error('Falha ao atualizar o certificado:', error);
      return false;
    }
  }

  /**
   * Verifica se o certificado está configurado e acessível
   */
  async checkCertificateAccess(): Promise<boolean> {
    const certPath = this.configService.get<string>('CENPROT_CERT_PATH') || '';
    if (!certPath) {
      this.logger.error('Caminho do certificado não configurado');
      return false;
    }

    try {
      // Verificar se o arquivo existe e é acessível
      fs.accessSync(certPath, fs.constants.R_OK);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao acessar o certificado: ${error.message}`);
      return false;
    }
  }
}
