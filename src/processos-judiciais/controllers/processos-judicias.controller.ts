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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Processos Judiciais')
/**
 * Controller para gerenciar processos judiciais.
 * Este controller fornece endpoints para buscar processos judiciais
 * associados a um usuário específico e para buscar um processo judicial
 * específico.
 * @param {ProcessosJudiciaisService} processosJudiciaisService - Serviço
 * responsável pela lógica de negócios relacionada a processos judiciais.
 * @returns {ProcessosJudiciaisController} - Instância do controller.
 * @throws {ForbiddenException} - Lançada quando um usuário tenta acessar
 * dados que não tem permissão para acessar.
 */
@ApiBearerAuth()
@Controller('processos-judiciais')
@UseGuards(JwtAuthGuard)
export class ProcessosJudiciaisController {
  constructor(
    private readonly processosJudiciaisService: ProcessosJudiciaisService,
  ) {}

  @ApiOperation({
    summary: 'Buscar processos judiciais por ID de usuário',
    description:
      'Este endpoint busca todos os processos judiciais associados a um usuário específico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Processos judiciais encontrados com sucesso.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor.',
  })
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
  @ApiOperation({
    summary: 'Buscar processo judicial por ID',
    description:
      'Este endpoint busca um processo judicial específico pelo seu ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Processo judicial encontrado com sucesso.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Processo judicial não encontrado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor.',
  })
  @ApiBearerAuth()
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
