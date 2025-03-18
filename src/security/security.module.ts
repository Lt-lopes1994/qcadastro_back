import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { BruteForceProtectionService } from './brute-force-protection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedIp } from './entities/blocked-ip.entity';
import { LoginAttempt } from './entities/login-attempt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedIp, LoginAttempt])],
  providers: [SecurityService, BruteForceProtectionService],
  exports: [SecurityService, BruteForceProtectionService],
})
export class SecurityModule {}
