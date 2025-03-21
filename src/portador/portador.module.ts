import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Portador } from './entities/portador.entity';
import { PortadorService } from './services/portador.service';
import { PortadorController } from './controllers/portador.controller';
import { FileStorageService } from './services/file-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portador]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [PortadorController],
  providers: [PortadorService, FileStorageService],
  exports: [PortadorService],
})
export class PortadorModule {}
