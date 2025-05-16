import { ApiProperty } from '@nestjs/swagger';

export class RegularidadeCpfDto {
  @ApiProperty({
    description: 'CPF do contribuinte',
    example: '00000000000',
  })
  cpf: string;

  @ApiProperty({
    description: 'Nome completo do contribuinte',
    example: 'JHON DOE',
  })
  nome: string;

  @ApiProperty({
    description: 'Primeiro nome do contribuinte',
    example: 'JHON',
  })
  primeiroNome: string;

  @ApiProperty({
    description: 'Sobrenome do contribuinte',
    example: 'DOE',
  })
  sobrenome: string;

  @ApiProperty({
    description: 'Situação cadastral do CPF',
    example: 'REGULAR',
    enum: ['REGULAR', 'SUSPENSA', 'CANCELADA', 'FALECIDO'],
  })
  situacaoCadastral: string;

  @ApiProperty({
    description: 'País de origem (para estrangeiros)',
    example: '',
    required: false,
  })
  paisOrigem: string;

  @ApiProperty({
    description: 'Idade do contribuinte',
    example: 28,
  })
  idade: number;

  @ApiProperty({
    description: 'Nome da mãe do contribuinte',
    example: 'JANE DOE',
  })
  nomeMae: string;

  @ApiProperty({
    description: 'Gênero do contribuinte',
    example: 'M',
    enum: ['M', 'F'],
  })
  genero: string;

  @ApiProperty({
    description: 'Dígito verificador do CPF',
    example: '00',
  })
  digitoVerificador: string;

  @ApiProperty({
    description: 'Informação sobre o comprovante',
    example: '6181.B928.D759.6490',
  })
  comprovante: string;

  @ApiProperty({
    description: 'Data de nascimento do contribuinte',
    example: '10/04/1997',
  })
  dataNascimento: string;

  @ApiProperty({
    description: 'Data de inscrição no CPF',
    example: '02/05/2006',
  })
  dataInscricao: string;

  @ApiProperty({
    description: 'Ano do óbito (se aplicável)',
    example: '',
    required: false,
  })
  anoObito: string;

  @ApiProperty({
    description: 'Data da última atualização dos dados',
    example: '2025-05-16T11:30:00.455401',
  })
  dataAtualizacao: string;

  @ApiProperty({
    description: 'URL para download do comprovante de inscrição',
    example:
      'https://file.netrin.com.br/73004e89-0eb5-4b14-9d37-93633bfb4f5d.html',
  })
  urlComprovante: string;
}

export class ReceitaFederalResponseDto {
  @ApiProperty({
    description: 'CPF consultado',
    example: '00000000000',
  })
  cpf: string;

  @ApiProperty({
    description: 'Dados de regularidade do CPF',
    type: RegularidadeCpfDto,
  })
  regularidadeCpf: RegularidadeCpfDto;
}
