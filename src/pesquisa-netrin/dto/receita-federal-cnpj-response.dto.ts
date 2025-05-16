import { ApiProperty } from '@nestjs/swagger';

export class EnderecoCnpjDto {
  @ApiProperty({
    description: 'Logradouro',
    example: 'RUA EXEMPLO',
  })
  logradouro: string;

  @ApiProperty({
    description: 'Número',
    example: '123',
  })
  numero: string;

  @ApiProperty({
    description: 'Complemento',
    example: 'SALA 1',
    required: false,
  })
  complemento?: string;

  @ApiProperty({
    description: 'CEP',
    example: '12345-678',
  })
  cep: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'CENTRO',
  })
  bairro: string;

  @ApiProperty({
    description: 'Município',
    example: 'SÃO PAULO',
  })
  municipio: string;

  @ApiProperty({
    description: 'UF',
    example: 'SP',
  })
  uf: string;
}

export class AtividadePrincipalDto {
  @ApiProperty({
    description: 'Código CNAE',
    example: '47.51-2-01',
  })
  codigo: string;

  @ApiProperty({
    description: 'Descrição da atividade',
    example:
      'COMÉRCIO VAREJISTA ESPECIALIZADO DE EQUIPAMENTOS E SUPRIMENTOS DE INFORMÁTICA',
  })
  descricao: string;
}

export class ReceitaFederalCnpjDto {
  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'NETRIN CONSULTORIA E SERVIçOS EM TECNOLOGIA DA INFORMACAO LTDA.',
  })
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome fantasia da empresa',
    example: '********',
    required: false,
  })
  nomeFantasia: string;

  @ApiProperty({
    description: 'Natureza jurídica da empresa',
    example: '206-2 - Sociedade Empresária Limitada',
  })
  naturezaJuridica: string;

  @ApiProperty({
    description: 'Logradouro do endereço da empresa',
    example: 'AV THEODOMIRO PORTO DA FONSECA',
  })
  logradouro: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '3101',
  })
  numero: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'EDIF 08 SALA E',
    required: false,
  })
  complemento: string;

  @ApiProperty({
    description: 'Bairro do endereço',
    example: 'DUQUE DE CAXIAS',
  })
  bairro: string;

  @ApiProperty({
    description: 'Município do endereço',
    example: 'SAO LEOPOLDO',
  })
  municipio: string;

  @ApiProperty({
    description: 'CEP do endereço',
    example: '93.020-080',
  })
  cep: string;

  @ApiProperty({
    description: 'UF do endereço',
    example: 'RS',
  })
  uf: string;

  @ApiProperty({
    description: 'Email de contato da empresa',
    example: 'contabilidade@meta.com.br',
    required: false,
  })
  email: string;

  @ApiProperty({
    description: 'Telefones de contato da empresa',
    example: '(51) 2101-1371/ (51) 2101-1300',
    required: false,
  })
  telefone: string;

  @ApiProperty({
    description: 'Ente Federativo Responsável',
    example: '*****',
    required: false,
  })
  efr: string;

  @ApiProperty({
    description: 'Situação cadastral da empresa',
    example: 'ATIVA',
    enum: ['ATIVA', 'SUSPENSA', 'INAPTA', 'BAIXADA'],
  })
  situacaoCadastral: string;

  @ApiProperty({
    description: 'Data da situação cadastral',
    example: '17/03/2011',
  })
  dataSituacaocadastral: string;

  @ApiProperty({
    description: 'Data de início das atividades',
    example: '17/03/2011',
  })
  dataInicioAtividade: string;

  @ApiProperty({
    description: 'Atividade econômica principal',
    example:
      '62.02-3-00 - Desenvolvimento e licenciamento de programas de computador customizáveis',
  })
  atividadeEconomica: string;

  @ApiProperty({
    description: 'Atividades econômicas secundárias',
    type: [String],
    example: [
      '62.03-1-00 - Desenvolvimento e licenciamento de programas de computador não-customizáveis',
      '62.01-5-01 - Desenvolvimento de programas de computador sob encomenda',
    ],
  })
  atividadesEconomicasSecundarias: string[];

  @ApiProperty({
    description: 'Tipo do CNPJ',
    example: 'MATRIZ',
    enum: ['MATRIZ', 'FILIAL'],
  })
  tipoCNPJ: string;

  @ApiProperty({
    description: 'Situação especial',
    example: '********',
    required: false,
  })
  situacaoEspecial: string;

  @ApiProperty({
    description: 'Data da situação especial',
    example: '********',
    required: false,
  })
  dataSituacaoEspecial: string;

  @ApiProperty({
    description: 'Motivo da situação cadastral',
    example: '',
    required: false,
  })
  motivoSituacao: string;

  @ApiProperty({
    description: 'Porte da empresa',
    example: 'DEMAIS',
    enum: ['ME', 'EPP', 'DEMAIS'],
  })
  porte: string;

  @ApiProperty({
    description: 'Capital social da empresa',
    example:
      'R$447.755,00 (Quatrocentos e quarenta e sete mil e setecentos e cinquenta e cinco reais)',
  })
  capitalSocial: string;

  @ApiProperty({
    description: 'URL para download do comprovante',
    example: 'https://...',
    required: false,
  })
  urlComprovante?: string;
}

export class ReceitaFederalCNPJResponseDto {
  @ApiProperty({
    description: 'CNPJ consultado',
    example: '13384727000161',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Dados da Receita Federal',
    type: ReceitaFederalCnpjDto,
  })
  receitaFederal: ReceitaFederalCnpjDto;
}
