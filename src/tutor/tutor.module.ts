import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';
import { Tutor } from './entities/tutor.entity';
import { Tutelado } from './entities/tutelado.entity';
import { RegisteredUser } from '../user/entity/user.entity';
import { Veiculo } from '../cadastro-veiculo/entities/veiculo.entity';
import { EmailModule } from 'src/email/email.module';
import { Empresa } from '../empresa/entities/empresa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tutor,
      Tutelado,
      RegisteredUser,
      Veiculo,
      Empresa,
    ]),
    EmailModule,
  ],
  controllers: [TutorController],
  providers: [TutorService],
  exports: [TutorService],
})
export class TutorModule {}
