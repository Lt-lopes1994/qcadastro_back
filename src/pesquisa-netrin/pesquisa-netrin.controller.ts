import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { PesquisaNetrinService } from './pesquisa-netrin.service';
import { ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import type {
  ReceitaFederalCNPJResponse,
  ReceitaFederalResponse,
  ScoreCreditoResponse,
  VeiculoPlacaResponse,
} from 'src/utils/types/pesquisa-netrin.types';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import type { UserRequest } from 'src/user/interfaces/user-request.interface';

@Controller('pesquisa-netrin')
export class PesquisaNetrinController {
  constructor(private readonly pesquisaService: PesquisaNetrinService) {}

  @ApiOperation({
    summary: 'Consultar CPF na Receita Federal',
    description: 'Consulta informações de CPF na Receita Federal',
  })
  @Get('cpf/:cpf')
  @UseGuards(JwtAuthGuard)
  async consultarCPF(
    @Param('cpf') cpf: string,
    @Req() request: UserRequest,
  ): Promise<ReceitaFederalResponse> {
    return this.pesquisaService.consultarCPF(cpf, request.user.id);
  }

  @ApiOperation({
    summary: 'Consultar processos na Receita Federal',
    description: 'Consulta informações de processos na Receita Federal',
  })
  @Get('processos/:cpf')
  @UseGuards(JwtAuthGuard)
  async consultarProcessos(
    @Param('cpf') cpf: string,
    @Req() request: UserRequest,
  ) {
    return this.pesquisaService.consultarProcessos(cpf, request.user.id);
  }

  @ApiOperation({
    summary: 'Consultar placa de veículo na Receita Federal',
    description: 'Consulta informações de placa de veículo na Receita Federal',
  })
  @Get('veiculo/:placa')
  @UseGuards(JwtAuthGuard)
  async consultarVeiculo(
    @Param('placa') placa: string,
    @Req() request: UserRequest,
  ): Promise<VeiculoPlacaResponse> {
    return this.pesquisaService.consultarVeiculo(placa, request.user.id);
  }

  @ApiOperation({
    summary: 'Consultar score de crédito',
    description: 'Consulta informações de score de crédito',
  })
  @Get('score-credito/:cpf')
  @UseGuards(JwtAuthGuard)
  async consultarScoreCredito(
    @Param('cpf') cpf: string,
    @Req() request: UserRequest,
  ): Promise<ScoreCreditoResponse> {
    return this.pesquisaService.consultarScoreCredito(cpf, request.user.id);
  }

  @ApiOperation({
    summary: 'Consultar CNPJ na Receita Federal',
    description: 'Consulta informações de CNPJ na Receita Federal',
  })
  @Get('cnpj/:cnpj')
  @UseGuards(JwtAuthGuard)
  async consultarCNPJ(
    @Param('cnpj') cnpj: string,
    @Req() request: UserRequest,
  ): Promise<ReceitaFederalCNPJResponse> {
    return this.pesquisaService.consultarCNPJ(cnpj, request.user.id);
  }

  @Get('estatisticas')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obter estatísticas de requisições Netrin',
    description:
      'Obtém estatísticas de requisições à API Netrin para o mês atual ou um mês específico',
  })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiBearerAuth()
  async getRequestStats(
    @Req() request: UserRequest,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<Record<string, any>> {
    // Apenas administradores podem acessar
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem acessar as estatísticas',
      );
    }

    return this.pesquisaService.getMonthlyStats(month, year) as Promise<
      Record<string, any>
    >;
  }
}
