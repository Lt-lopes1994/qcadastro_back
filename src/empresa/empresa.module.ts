// src/empresa/empresa.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { EmpresaController } from './controllers/empresa.controller';
import { EmpresaService } from './services/empresa.service';
import { Empresa } from './entities/empresa.entity';
import { DadosBancarios } from './entities/dados-bancarios.entity';
import { SecurityModule } from '../security/security.module';
import { FileStorageService } from '../portador/services/file-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, DadosBancarios]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    SecurityModule,
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService, FileStorageService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
