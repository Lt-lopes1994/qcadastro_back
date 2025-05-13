import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapacidadeCargaService } from './capacidade-carga.service';
import { CapacidadeCargaController } from './capacidade-carga.controller';
import { CapacidadeCarga } from './entities/capacidade-carga.entity';
import { Veiculo } from '../cadastro-veiculo/entities/veiculo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CapacidadeCarga, Veiculo])],
  controllers: [CapacidadeCargaController],
  providers: [CapacidadeCargaService],
  exports: [CapacidadeCargaService],
})
export class CapacidadeCargaModule {}
