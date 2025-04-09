import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Portador } from './entities/portador.entity';
import { Endereco } from './entities/endereco.entity';
import { RegisteredUser } from '../user/entity/user.entity';
import { PortadorService } from './services/portador.service';
import { PortadorController } from './controllers/portador.controller';
import { FileStorageService } from './services/file-storage.service';
import { EnderecoService } from './services/endereco.service';
import { EnderecoController } from './controllers/endereco.controller';
import { GeocodingService } from './services/geocoding.service';
import { EmailModule } from '../email/email.module'; // Importe o módulo, não o serviço diretamente
import { ProcessoJudicial } from 'src/user/entity/processo-judicial.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portador,
      RegisteredUser,
      Endereco,
      ProcessoJudicial,
    ]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    EmailModule, // Adicione o EmailModule aos imports
  ],
  controllers: [PortadorController, EnderecoController],
  providers: [
    PortadorService,
    FileStorageService,
    EnderecoService,
    GeocodingService,
    // Remova o EmailService daqui, pois ele será fornecido pelo EmailModule
  ],
  exports: [PortadorService, EnderecoService, FileStorageService],
})
export class PortadorModule {}
