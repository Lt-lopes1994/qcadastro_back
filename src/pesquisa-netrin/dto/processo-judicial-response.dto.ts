import { ApiProperty } from '@nestjs/swagger';

export class AssuntoCnjDto {
  @ApiProperty({
    description: 'Título do assunto do processo',
    example: 'DIREITO CIVIL - OBRIGAÇÕES',
  })
  titulo: string;

  @ApiProperty({
    description: 'Código CNJ do assunto',
    example: '10432',
    required: false,
  })
  codigoCNJ: string;

  @ApiProperty({
    description: 'Indica se é o assunto principal',
    example: true,
    required: false,
  })
  ePrincipal: boolean;
}

export class ParteProcessoDto {
  @ApiProperty({
    description: 'Nome da parte envolvida',
    example: 'MARIA SILVA',
  })
  nome: string;

  @ApiProperty({
    description: 'CPF da parte (quando pessoa física)',
    example: '123.456.789-00',
    required: false,
  })
  cpf?: string;

  @ApiProperty({
    description: 'CNPJ da parte (quando pessoa jurídica)',
    example: '12.345.678/0001-90',
    required: false,
  })
  cnpj?: string;

  @ApiProperty({
    description: 'Posição da parte no processo (autor, réu, etc)',
    example: 'AUTOR',
    enum: ['AUTOR', 'REU', 'TERCEIRO INTERESSADO'],
  })
  polo: string;

  @ApiProperty({
    description: 'Tipo da parte',
    example: 'PARTE PRINCIPAL',
  })
  tipo: string;
}

export class StatusProcessoDto {
  @ApiProperty({
    description: 'Situação atual do processo',
    example: 'EM ANDAMENTO',
    enum: ['EM ANDAMENTO', 'ARQUIVADO', 'SUSPENSO', 'JULGADO', 'BAIXADO'],
  })
  statusProcesso: string;
}

export class ClasseProcessualDto {
  @ApiProperty({
    description: 'Nome da classe processual',
    example: 'PROCEDIMENTO COMUM CÍVEL',
  })
  nome: string;
}

export class ProcessoDto {
  @ApiProperty({
    description: 'Número único do processo',
    example: '0123456-78.2022.8.26.0100',
  })
  numeroProcesso: string;

  @ApiProperty({
    description: 'Número único do processo no formato CNJ',
    example: '0123456-78.2022.8.26.0100',
  })
  numeroProcessoUnico: string;

  @ApiProperty({
    description: 'URL do processo para consulta pública',
    example: 'https://esaj.tjsp.jus.br/cpopg/show.do?processo=...',
    required: false,
  })
  urlProcesso?: string;

  @ApiProperty({
    description: 'Grau do processo (1 = primeiro grau, 2 = segundo grau)',
    example: 1,
  })
  grauProcesso: number;

  @ApiProperty({
    description: 'Unidade de origem do processo',
    example: '1ª VARA CÍVEL DE SÃO PAULO',
  })
  unidadeOrigem: string;

  @ApiProperty({
    description: 'Assuntos CNJ vinculados ao processo',
    type: [AssuntoCnjDto],
  })
  assuntosCNJ: AssuntoCnjDto[];

  @ApiProperty({
    description: 'Tribunal onde o processo tramita',
    example: 'TJSP',
  })
  tribunal: string;

  @ApiProperty({
    description: 'UF do tribunal',
    example: 'SP',
  })
  uf: string;

  @ApiProperty({
    description: 'Classe processual',
    type: ClasseProcessualDto,
  })
  classeProcessual: ClasseProcessualDto;

  @ApiProperty({
    description: 'Status atual do processo',
    type: StatusProcessoDto,
  })
  status: StatusProcessoDto;

  @ApiProperty({
    description: 'Partes envolvidas no processo',
    type: [ParteProcessoDto],
  })
  partes: ParteProcessoDto[];
}

export class ProcessosFullDto {
  @ApiProperty({
    description: 'Total de processos encontrados',
    example: 3,
  })
  totalProcessos: number;

  @ApiProperty({
    description: 'Total de processos como autor',
    example: 1,
  })
  totalProcessosAutor: number;

  @ApiProperty({
    description: 'Total de processos como réu',
    example: 2,
  })
  totalProcessosReu: number;

  @ApiProperty({
    description: 'Processos iniciados nos últimos 180 dias',
    example: 1,
  })
  processosUltimos180dias: number;

  @ApiProperty({
    description: 'Lista de processos encontrados',
    type: [ProcessoDto],
  })
  processos: ProcessoDto[];
}

export class ProcessoJudicialResponseDto {
  @ApiProperty({
    description: 'CPF consultado',
    example: '123.456.789-00',
  })
  cpf: string;

  @ApiProperty({
    description: 'Informações completas dos processos',
    type: ProcessosFullDto,
  })
  processosFull: ProcessosFullDto;
}
