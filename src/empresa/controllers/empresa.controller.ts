/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/empresa/controllers/empresa.controller.ts
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmpresaService } from '../services/empresa.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { CreateDadosBancariosDto } from '../dto/create-dados-bancarios.dto';

@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body('empresa') empresaString: string,
    @Body('dadosBancarios') dadosBancariosString: string,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    try {
      const empresa: CreateEmpresaDto = JSON.parse(empresaString);
      const dadosBancarios: CreateDadosBancariosDto =
        JSON.parse(dadosBancariosString);

      return await this.empresaService.create(empresa, dadosBancarios, logo);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Dados JSON inválidos');
      }
      throw error;
    }
  }
}
