import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService, ConfigModule } from '@nestjs/config';
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
import { RolesGuard } from './security/guards/roles.guard';
import { PesquisaNetrinModule } from './pesquisa-netrin/pesquisa-netrin.module';
import { TutorModule } from './tutor/tutor.module';
import { Tutor } from './tutor/entities/tutor.entity';
import { Tutelado } from './tutor/entities/tutelado.entity';
import { SolicitacaoVinculo } from './tutor/entities/solicitacao-vinculo.entity';
import { CapacidadeCargaModule } from './capacidade-carga/capacidade-carga.module';
import { CapacidadeCarga } from './capacidade-carga/entities/capacidade-carga.entity';
import { TutorEmpresa } from './tutor/entities/tutor-empresa.entity';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuditoriaAcao } from './auditoria/entities/auditoria-acao.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppConfigModule,
    // Proteção contra ataques de força bruta e DDoS
    ThrottlerModule.forRoot([
      {
        ttl: 60, // tempo em segundos
        limit: 10, // número máximo de requisições
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'), // Alterado de DB_USERNAME para DB_USER
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'), // Alterado de DB_DATABASE para DB_NAME
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
          Tutor,
          Tutelado,
          SolicitacaoVinculo,
          CapacidadeCarga,
          TutorEmpresa,
          AuditoriaAcao, // Certifique-se que esta entidade está incluída
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
        timezone: '+03:00',
        extra: {
          connectionLimit: 10,
          charset: 'utf8mb4',
          // Adicionar esta configuração para resolver o aviso do sha256_password
          authPlugins: {
            mysql_native_password: () => ({}),
          },
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
    PesquisaNetrinModule,
    TutorModule,
    CapacidadeCargaModule,
    AuditoriaModule,
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
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
