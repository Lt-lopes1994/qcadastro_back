import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ProcessosJudiciaisService } from '../services/processos-judiciais.service';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import type { UserRequest } from 'src/user/interfaces/user-request.interface';

@Controller('processos-judiciais')
@UseGuards(JwtAuthGuard)
export class ProcessosJudiciaisController {
  constructor(
    private readonly processosJudiciaisService: ProcessosJudiciaisService,
  ) {}

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: UserRequest,
  ) {
    // Verifica se o usuário está tentando acessar seus próprios dados
    // ou se tem permissão de admin
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar estes dados',
      );
    }

    return this.processosJudiciaisService.findByUser(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ) {
    const processo = await this.processosJudiciaisService.findOne(id);

    // Verifica permissões
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este processo',
      );
    }

    return processo;
  }
}
