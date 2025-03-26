import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { UserRequest } from 'src/user/interfaces/user-request.interface';
import type { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { Veiculo } from './entities/veiculo.entity';
import { VeiculoService } from './veiculo.service';

@Controller('veiculos')
@UseGuards(JwtAuthGuard)
export class VeiculoController {
  constructor(private readonly veiculoService: VeiculoService) {}

  @Post()
  async create(
    @Body() createVeiculoDto: CreateVeiculoDto,
    @Req() request: UserRequest,
  ): Promise<Veiculo> {
    // Obter o ID do usuário do token JWT
    const userId = request.user.id;
    return this.veiculoService.create(createVeiculoDto, userId);
  }

  @Get()
  async findAll(@Req() request: UserRequest): Promise<Veiculo[]> {
    // Apenas administradores podem ver todos os veículos
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar todos os veículos',
      );
    }
    return this.veiculoService.findAll();
  }

  @Get('user')
  async findByUser(@Req() request: UserRequest): Promise<Veiculo[]> {
    // Usuário pode ver seus próprios veículos
    const userId = request.user.id;
    return this.veiculoService.findByUser(userId);
  }

  @Get('portador/:portadorId')
  async findByPortador(
    @Param('portadorId', ParseIntPipe) portadorId: number,
    @Req() request: UserRequest,
  ): Promise<Veiculo[]> {
    // Verificar permissões - usuário só pode ver veículos de seus próprios portadores
    const veiculos = await this.veiculoService.findByPortador(portadorId);

    // Se não for admin, verifica se todos pertencem ao mesmo usuário
    if (request.user.role !== 'admin' && veiculos.length > 0) {
      if (veiculos[0].userId !== request.user.id) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar estes veículos',
        );
      }
    }

    return veiculos;
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ): Promise<Veiculo> {
    const veiculo = await this.veiculoService.findOne(id);

    // Verificar permissões
    if (request.user.role !== 'admin' && veiculo.userId !== request.user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este veículo',
      );
    }

    return veiculo;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVeiculoDto: Partial<CreateVeiculoDto>,
    @Req() request: UserRequest,
  ): Promise<Veiculo> {
    const veiculo = await this.veiculoService.findOne(id);

    // Verificar permissões
    if (request.user.role !== 'admin' && veiculo.userId !== request.user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este veículo',
      );
    }

    return this.veiculoService.update(id, updateVeiculoDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ): Promise<void> {
    const veiculo = await this.veiculoService.findOne(id);

    // Verificar permissões
    if (request.user.role !== 'admin' && veiculo.userId !== request.user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este veículo',
      );
    }

    return this.veiculoService.remove(id);
  }
}
