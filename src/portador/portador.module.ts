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

@Module({
  imports: [
    TypeOrmModule.forFeature([Portador, RegisteredUser, Endereco]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [PortadorController, EnderecoController],
  providers: [
    PortadorService,
    FileStorageService,
    EnderecoService,
    GeocodingService,
  ],
  exports: [PortadorService, EnderecoService],
})
export class PortadorModule {}
