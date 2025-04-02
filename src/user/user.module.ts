import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredUser } from './entity/user.entity';
import { ProcessoJudicial } from './entity/processo-judicial.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { SecurityModule } from '../security/security.module';
import { PortadorModule } from '../portador/portador.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegisteredUser, ProcessoJudicial]),
    EmailModule,
    SmsModule,
    SecurityModule,
    PortadorModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
