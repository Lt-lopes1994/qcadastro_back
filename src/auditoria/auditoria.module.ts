import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaAcao } from './entities/auditoria-acao.entity';
import { TutorModule } from '../tutor/tutor.module';
import { Tutelado } from '../tutor/entities/tutelado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditoriaAcao, Tutelado]),
    forwardRef(() => TutorModule), // Usar forwardRef para evitar dependência circular
  ],
  providers: [AuditoriaService],
  controllers: [AuditoriaController],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
