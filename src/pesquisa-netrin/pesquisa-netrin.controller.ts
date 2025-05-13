import { Controller, Get, Param } from '@nestjs/common';
import { PesquisaNetrinService } from './pesquisa-netrin.service';
import { ApiOperation } from '@nestjs/swagger';
import type {
  ReceitaFederalCNPJResponse,
  ReceitaFederalResponse,
  ScoreCreditoResponse,
  VeiculoPlacaResponse,
} from 'src/utils/types/pesquisa-netrin.types';

@Controller('pesquisa-netrin')
export class PesquisaNetrinController {
  constructor(private readonly pesquisaService: PesquisaNetrinService) {}

  @ApiOperation({
    summary: 'Consultar CPF na Receita Federal',
    description: 'Consulta informações de CPF na Receita Federal',
  })
  @Get('cpf/:cpf')
  async consultarCPF(
    @Param('cpf') cpf: string,
  ): Promise<ReceitaFederalResponse> {
    return this.pesquisaService.consultarCPF(cpf);
  }

  @ApiOperation({
    summary: 'Consultar processos na Receita Federal',
    description: 'Consulta informações de processos na Receita Federal',
  })
  @Get('processos/:cpf')
  async consultarProcessos(@Param('cpf') cpf: string) {
    return this.pesquisaService.consultarProcessos(cpf);
  }

  @ApiOperation({
    summary: 'Consultar placa de veículo na Receita Federal',
    description: 'Consulta informações de placa de veículo na Receita Federal',
  })
  @Get('veiculo/:placa')
  async consultarVeiculo(
    @Param('placa') placa: string,
  ): Promise<VeiculoPlacaResponse> {
    return this.pesquisaService.consultarVeiculo(placa);
  }

  @ApiOperation({
    summary: 'Consultar score de crédito',
    description: 'Consulta informações de score de crédito',
  })
  @Get('score-credito/:cpf')
  async consultarScoreCredito(
    @Param('cpf') cpf: string,
  ): Promise<ScoreCreditoResponse> {
    return this.pesquisaService.consultarScoreCredito(cpf);
  }

  @ApiOperation({
    summary: 'Consultar CNPJ na Receita Federal',
    description: 'Consulta informações de CNPJ na Receita Federal',
  })
  @Get('cnpj/:cnpj')
  async consultarCNPJ(
    @Param('cnpj') cnpj: string,
  ): Promise<ReceitaFederalCNPJResponse> {
    return this.pesquisaService.consultarCNPJ(cnpj);
  }
}
