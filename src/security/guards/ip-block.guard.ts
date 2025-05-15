import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { BruteForceProtectionService } from '../brute-force-protection.service';
import { Request } from 'express';

@Injectable()
export class IpBlockGuard implements CanActivate {
  constructor(
    private bruteForceProtectionService: BruteForceProtectionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Lógica melhorada para obter o IP real
    let ipAddress = request.ip; // Agora o Express já fornece o IP correto quando trust proxy está habilitado

    // Fallback para casos onde o request.ip não funciona
    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1') {
      const forwardedFor = request.headers['x-forwarded-for'];
      if (forwardedFor) {
        ipAddress = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor.split(',')[0].trim();
      } else if (request.headers['x-real-ip']) {
        ipAddress = request.headers['x-real-ip'] as string;
      } else {
        ipAddress = request.connection.remoteAddress || '0.0.0.0';
      }
    }

    const isBlocked =
      await this.bruteForceProtectionService.isIpBlocked(ipAddress);

    if (isBlocked) {
      throw new ForbiddenException(
        'Acesso temporariamente bloqueado devido a múltiplas tentativas falhas',
      );
    }

    return true;
  }
}
