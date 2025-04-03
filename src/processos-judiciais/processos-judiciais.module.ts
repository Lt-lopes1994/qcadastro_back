import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessoJudicial } from '../user/entity/processo-judicial.entity';
import { ProcessosJudiciaisController } from './controllers/processos-judicias.controller';
import { ProcessosJudiciaisService } from './services/processos-judiciais.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessoJudicial])],
  controllers: [ProcessosJudiciaisController],
  providers: [ProcessosJudiciaisService],
  exports: [ProcessosJudiciaisService],
})
export class ProcessosJudiciaisModule {}
