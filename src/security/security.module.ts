import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { BruteForceProtectionService } from './brute-force-protection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginAttempt } from '../entities/login-attempt.entity';
import { CertificateMonitorService } from './certificate-monitor.service';
import { CertificateManagerService } from './certificate-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoginAttempt])],
  providers: [
    SecurityService,
    BruteForceProtectionService,
    CertificateMonitorService,
    CertificateManagerService,
  ],
  exports: [
    SecurityService,
    BruteForceProtectionService,
    CertificateManagerService,
  ],
})
export class SecurityModule {}
