import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import { spawn } from 'child_process';

@Injectable()
export class CertificateMonitorService {
  private readonly logger = new Logger(CertificateMonitorService.name);
  private readonly certPath: string;

  constructor(private configService: ConfigService) {
    this.certPath = this.configService.get<string>('CENPROT_CERT_PATH') || '';
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkCertificateValidity() {
    if (!this.certPath || !fs.existsSync(this.certPath)) {
      this.logger.warn('Certificado Cenprot não encontrado ou não configurado');
      return;
    }

    try {
      // Executar openssl para verificar a validade do certificado
      const openssl = spawn('openssl', [
        'pkcs12',
        '-info',
        '-in',
        this.certPath,
        '-nokeys',
        '-passin',
        `pass:${this.configService.get<string>('CENPROT_CERT_PASSWORD')}`,
      ]);

      let output = '';
      openssl.stdout.on('data', (data) => {
        output += data.toString();
      });

      openssl.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Erro ao verificar certificado: código ${code}`);
          return;
        }

        // Extrair datas do certificado
        const notAfterMatch = output.match(/notAfter=(.+)/);
        if (notAfterMatch && notAfterMatch[1]) {
          const expiryDate = new Date(notAfterMatch[1]);
          const today = new Date();
          const daysRemaining = Math.floor(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysRemaining <= 30) {
            this.logger.warn(
              `O certificado Cenprot expirará em ${daysRemaining} dias. Por favor, renove-o.`,
            );
            // Aqui você pode implementar notificações por email para os administradores
          } else {
            this.logger.log(
              `Certificado Cenprot válido por mais ${daysRemaining} dias.`,
            );
          }
        }
      });
    } catch (error) {
      this.logger.error('Erro ao verificar validade do certificado:', error);
    }
  }
}
