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
import {
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import type { UserRequest } from 'src/user/interfaces/user-request.interface';
import {
  ReceitaFederalResponseDto,
  ProcessoJudicialResponseDto,
  VeiculoPlacaResponseDto,
  ScoreCreditoResponseDto,
  ReceitaFederalCNPJResponseDto,
  EstatisticasResponseDto,
} from './dto';

@ApiTags('Pesquisa Netrin')
@ApiBearerAuth()
@Controller('pesquisa-netrin')
export class PesquisaNetrinController {
  constructor(private readonly pesquisaService: PesquisaNetrinService) {}

  @ApiOperation({
    summary: 'Consultar CPF na Receita Federal',
    description:
      'Consulta informações de pessoa física na Receita Federal através do CPF.',
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do contribuinte (apenas números ou com formatação)',
    example: '12345678900',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do CPF recuperados com sucesso',
    type: ReceitaFederalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'CPF inválido ou parâmetros incorretos',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 500,
    description: 'Erro no servidor ou na API Netrin',
  })
  @Get('cpf/:cpf')
  @UseGuards(JwtAuthGuard)
  async consultarCPF(
    @Param('cpf') cpf: string,
    @Req() request: UserRequest,
  ): Promise<ReceitaFederalResponseDto> {
    const response = await this.pesquisaService.consultarCPF(
      cpf,
      request.user.id,
    );
    // Transform the response to match ReceitaFederalResponseDto
    return response as unknown as ReceitaFederalResponseDto;
  }

  @ApiOperation({
    summary: 'Consultar processos judiciais',
    description:
      'Busca processos judiciais associados a um CPF na base de dados da Receita Federal e tribunais.',
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do contribuinte para busca de processos judiciais',
    example: '12345678900',
  })
  @ApiResponse({
    status: 200,
    description: 'Processos judiciais encontrados',
    type: ProcessoJudicialResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'CPF inválido ou parâmetros incorretos',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 500,
    description: 'Erro no servidor ou na API Netrin',
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
    summary: 'Consultar dados de veículo por placa',
    description:
      'Retorna informações detalhadas sobre um veículo a partir de sua placa.',
  })
  @ApiParam({
    name: 'placa',
    description: 'Placa do veículo no formato Mercosul ou convencional',
    example: 'ABC1D23',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do veículo recuperados com sucesso',
    type: VeiculoPlacaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Placa inválida ou parâmetros incorretos',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  @ApiResponse({
    status: 500,
    description: 'Erro no servidor ou na API Netrin',
  })
  @Get('veiculo/:placa')
  @UseGuards(JwtAuthGuard)
  async consultarVeiculo(
    @Param('placa') placa: string,
    @Req() request: UserRequest,
  ): Promise<VeiculoPlacaResponseDto> {
    const response = await this.pesquisaService.consultarVeiculo(
      placa,
      request.user.id,
    );
    // Transform the response to match VeiculoPlacaResponseDto
    return response as unknown as VeiculoPlacaResponseDto;
  }

  @ApiOperation({
    summary: 'Consultar score de crédito',
    description:
      'Retorna informações de score de crédito e capacidade financeira de pessoa física.',
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF para consulta de score de crédito',
    example: '12345678900',
  })
  @ApiResponse({
    status: 200,
    description: 'Score de crédito consultado com sucesso',
    type: ScoreCreditoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'CPF inválido ou parâmetros incorretos',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({
    status: 500,
    description: 'Erro no servidor ou na API Netrin',
  })
  @Get('score-credito/:cpf')
  @UseGuards(JwtAuthGuard)
  async consultarScoreCredito(
    @Param('cpf') cpf: string,
    @Req() request: UserRequest,
  ): Promise<ScoreCreditoResponseDto> {
    return this.pesquisaService.consultarScoreCredito(cpf, request.user.id);
  }

  @ApiOperation({
    summary: 'Consultar CNPJ na Receita Federal',
    description: 'Retorna informações detalhadas de empresa a partir do CNPJ.',
  })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ da empresa (apenas números ou com formatação)',
    example: '13384727000161',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do CNPJ recuperados com sucesso',
    type: ReceitaFederalCNPJResponseDto,
    schema: {
      example: {
        cnpj: '13384727000161',
        receitaFederal: {
          razaoSocial:
            'NETRIN CONSULTORIA E SERVIçOS EM TECNOLOGIA DA INFORMACAO LTDA.',
          nomeFantasia: '********',
          naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
          logradouro: 'AV THEODOMIRO PORTO DA FONSECA',
          numero: '3101',
          complemento: 'EDIF 08 SALA E',
          bairro: 'DUQUE DE CAXIAS',
          municipio: 'SAO LEOPOLDO',
          cep: '93.020-080',
          uf: 'RS',
          email: 'contabilidade@meta.com.br',
          telefone: '(51) 2101-1371/ (51) 2101-1300',
          efr: '*****',
          situacaoCadastral: 'ATIVA',
          dataSituacaocadastral: '17/03/2011',
          dataInicioAtividade: '17/03/2011',
          atividadeEconomica:
            '62.02-3-00 - Desenvolvimento e licenciamento de programas de computador customizáveis',
          atividadesEconomicasSecundarias: [
            '62.03-1-00 - Desenvolvimento e licenciamento de programas de computador não-customizáveis',
            '62.01-5-01 - Desenvolvimento de programas de computador sob encomenda',
            '62.04-0-00 - Consultoria em tecnologia da informação',
          ],
          tipoCNPJ: 'MATRIZ',
          situacaoEspecial: '********',
          dataSituacaoEspecial: '********',
          motivoSituacao: '',
          porte: 'DEMAIS',
          capitalSocial:
            'R$447.755,00 (Quatrocentos e quarenta e sete mil e setecentos e cinquenta e cinco reais)',
          urlComprovante: 'https://...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'CNPJ inválido ou parâmetros incorretos',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'CNPJ não encontrado' })
  @ApiResponse({
    status: 500,
    description: 'Erro no servidor ou na API Netrin',
  })
  @Get('cnpj/:cnpj')
  @UseGuards(JwtAuthGuard)
  async consultarCNPJ(
    @Param('cnpj') cnpj: string,
    @Req() request: UserRequest,
  ): Promise<ReceitaFederalCNPJResponseDto> {
    return this.pesquisaService.consultarCNPJ(cnpj, request.user.id);
  }

  @ApiOperation({
    summary: 'Obter estatísticas de requisições Netrin',
    description:
      'Retorna dados estatísticos de uso da API Netrin por tipo de consulta e usuário.',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Mês para filtrar estatísticas (1-12)',
    example: 7,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Ano para filtrar estatísticas',
    example: 2023,
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas obtidas com sucesso',
    type: EstatisticasResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores podem acessar',
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @ApiBearerAuth()
  @Get('estatisticas')
  @UseGuards(JwtAuthGuard)
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

export interface ReceitaFederalResponse {
  cpf: string;
  regularidadeCpf: {
    cpf: string;
    nome: string;
    primeiroNome: string;
    sobrenome: string;
    situacaoCadastral: string;
    paisOrigem: string;
    idade: number;
    nomeMae: string;
    genero: string;
    digitoVerificador: string;
    comprovante: string;
    dataNascimento: string;
    dataInscricao: string;
    anoObito: string;
    dataAtualizacao: string;
    urlComprovante: string;
  };
}
