import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { BruteForceProtectionService } from './brute-force-protection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginAttempt } from './entities/login-attempt.entity';
import { BlockedIp } from './entities/blocked-ip.entity';
import { CertificateManagerService } from './certificate-manager.service';
import { PermissionsService } from './services/permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoginAttempt, BlockedIp])],
  providers: [
    SecurityService,
    BruteForceProtectionService,
    CertificateManagerService,
    PermissionsService,
  ],
  exports: [
    SecurityService,
    BruteForceProtectionService,
    CertificateManagerService,
    PermissionsService,
  ],
})
export class SecurityModule {}
