import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';
import { SecurityModule } from './security/security.module';
import { RegisteredUser } from './user/entity/user.entity';
import { ProcessoJudicial } from './user/entity/processo-judicial.entity';
import { BlockedIp } from './security/entities/blocked-ip.entity';
import { LoginAttempt } from './security/entities/login-attempt.entity';
import { PortadorModule } from './portador/portador.module';
import { Portador } from './portador/entities/portador.entity';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './security/guards/jwt-auth.guard';
import { Endereco } from './portador/entities/endereco.entity';
import { ClickSignModule } from './click-sign/click-sign.module';
import { DocumentEntity } from './click-sign/entities/document.entity';

@Module({
  imports: [
    AppConfigModule,
    // Proteção contra ataques de força bruta e DDoS
    ThrottlerModule.forRoot([
      {
        ttl: 60, // tempo em segundos
        limit: 10, // número máximo de requisições
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        RegisteredUser,
        BlockedIp,
        LoginAttempt,
        Portador,
        ProcessoJudicial,
        Endereco,
        DocumentEntity,
      ],
      logging: true,
      synchronize: false,
    }),
    UserModule,
    EmailModule,
    SmsModule,
    SecurityModule,
    PortadorModule,
    AuthModule,
    ClickSignModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Registrar o ThrottlerGuard como um guard global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Registrar o JwtAuthGuard como um guard global
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
