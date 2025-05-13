import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { EnderecoService } from '../services/endereco.service';
import { CreateEnderecoDto } from '../dto/create-endereco.dto';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { UserRequest } from '../../user/interfaces/user-request.interface';

@Controller('enderecos')
@UseGuards(JwtAuthGuard)
export class EnderecoController {
  constructor(private readonly enderecoService: EnderecoService) {}

  @Post()
  async create(
    @Body() createEnderecoDto: CreateEnderecoDto,
    @Req() request: UserRequest,
  ) {
    // Se o usuarioId estiver definido no DTO e o usuário for admin,
    // use esse ID, caso contrário use o ID do token JWT
    const userId =
      createEnderecoDto.usuarioId && request.user.role === 'admin'
        ? createEnderecoDto.usuarioId
        : request.user.id;

    return this.enderecoService.create(createEnderecoDto, userId);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário está tentando acessar seus próprios dados
    // ou se tem permissão admin
    if (request.user.role !== 'admin' && request.user.id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar estes dados',
      );
    }

    return this.enderecoService.findByUser(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ) {
    const endereco = await this.enderecoService.findOne(id);

    // Verificar permissões
    if (request.user.role !== 'admin' && request.user.id !== endereco.userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este endereço',
      );
    }

    return endereco;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnderecoDto: Partial<CreateEnderecoDto>,
    @Req() request: UserRequest,
  ) {
    const endereco = await this.enderecoService.findOne(id);

    // Verificar permissões
    if (request.user.role !== 'admin' && request.user.id !== endereco.userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este endereço',
      );
    }

    return this.enderecoService.update(id, updateEnderecoDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ) {
    const endereco = await this.enderecoService.findOne(id);

    // Verificar permissões
    if (request.user.role !== 'admin' && request.user.id !== endereco.userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este endereço',
      );
    }

    return this.enderecoService.remove(id);
  }
}
