import { ApiProperty } from '@nestjs/swagger';

export class EndpointStatDto {
  @ApiProperty({
    description: 'Tipo de consulta',
    example: 'cpf',
    enum: ['cpf', 'cnpj', 'veiculo', 'scoreCredito', 'processos'],
  })
  tipo: string;

  @ApiProperty({
    description: 'Total de requisições',
    example: '120',
  })
  total: string;
}

export class UserStatDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Total de requisições',
    example: '78',
  })
  total: string;
}

export class EstatisticasResponseDto {
  @ApiProperty({
    description: 'Mês das estatísticas (1-12)',
    example: 7,
  })
  month: number;

  @ApiProperty({
    description: 'Ano das estatísticas',
    example: 2023,
  })
  year: number;

  @ApiProperty({
    description: 'Total de requisições no período',
    example: 256,
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Estatísticas por tipo de endpoint',
    type: [EndpointStatDto],
  })
  byEndpoint: EndpointStatDto[];

  @ApiProperty({
    description: 'Estatísticas por usuário',
    type: [UserStatDto],
  })
  byUser: UserStatDto[];
}
