import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
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
import { Veiculo } from './cadastro-veiculo/entities/veiculo.entity';
import { CadastroVeiculoModule } from './cadastro-veiculo/cadastro-veiculo.module';
import { EmpresaModule } from './empresa/empresa.module';
import { Empresa } from './empresa/entities/empresa.entity';
import { DadosBancarios } from './empresa/entities/dados-bancarios.entity';
import { ProcessosJudiciaisModule } from './processos-judiciais/processos-judiciais.module';
import { LoggerModule } from './logger/logger.module';
import { SystemLog } from './logger/entities/system-log.entity';
import { AdminModule } from './admin/admin.module';

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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          RegisteredUser,
          BlockedIp,
          LoginAttempt,
          Portador,
          ProcessoJudicial,
          Endereco,
          Veiculo,
          Empresa,
          DadosBancarios,
          SystemLog,
        ],
        logging: true,
        synchronize: false,
        timezone: '+03:00',
        extra: {
          connectionLimit: 10,
          charset: 'utf8mb4',
          supportBigNumbers: true,
          bigNumberStrings: true,
        },
      }),
    }),
    UserModule,
    EmailModule,
    SmsModule,
    SecurityModule,
    PortadorModule,
    AuthModule,
    CadastroVeiculoModule,
    EmpresaModule,
    ProcessosJudiciaisModule,
    LoggerModule,
    AdminModule,
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
