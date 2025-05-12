import { Controller, Get, Param } from '@nestjs/common';
import {
  PesquisaNetrinService,
  ReceitaFederalResponse,
  VeiculoPlacaResponse,
  ScoreCreditoResponse,
  ReceitaFederalCNPJResponse,
} from './pesquisa-netrin.service';

@Controller('pesquisa-netrin')
export class PesquisaNetrinController {
  constructor(private readonly pesquisaService: PesquisaNetrinService) {}

  @Get('cpf/:cpf')
  async consultarCPF(
    @Param('cpf') cpf: string,
  ): Promise<ReceitaFederalResponse> {
    return this.pesquisaService.consultarCPF(cpf);
  }

  @Get('processos/:cpf')
  async consultarProcessos(@Param('cpf') cpf: string) {
    return this.pesquisaService.consultarProcessos(cpf);
  }

  @Get('veiculo/:placa')
  async consultarVeiculo(
    @Param('placa') placa: string,
  ): Promise<VeiculoPlacaResponse> {
    return this.pesquisaService.consultarVeiculo(placa);
  }

  @Get('score-credito/:cpf')
  async consultarScoreCredito(
    @Param('cpf') cpf: string,
  ): Promise<ScoreCreditoResponse> {
    return this.pesquisaService.consultarScoreCredito(cpf);
  }

  @Get('cnpj/:cnpj')
  async consultarCNPJ(
    @Param('cnpj') cnpj: string,
  ): Promise<ReceitaFederalCNPJResponse> {
    return this.pesquisaService.consultarCNPJ(cnpj);
  }
}
