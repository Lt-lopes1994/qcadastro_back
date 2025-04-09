import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { BruteForceProtectionService } from './brute-force-protection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedIp } from './entities/blocked-ip.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { PermissionsService } from './services/permissions.service';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedIp, LoginAttempt])],
  providers: [
    SecurityService,
    BruteForceProtectionService,
    PermissionsService,
    RolesGuard,
  ],
  exports: [
    SecurityService,
    BruteForceProtectionService,
    PermissionsService,
    RolesGuard,
  ],
})
export class SecurityModule {}
