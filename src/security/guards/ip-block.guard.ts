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
    const rawIpAddress =
      request.ip ||
      request.connection.remoteAddress ||
      request.headers['x-forwarded-for'];

    const ipAddress = Array.isArray(rawIpAddress)
      ? rawIpAddress[0]
      : rawIpAddress || '0.0.0.0';

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
