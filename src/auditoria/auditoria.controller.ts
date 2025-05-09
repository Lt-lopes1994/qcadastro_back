import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { AuditoriaService } from './auditoria.service';
import { TipoAcao } from './entities/auditoria-acao.entity';
import { TutorService } from '../tutor/tutor.service';
import { Tutelado } from '../tutor/entities/tutelado.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('auditoria')
@ApiBearerAuth()
@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly tutorService: TutorService,
    @InjectRepository(Tutelado)
    private readonly tuteladoRepository: Repository<Tutelado>,
  ) {}

  @Get('entidade/:tipo/:id')
  @ApiOperation({ summary: 'Listar ações de auditoria por entidade' })
  @ApiResponse({ status: 200, description: 'Lista de ações de auditoria' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async listarAcoesPorEntidade(
    @Param('tipo') tipo: string,
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit: number = 100,
    @Req() request: UserRequest,
  ) {
    // Apenas admins podem ver todas as auditorias
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem acessar o histórico completo de auditoria',
      );
    }

    return this.auditoriaService.listarAcoesPorEntidade(tipo, id, limit);
  }

  @Get('usuario/:id')
  @ApiOperation({ summary: 'Listar ações de auditoria por usuário' })
  @ApiResponse({ status: 200, description: 'Lista de ações de auditoria' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async listarAcoesPorUsuario(
    @Param('id', ParseIntPipe) userId: number,
    @Query('limit') limit: number = 100,
    @Req() request: UserRequest,
  ) {
    // Usuários podem ver suas próprias ações, admins podem ver de todos
    if (request.user.role !== 'admin' && request.user.id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar o histórico de outros usuários',
      );
    }

    return this.auditoriaService.listarAcoesPorUsuario(userId, limit);
  }

  @Get('tipo/:tipo')
  @ApiOperation({ summary: 'Listar ações de auditoria por tipo' })
  @ApiResponse({ status: 200, description: 'Lista de ações de auditoria' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async listarAcoesPorTipo(
    @Param('tipo') tipo: string,
    @Query('limit') limit: number = 100,
    @Req() request: UserRequest,
  ) {
    // Apenas admins podem filtrar por tipo de ação
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem filtrar o histórico por tipo de ação',
      );
    }

    // Validar o tipo de ação
    if (!Object.values(TipoAcao).includes(tipo as TipoAcao)) {
      throw new ForbiddenException('Tipo de ação inválido');
    }

    return this.auditoriaService.listarAcoesPorTipo(tipo as TipoAcao, limit);
  }

  @Get('minhas-acoes')
  @ApiOperation({ summary: 'Listar ações de auditoria do usuário atual' })
  @ApiResponse({ status: 200, description: 'Lista de ações de auditoria' })
  async listarMinhasAcoes(
    @Query('limit') limit: number = 100,
    @Req() request: UserRequest,
  ) {
    return this.auditoriaService.listarAcoesPorUsuario(request.user.id, limit);
  }

  @Get('tutelado/:tuteladoId')
  @ApiOperation({
    summary: 'Listar ações de auditoria relacionadas a um tutelado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ações de auditoria do tutelado',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Tutelado não encontrado' })
  async listarAcoesPorTutelado(
    @Param('tuteladoId', ParseIntPipe) tuteladoId: number,
    @Query('limit') limit: number = 100,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário é admin (acesso direto) ou tutor deste tutelado
    if (request.user.role !== 'admin') {
      // Verificar se o usuário atual é tutor deste tutelado
      const tutorValido = await this.verificarTutorDoTutelado(
        request.user.id,
        tuteladoId,
      );

      if (!tutorValido) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar o histórico deste tutelado',
        );
      }
    }

    // Listar todas as ações onde este tutelado aparece como origem ou destino
    return this.auditoriaService.listarAcoesPorEntidade(
      'tutelado',
      tuteladoId,
      limit,
    );
  }

  // Método auxiliar para verificar relação tutor-tutelado
  private async verificarTutorDoTutelado(
    userId: number,
    tuteladoId: number,
  ): Promise<boolean> {
    // Buscar o tutor pelo ID do usuário
    const tutor = await this.tutorService.findTutorByUserId(userId);
    if (!tutor) return false;

    // Buscar o tutelado e verificar se pertence a este tutor
    const tutelado = await this.tuteladoRepository.findOne({
      where: { id: tuteladoId, tutorId: tutor.id },
    });

    return !!tutelado; // Retorna true se o tutelado for encontrado e pertencer ao tutor
  }
}
