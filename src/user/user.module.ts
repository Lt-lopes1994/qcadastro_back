import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredUser } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegisteredUser]),
    EmailModule,
    SmsModule,
    SecurityModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
