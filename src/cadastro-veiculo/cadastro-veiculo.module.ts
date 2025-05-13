import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veiculo } from './entities/veiculo.entity';
import { Equipamento } from './entities/equipamento.entity';
import { Portador } from '../portador/entities/portador.entity';
import { VeiculoController } from './veiculo.controller';
import { VeiculoService } from './veiculo.service';
import { Tutor } from '../tutor/entities/tutor.entity';
import { Tutelado } from '../tutor/entities/tutelado.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuditoriaModule } from '../auditoria/auditoria.module'; // Importe o AuditoriaModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Veiculo, Equipamento, Portador, Tutor, Tutelado]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/veiculos',
        filename: (req, file, cb) => {
          // Gerar um nome de arquivo único baseado na data atual
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
    AuditoriaModule, // Adicione esta linha para importar o módulo
  ],
  controllers: [VeiculoController],
  providers: [VeiculoService],
  exports: [VeiculoService],
})
export class CadastroVeiculoModule {}
