/* eslint-disable @typescript-eslint/no-unused-vars */
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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { CreateTutorDto } from './dto/create-tutor.dto';
import type { DesignarVeiculoDto } from './dto/designar-veiculo.dto';
import type { VincularEmpresaDto } from './dto/vincular-empresa.dto';
import { VincularTuteladoDto } from './dto/vincular-tutelado.dto';
import { TutorService } from './tutor.service';
import { SolicitacaoVinculoDto } from './dto/solicitacao-vinculo.dto';
import { RespostaSolicitacaoDto } from './dto/resposta-solicitacao.dto';

@ApiTags('tutores')
@ApiBearerAuth()
@Controller('tutores')
@UseGuards(JwtAuthGuard)
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo tutor' })
  @ApiResponse({ status: 201, description: 'Tutor criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiBody({ type: CreateTutorDto })
  async cadastrar(
    @Body() createTutorDto: CreateTutorDto,
    @Req() request: UserRequest,
  ) {
    const userId = request.user.id;
    return this.tutorService.cadastrarUsuario(userId, createTutorDto);
  }

  @Post(':id/vincular-tutelado')
  async vincularTutelado(
    @Param('id', ParseIntPipe) tutorId: number,
    @Body() vincularDto: VincularTuteladoDto,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário tem permissão (é o próprio tutor ou admin)
    const tutor = await this.tutorService.findTutorByUserId(request.user.id);
    if (request.user.role !== 'admin' && tutor.id !== tutorId) {
      throw new ForbiddenException(
        'Você não tem permissão para realizar esta operação',
      );
    }

    return this.tutorService.vincularTutelado(tutorId, vincularDto);
  }

  @Post(':id/designar-veiculo')
  async designarVeiculo(
    @Param('id', ParseIntPipe) tutorId: number,
    @Body() designarVeiculoDto: DesignarVeiculoDto,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário tem permissão (é o próprio tutor ou admin)
    if (request.user.role !== 'admin') {
      try {
        const tutor = await this.tutorService.findTutorByUserId(
          request.user.id,
        );
        if (tutor.id !== tutorId) {
          throw new ForbiddenException(
            'Você não tem permissão para realizar esta operação',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para realizar esta operação',
        );
      }
    }

    return this.tutorService.designarVeiculo(tutorId, designarVeiculoDto);
  }

  @Post('enviar-convite')
  @ApiOperation({ summary: 'Enviar convite para novo tutor' })
  @ApiResponse({ status: 200, description: 'Convite enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao enviar convite' })
  async enviarConvite(
    @Body('email') emailDestino: string,
    @Req() request: UserRequest,
  ) {
    const userId = request.user.id;
    await this.tutorService.enviarEmailConvite(emailDestino, userId);

    return {
      success: true,
      message: 'Convite enviado com sucesso',
      email: emailDestino,
    };
  }

  @Delete(':tutorId/tutelados/:tuteladoId')
  @ApiOperation({ summary: 'Desvincular tutelado do tutor' })
  @ApiParam({ name: 'tutorId', description: 'ID do tutor' })
  @ApiParam({
    name: 'tuteladoId',
    description: 'ID do tutelado a ser desvinculado',
  })
  @ApiResponse({
    status: 200,
    description: 'Tutelado desvinculado com sucesso',
  })
  @ApiResponse({ status: 403, description: 'Permissão negada' })
  @ApiResponse({ status: 404, description: 'Tutor ou tutelado não encontrado' })
  async desvincularTutelado(
    @Param('tutorId', ParseIntPipe) tutorId: number,
    @Param('tuteladoId', ParseIntPipe) tuteladoId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário tem permissão (é o próprio tutor ou admin)
    if (request.user.role !== 'admin') {
      const tutor = await this.tutorService.findTutorByUserId(request.user.id);
      if (tutor.id !== tutorId) {
        throw new ForbiddenException(
          'Você não tem permissão para realizar esta operação',
        );
      }
    }

    return this.tutorService.desvincularTutelado(tutorId, tuteladoId);
  }

  @Get('perfil')
  @ApiOperation({ summary: 'Obter perfil do tutor atual' })
  @ApiResponse({ status: 200, description: 'Perfil do tutor' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async perfilTutor(@Req() request: UserRequest) {
    return this.tutorService.findTutorByUserId(request.user.id);
  }

  @Get('tutelados')
  @ApiOperation({ summary: 'Listar tutelados ativos do tutor atual' })
  @ApiResponse({ status: 200, description: 'Lista de tutelados ativos' })
  @ApiResponse({ status: 404, description: 'Tutelados não encontrados' })
  async listarTuteladosDoTutor(@Req() request: UserRequest) {
    const tutor = await this.tutorService.findTutorByUserId(request.user.id);
    // Passar parâmetro adicional para filtrar apenas tutelados ativos
    return this.tutorService.listarTutelados(tutor.id, 'ATIVO');
  }

  @Get('tutelado/perfil')
  async perfilTutelado(@Req() request: UserRequest) {
    return this.tutorService.findTuteladoByUserId(request.user.id);
  }

  @Get(':id/tutelados')
  async listarTutelados(
    @Param('id', ParseIntPipe) tutorId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário tem permissão (é o próprio tutor ou admin)
    if (request.user.role !== 'admin') {
      try {
        const tutor = await this.tutorService.findTutorByUserId(
          request.user.id,
        );
        if (tutor.id !== tutorId) {
          throw new ForbiddenException(
            'Você não tem permissão para acessar estes dados',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar estes dados',
        );
      }
    }

    return this.tutorService.listarTutelados(tutorId);
  }

  @Get(':id/empresas')
  @ApiOperation({ summary: 'Listar empresas vinculadas ao tutor' })
  @ApiParam({ name: 'id', description: 'ID do tutor' })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  async listarEmpresasVinculadas(
    @Param('id', ParseIntPipe) tutorId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar permissão
    if (request.user.role !== 'admin') {
      try {
        const tutor = await this.tutorService.findTutorByUserId(
          request.user.id,
        );
        if (tutor.id !== tutorId) {
          throw new ForbiddenException(
            'Você não tem permissão para acessar estes dados',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar estes dados',
        );
      }
    }

    return this.tutorService.listarEmpresasVinculadas(tutorId);
  }

  @Delete(':id/empresas/:empresaId')
  @ApiOperation({ summary: 'Desvincular empresa do tutor' })
  @ApiParam({ name: 'id', description: 'ID do tutor' })
  @ApiParam({ name: 'empresaId', description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Empresa desvinculada com sucesso' })
  async desvincularEmpresa(
    @Param('id', ParseIntPipe) tutorId: number,
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar permissão
    if (request.user.role !== 'admin') {
      try {
        const tutor = await this.tutorService.findTutorByUserId(
          request.user.id,
        );
        if (tutor.id !== tutorId) {
          throw new ForbiddenException(
            'Você não tem permissão para realizar esta operação',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para realizar esta operação',
        );
      }
    }

    await this.tutorService.desvincularEmpresa(tutorId, empresaId);
    return { message: 'Empresa desvinculada com sucesso' };
  }

  @Get()
  async listarTodos(@Req() request: UserRequest) {
    // Somente admins podem listar todos os tutores
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Somente administradores podem listar todos os tutores',
      );
    }

    return this.tutorService.listarTodosTutores();
  }

  @Get('verificar/:cpf')
  async verificarCpf(@Param('cpf') cpf: string) {
    return this.tutorService.verificarCpf(cpf);
  }

  @Get('verificar-cnpj/:cnpj')
  async verificarCnpj(@Param('cnpj') cnpj: string) {
    return this.tutorService.verificarCnpj(cnpj);
  }

  @Post('vincular-minha-empresa')
  @ApiOperation({ summary: 'Vincular tutor à empresa' })
  @ApiResponse({ status: 200, description: 'Empresa vinculada com sucesso' })
  @ApiBody({ schema: { properties: { empresaId: { type: 'number' } } } })
  async vincularMinhaEmpresa(
    @Body('empresaId') idEmpresa: number,
    @Req() request: UserRequest,
  ) {
    try {
      console.log('Recebendo requisição para vincular empresa:', idEmpresa);
      const userId = request.user.id;
      console.log('UserID do requisitante:', userId);

      // Criar o objeto VincularEmpresaDto corretamente
      const vincularEmpresaDto: VincularEmpresaDto = { empresaId: idEmpresa };

      const resultado = await this.tutorService.vincularEmpresa(
        userId,
        vincularEmpresaDto,
        true,
      );
      console.log('Resultado da operação:', resultado);

      return {
        success: true,
        message: 'Empresa vinculada com sucesso',
        data: resultado,
      };
    } catch (error) {
      console.error('Erro ao vincular empresa:', error);
      throw error;
    }
  }

  @Post(':id/assinar-contrato')
  @ApiOperation({ summary: 'Assinar contrato do tutor' })
  @ApiParam({ name: 'id', description: 'ID do tutor' })
  @ApiResponse({ status: 200, description: 'Contrato assinado com sucesso' })
  async assinarContrato(
    @Param('id', ParseIntPipe) tutorId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário tem permissão (é o próprio tutor ou admin)
    if (request.user.role !== 'admin') {
      try {
        const tutor = await this.tutorService.findTutorByUserId(
          request.user.id,
        );
        if (tutor.id !== tutorId) {
          throw new ForbiddenException(
            'Você não tem permissão para realizar esta operação',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para realizar esta operação',
        );
      }
    }

    return this.tutorService.assinarContrato(tutorId);
  }

  @Post('solicitar-vinculo')
  @ApiOperation({ summary: 'Solicitar vínculo com tutor' })
  @ApiResponse({ status: 200, description: 'Solicitação enviada com sucesso' })
  @ApiBody({ type: SolicitacaoVinculoDto })
  async solicitarVinculo(
    @Body() solicitacaoDto: SolicitacaoVinculoDto,
    @Req() request: UserRequest,
  ) {
    try {
      console.log(
        'Recebendo requisição para solicitar vínculo:',
        solicitacaoDto.tutorId,
      );

      const userId = request.user.id;
      // Garantindo que tutorId seja um número
      solicitacaoDto.tutorId = Number(solicitacaoDto.tutorId);

      const resultado = await this.tutorService.solicitarVinculoTutor(
        userId,
        solicitacaoDto,
      );

      return {
        success: true,
        message:
          'Solicitação enviada com sucesso. Aguarde a aprovação do tutor.',
        data: resultado,
      };
    } catch (error) {
      console.error('Erro ao solicitar vínculo:', error);
      throw error;
    }
  }

  @Get('solicitacoes-pendentes')
  @ApiOperation({
    summary: 'Listar solicitações de vínculo pendentes para o tutor logado',
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitações pendentes' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Tutor não encontrado' })
  async listarSolicitacoesPendentes(@Req() request: UserRequest) {
    try {
      const userId = request.user.id;
      return await this.tutorService.listarSolicitacoesPendentes(userId);
    } catch (error) {
      console.error('Erro ao listar solicitações pendentes:', error);
      throw error;
    }
  }

  @Get('minhas-solicitacoes-pendentes')
  @ApiOperation({
    summary: 'Listar solicitações de vínculo pendentes do usuário atual',
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitações pendentes' })
  async listarMinhasSolicitacoesPendentes(@Req() request: UserRequest) {
    const userId = request.user.id;
    return this.tutorService.listarMinhasSolicitacoesPendentes(userId);
  }

  @Get('minhas-solicitacoes-negadas')
  @ApiOperation({
    summary: 'Listar solicitações de vínculo Negados do usuário atual',
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitações pendentes' })
  async listarMinhasSolicitacoesNegadas(@Req() request: UserRequest) {
    const userId = request.user.id;
    return this.tutorService.listarMinhasSolicitacoesNegadas(userId);
  }

  @Post('solicitacoes/:id/responder')
  @ApiOperation({ summary: 'Responder solicitação de vínculo' })
  @ApiParam({ name: 'id', description: 'ID da solicitação' })
  @ApiBody({ type: RespostaSolicitacaoDto })
  @ApiResponse({
    status: 200,
    description: 'Solicitação respondida com sucesso',
  })
  async responderSolicitacao(
    @Param('id', ParseIntPipe) solicitacaoId: number,
    @Body() respostaDto: RespostaSolicitacaoDto,
    @Req() request: UserRequest,
  ) {
    try {
      const userId = request.user.id;
      const resultado = await this.tutorService.responderSolicitacaoVinculo(
        userId,
        solicitacaoId,
        respostaDto,
      );

      return {
        success: true,
        message: respostaDto.aprovado
          ? 'Solicitação aprovada com sucesso. O tutelado foi vinculado.'
          : 'Solicitação rejeitada com sucesso.',
        data: resultado,
      };
    } catch (error) {
      console.error('Erro ao responder solicitação:', error);
      throw error;
    }
  }

  @Get('tutelado-info')
  @ApiOperation({ summary: 'Obter informações do tutelado' })
  @ApiResponse({ status: 200, description: 'Informações do tutelado' })
  @ApiResponse({ status: 404, description: 'Tutelado não encontrado' })
  async obterInformacoesTutelado(@Req() request: UserRequest) {
    const userId = request.user.id;
    return this.tutorService.obterInformacoesTutelado(userId);
  }
}
