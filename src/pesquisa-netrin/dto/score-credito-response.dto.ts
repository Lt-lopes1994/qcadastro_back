import { ApiProperty } from '@nestjs/swagger';

export class ScoreCreditoDto {
  @ApiProperty({
    description: 'Score de crédito atual (D+0)',
    example: 750,
    minimum: 0,
    maximum: 1000,
  })
  D00: number;

  @ApiProperty({
    description: 'Score de crédito projetado para 30 dias (D+30)',
    example: 760,
    minimum: 0,
    maximum: 1000,
  })
  D30: number;

  @ApiProperty({
    description: 'Score de crédito projetado para 60 dias (D+60)',
    example: 770,
    minimum: 0,
    maximum: 1000,
  })
  D60: number;
}

export class RendaDto {
  @ApiProperty({
    description: 'Renda individual estimada',
    example: 5000.0,
    type: Number,
  })
  individual: number;

  @ApiProperty({
    description: 'Renda empresarial',
    example: '',
    required: false,
  })
  empresarial: string;

  @ApiProperty({
    description: 'Renda familiar estimada',
    example: 7500.0,
    type: Number,
  })
  familiar: number;

  @ApiProperty({
    description: 'Renda presumida com base em análise de crédito',
    example: 5500.0,
    type: Number,
  })
  presumido: number;

  @ApiProperty({
    description: 'Classe social pessoal (1-5, onde 1 é a mais alta)',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  classeSocialPessoal: number;

  @ApiProperty({
    description: 'Classe social familiar (1-5, onde 1 é a mais alta)',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  classeSocialFamiliar: number;

  @ApiProperty({
    description: 'Informações sobre aposentadoria',
    example: '',
    required: false,
  })
  aponsentadoria: string; // Mantido com o erro ortográfico para compatibilidade com a API
}

export class ScoreCreditoRendaPresumidaPFSimplificadoDto {
  @ApiProperty({
    description: 'Nome completo da pessoa',
    example: 'NOME SOBRENOME',
  })
  name: string;

  @ApiProperty({
    description: 'CPF da pessoa (apenas números)',
    example: 12345678900,
  })
  cpf: number;

  @ApiProperty({
    description: 'Informações de score de crédito',
    type: ScoreCreditoDto,
  })
  scoreCredito: ScoreCreditoDto;

  @ApiProperty({
    description: 'Informações de renda',
    type: RendaDto,
  })
  renda: RendaDto;
}

export class ScoreCreditoResponseDto {
  @ApiProperty({
    description: 'CPF consultado',
    example: '12345678900',
  })
  cpf: string;

  @ApiProperty({
    description: 'Informações de score de crédito e renda',
    type: ScoreCreditoRendaPresumidaPFSimplificadoDto,
  })
  scoreCreditoRendaPresumidaPFSimplificado: ScoreCreditoRendaPresumidaPFSimplificadoDto;
}
