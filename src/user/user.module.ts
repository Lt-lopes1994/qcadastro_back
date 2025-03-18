import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { SecurityModule } from '../security/security.module'; // Importe o SecurityModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    SmsModule,
    SecurityModule, // Adicione o SecurityModule aqui
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
