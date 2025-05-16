import { ApiProperty } from '@nestjs/swagger';

export class RestricaoVeiculoDto {
  @ApiProperty({
    description: 'Tipo da restrição',
    example: 'ALIENAÇÃO FIDUCIÁRIA',
  })
  tipo: string;

  @ApiProperty({
    description: 'Data de inclusão da restrição',
    example: '10/01/2022',
  })
  dataInclusao: string;

  @ApiProperty({
    description: 'Órgão responsável pela restrição',
    example: 'DETRAN-SP',
  })
  orgao: string;
}

export class VeiculoPlacaResponseDto {
  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC1D23',
  })
  placa: string;

  @ApiProperty({
    description: 'Número do RENAVAM',
    example: '12345678901',
  })
  renavam: string;

  @ApiProperty({
    description: 'Número do chassi',
    example: '9BWHE21JX24060960',
  })
  chassi: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'GOL 1.0',
  })
  modelo: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'VW - VOLKSWAGEN',
  })
  marca: string;

  @ApiProperty({
    description: 'Ano de fabricação',
    example: '2020',
  })
  ano: string;

  @ApiProperty({
    description: 'Ano do modelo',
    example: '2021',
  })
  anoModelo: string;

  @ApiProperty({
    description: 'Cor do veículo',
    example: 'BRANCA',
  })
  cor: string;

  @ApiProperty({
    description: 'Tipo de combustível',
    example: 'FLEX',
    enum: [
      'FLEX',
      'GASOLINA',
      'ETANOL',
      'DIESEL',
      'GNV',
      'ELÉTRICO',
      'HÍBRIDO',
    ],
  })
  combustivel: string;

  @ApiProperty({
    description: 'Município de registro',
    example: 'SÃO PAULO',
  })
  municipio: string;

  @ApiProperty({
    description: 'UF de registro',
    example: 'SP',
  })
  uf: string;

  @ApiProperty({
    description: 'Lista de restrições do veículo',
    type: [RestricaoVeiculoDto],
    example: [],
  })
  restricoes: RestricaoVeiculoDto[];
}
