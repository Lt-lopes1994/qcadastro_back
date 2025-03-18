import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { BlockedIp } from './entities/blocked-ip.entity';
import { LoginAttempt } from './entities/login-attempt.entity';

@Injectable()
export class BruteForceProtectionService {
  private readonly MAX_FAILED_ATTEMPTS = 5; // Máximo de tentativas falhas
  private readonly BLOCK_DURATION_HOURS = 1; // Duração do bloqueio em horas

  constructor(
    @InjectRepository(BlockedIp)
    private blockedIpRepository: Repository<BlockedIp>,
    @InjectRepository(LoginAttempt)
    private loginAttemptRepository: Repository<LoginAttempt>,
  ) {}

  async isIpBlocked(ipAddress: string): Promise<boolean> {
    const now = new Date();

    // Verificar se o IP está bloqueado e o bloqueio ainda não expirou
    const blockedIp = await this.blockedIpRepository.findOne({
      where: {
        ipAddress,
        expiresAt: MoreThan(now),
      },
    });

    return !!blockedIp;
  }

  async recordLoginAttempt(
    ipAddress: string,
    username: string,
    successful: boolean,
  ): Promise<void> {
    // Registrar tentativa de login
    await this.loginAttemptRepository.save({
      ipAddress,
      username,
      successful,
      attemptedAt: new Date(),
    });

    // Se for uma tentativa falha, verificar se precisa bloquear o IP
    if (!successful) {
      await this.checkAndBlockIp(ipAddress, username);
    }
  }

  private async checkAndBlockIp(
    ipAddress: string,
    username: string,
  ): Promise<void> {
    // Verificar o número de tentativas falhas recentes
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentFailedAttempts = await this.loginAttemptRepository.count({
      where: {
        ipAddress,
        username,
        successful: false,
        attemptedAt: MoreThan(oneHourAgo),
      },
    });

    // Se exceder o limite, bloquear o IP
    if (recentFailedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.BLOCK_DURATION_HOURS);

      await this.blockedIpRepository.save({
        ipAddress,
        reason: `Excedido limite de ${this.MAX_FAILED_ATTEMPTS} tentativas falhas de login para o usuário ${username}`,
        blockedAt: new Date(),
        expiresAt,
      });
    }
  }
}
