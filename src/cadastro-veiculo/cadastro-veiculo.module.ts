import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veiculo } from './entities/veiculo.entity';
import { Portador } from '../portador/entities/portador.entity';
import { VeiculoController } from './veiculo.controller';
import { VeiculoService } from './veiculo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Veiculo, Portador])],
  controllers: [VeiculoController],
  providers: [VeiculoService],
  exports: [VeiculoService],
})
export class CadastroVeiculoModule {}
