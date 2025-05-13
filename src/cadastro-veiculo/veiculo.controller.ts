/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { Veiculo } from './entities/veiculo.entity';
import { VeiculoService } from './veiculo.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { DesativarVeiculoDto } from './dto/desativar-veiculo.dto';

@ApiTags('veiculos')
@ApiBearerAuth()
@Controller('veiculos')
@UseGuards(JwtAuthGuard)
export class VeiculoController {
  constructor(private readonly veiculoService: VeiculoService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo veículo' })
  @ApiResponse({ status: 201, description: 'Veículo cadastrado com sucesso' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'crlvImagem', maxCount: 1 },
        { name: 'anttImagem', maxCount: 1 },
        { name: 'fotoFrente', maxCount: 1 },
        { name: 'fotoTras', maxCount: 1 },
        { name: 'fotoLateralEsquerda', maxCount: 1 },
        { name: 'fotoLateralDireita', maxCount: 1 },
        { name: 'fotoTrasAberto', maxCount: 1 },
        { name: 'fotoBauFechado', maxCount: 1 },
        { name: 'fotoBauAberto', maxCount: 1 },
      ],
      {
        storage: memoryStorage(), // Usar memoryStorage em vez de diskStorage
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB máximo por arquivo
        },
      },
    ),
  )
  async create(
    @Body() rawData: any, // modificamos para receber os dados brutos
    @Req() request: UserRequest,
    @UploadedFiles()
    files: {
      crlvImagem?: Express.Multer.File[];
      anttImagem?: Express.Multer.File[];
      fotoFrente?: Express.Multer.File[];
      fotoTras?: Express.Multer.File[];
      fotoLateralEsquerda?: Express.Multer.File[];
      fotoLateralDireita?: Express.Multer.File[];
      fotoTrasAberto?: Express.Multer.File[];
      fotoBauFechado?: Express.Multer.File[];
      fotoBauAberto?: Express.Multer.File[];
    },
  ): Promise<Veiculo> {
    // Processar os arquivos
    const images = {
      crlvImagem: files.crlvImagem?.[0],
      anttImagem: files.anttImagem?.[0],
      fotoFrente: files.fotoFrente?.[0],
      fotoTras: files.fotoTras?.[0],
      fotoLateralEsquerda: files.fotoLateralEsquerda?.[0],
      fotoLateralDireita: files.fotoLateralDireita?.[0],
      fotoTrasAberto: files.fotoTrasAberto?.[0],
      fotoBauFechado: files.fotoBauFechado?.[0],
      fotoBauAberto: files.fotoBauAberto?.[0],
    };

    console.log('Detalhes das imagens recebidas:');
    for (const key in files) {
      if (files[key] && files[key][0]) {
        const file = files[key][0];
        console.log(
          `${key}: ${file.originalname}, mimetype: ${file.mimetype}, size: ${file.size}B, buffer: ${!!file.buffer}`,
        );
      }
    }

    // Converter a string JSON para objeto
    let createVeiculoDto: CreateVeiculoDto;
    try {
      createVeiculoDto = {
        placa: rawData.placa,
        veiculoPlaca:
          typeof rawData.veiculoPlaca === 'string'
            ? JSON.parse(rawData.veiculoPlaca)
            : rawData.veiculoPlaca,
        tuteladoDesignadoId: rawData.tuteladoDesignadoId
          ? parseInt(rawData.tuteladoDesignadoId, 10)
          : undefined,
      };
    } catch (error) {
      throw new BadRequestException(
        'Formato de dados inválido: ' + error.message,
      );
    }

    const userId = request.user.id;
    return this.veiculoService.create(createVeiculoDto, userId, images);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos' })
  async findAll(@Req() request: UserRequest): Promise<Veiculo[]> {
    // Apenas administradores podem ver todos os veículos
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar todos os veículos',
      );
    }
    return this.veiculoService.findAll();
  }

  @Get('tutor')
  @ApiOperation({ summary: 'Listar veículos do tutor' })
  async findByTutor(
    @Req() request: UserRequest,
    @Query('ativo') ativo?: string, // Parâmetro de query opcional
  ): Promise<Veiculo[]> {
    const userId = request.user.id;
    // Buscar o tutor associado ao usuário
    const tutor = await this.veiculoService['tutorRepository'].findOne({
      where: { userId },
    });

    if (!tutor) {
      throw new ForbiddenException('Você não está registrado como tutor');
    }

    // Se ativo não for especificado, traz todos
    // Se for especificado, converte para boolean
    let ativoFilter: boolean | undefined;
    if (ativo !== undefined) {
      ativoFilter = ativo.toLowerCase() === 'true';
    }

    return this.veiculoService.findByTutor(tutor.id, ativoFilter);
  }

  @Get('tutelado')
  @ApiOperation({ summary: 'Listar veículos designados ao tutelado' })
  async findByTutelado(@Req() request: UserRequest): Promise<Veiculo[]> {
    const userId = request.user.id;
    // Buscar o tutelado associado ao usuário
    const tutelado = await this.veiculoService['tuteladoRepository'].findOne({
      where: { userId },
    });

    if (!tutelado) {
      throw new ForbiddenException('Você não está registrado como tutelado');
    }

    return this.veiculoService.findByTutelado(tutelado.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar veículo por ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ): Promise<Veiculo> {
    const veiculo = await this.veiculoService.findOne(id);

    const userId = request.user.id;
    // Verificar permissões (admin, tutor ou tutelado designado)
    if (request.user.role !== 'admin') {
      const tutor = await this.veiculoService['tutorRepository'].findOne({
        where: { userId },
      });

      const tutelado = await this.veiculoService['tuteladoRepository'].findOne({
        where: { userId },
      });

      if (!tutor || tutor.id !== veiculo.tutorId) {
        if (!tutelado || tutelado.id !== veiculo.tuteladoDesignadoId) {
          throw new ForbiddenException(
            'Você não tem permissão para acessar este veículo',
          );
        }
      }
    }

    return veiculo;
  }

  @Post(':id/designar-tutelado/:tuteladoId')
  @ApiOperation({ summary: 'Designar veículo para um tutelado' })
  async designarTutelado(
    @Param('id', ParseIntPipe) veiculoId: number,
    @Param('tuteladoId', ParseIntPipe) tuteladoId: number,
    @Req() request: UserRequest,
  ): Promise<Veiculo> {
    const userId = request.user.id;
    // Verificar se o usuário é um tutor
    const tutor = await this.veiculoService['tutorRepository'].findOne({
      where: { userId },
    });

    if (!tutor && request.user.role !== 'admin') {
      throw new ForbiddenException('Apenas tutores podem designar veículos');
    }

    return this.veiculoService.designarTutelado(
      veiculoId,
      tuteladoId,
      tutor ? tutor.id : 0, // Se for admin, passar 0 como ID do tutor
    );
  }

  @Post(':id/desvincular-tutelado')
  @ApiOperation({ summary: 'Desvincular veículo de um tutelado' })
  async desvincularTutelado(
    @Param('id', ParseIntPipe) veiculoId: number,
    @Req() request: UserRequest,
  ): Promise<Veiculo> {
    // Verificar permissões (apenas admin ou tutor dono do veículo)
    const userId = request.user.id;

    if (request.user.role !== 'admin') {
      const tutor = await this.veiculoService['tutorRepository'].findOne({
        where: { userId },
      });

      const veiculo = await this.veiculoService.findOne(veiculoId);

      if (!tutor || tutor.id !== veiculo.tutorId) {
        throw new ForbiddenException(
          'Você não tem permissão para desvincular este veículo',
        );
      }
    }

    const veiculoAtualizado =
      await this.veiculoService.desvincularTutelado(veiculoId);
    console.log('Veículo após desvinculação:', veiculoAtualizado);
    return veiculoAtualizado;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover veículo' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ): Promise<void> {
    const userId = request.user.id;

    // Verificar permissões
    if (request.user.role !== 'admin') {
      const tutor = await this.veiculoService['tutorRepository'].findOne({
        where: { userId },
      });

      if (!tutor) {
        throw new ForbiddenException('Apenas tutores podem remover veículos');
      }

      return this.veiculoService.remove(id, tutor.id);
    }

    // Se for admin, pode remover qualquer veículo
    // em banco de dados, id 0 opera como admin
    return this.veiculoService.remove(id, 0);
  }

  @Post(':id/desativar')
  @ApiOperation({ summary: 'Desativar veículo' })
  @ApiBody({ type: DesativarVeiculoDto })
  async desativarVeiculo(
    @Param('id', ParseIntPipe) id: number,
    @Body() desativarDto: DesativarVeiculoDto,
    @Req() request: UserRequest,
  ): Promise<Veiculo> {
    // Verificar permissões (apenas admin ou tutor dono do veículo)
    const userId = request.user.id;

    if (request.user.role !== 'admin') {
      const tutor = await this.veiculoService['tutorRepository'].findOne({
        where: { userId },
      });

      const veiculo = await this.veiculoService.findOne(id);

      if (!tutor || tutor.id !== veiculo.tutorId) {
        throw new ForbiddenException(
          'Você não tem permissão para desativar este veículo',
        );
      }
    }

    return this.veiculoService.desativarVeiculo(id, desativarDto.motivo);
  }

  @Post(':id/ativar')
  @ApiOperation({ summary: 'Ativar veículo' })
  async ativarVeiculo(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ): Promise<Veiculo> {
    // Verificar permissões (apenas admin ou tutor dono do veículo)
    const userId = request.user.id;

    if (request.user.role !== 'admin') {
      const tutor = await this.veiculoService['tutorRepository'].findOne({
        where: { userId },
      });

      const veiculo = await this.veiculoService.findOne(id);

      if (!tutor || tutor.id !== veiculo.tutorId) {
        throw new ForbiddenException(
          'Você não tem permissão para ativar este veículo',
        );
      }
    }

    return this.veiculoService.ativarVeiculo(id);
  }
}
