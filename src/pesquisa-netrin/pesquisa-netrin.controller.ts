import { Controller, Get, Param } from '@nestjs/common';
import {
  PesquisaNetrinService,
  ReceitaFederalResponse,
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
}
