import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CapacidadeCargaService } from './capacidade-carga.service';
import { CreateCapacidadeCargaDto } from './dto/create-capacidade-carga.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('capacidade-carga')
@ApiBearerAuth()
@Controller('capacidade-carga')
@UseGuards(JwtAuthGuard)
export class CapacidadeCargaController {
  constructor(
    private readonly capacidadeCargaService: CapacidadeCargaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar capacidade de carga' })
  create(@Body() createCapacidadeCargaDto: CreateCapacidadeCargaDto) {
    return this.capacidadeCargaService.create(createCapacidadeCargaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as capacidades de carga' })
  findAll() {
    return this.capacidadeCargaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar capacidade de carga por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.capacidadeCargaService.findOne(id);
  }

  @Get('veiculo/:id')
  @ApiOperation({ summary: 'Buscar capacidade de carga por ID do veículo' })
  findByVeiculo(@Param('id', ParseIntPipe) id: number) {
    return this.capacidadeCargaService.findByVeiculo(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar capacidade de carga' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCapacidadeCargaDto: Partial<CreateCapacidadeCargaDto>,
  ) {
    return this.capacidadeCargaService.update(id, updateCapacidadeCargaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover capacidade de carga' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.capacidadeCargaService.remove(id);
  }
}
