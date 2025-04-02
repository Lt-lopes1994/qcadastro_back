// src/empresa/controllers/empresa.controller.ts
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmpresaService } from '../services/empresa.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { CreateDadosBancariosDto } from '../dto/create-dados-bancarios.dto';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { UserRequest } from '../../user/interfaces/user-request.interface';
import { Empresa } from '../entities/empresa.entity';

@Controller('empresas')
@UseGuards(JwtAuthGuard)
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post('dados')
  async createDadosEmpresa(
    @Req() request: UserRequest,
    @Body() empresa: CreateEmpresaDto,
  ) {
    const userId = request.user.id;
    return await this.empresaService.createDadosEmpresa(empresa, userId);
  }

  @Post('dados-bancarios')
  async createDadosBancarios(
    @Req() request: UserRequest,
    @Body() dadosBancarios: CreateDadosBancariosDto,
  ) {
    const userId = request.user.id;
    return await this.empresaService.createDadosBancarios(
      dadosBancarios,
      userId,
    );
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Req() request: UserRequest,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const userId = request.user.id;
    return await this.empresaService.saveLogo(logo, userId);
  }

  @Get('user')
  async findByUser(@Req() request: UserRequest): Promise<Empresa[]> {
    const userId = request.user.id;
    return this.empresaService.findByUser(userId);
  }
}
