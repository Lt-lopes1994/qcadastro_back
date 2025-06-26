import { ApiProperty } from '@nestjs/swagger';

export class ProtestoCenprotDto {
  @ApiProperty({
    description: 'CPF ou CNPJ do protestado',
    example: '00000000000000',
  })
  cpfCnpj: string;

  @ApiProperty({
    description: 'Data do protesto',
    example: '2017-10-10',
  })
  data: string;

  @ApiProperty({
    description: 'Data do protesto formalizada',
    example: '2017-10-10',
  })
  dataProtesto: string;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '',
  })
  dataVencimento: string;

  @ApiProperty({
    description: 'Valor do protesto',
    example: '9.900,00',
  })
  valor: string;
}

export class CartorioCenprotDto {
  @ApiProperty({
    description: 'Nome do cartório',
    example: 'TABELIAO DE NOTAS E DE PROTESTO DE LETRAS E TITULOS',
  })
  cartorio: string;

  @ApiProperty({
    description: 'Código para obter detalhes do cartório',
    example: 'U2FsdGVkX19DEoxsivBZdEVPDKUKVOPXrYkOP0I18bplpfUZrzzx+XDiCT7dJhBv',
    nullable: true,
  })
  obterDetalhes: string | null;

  @ApiProperty({
    description: 'Cidade do cartório',
    example: 'SUMARE',
  })
  cidade: string;

  @ApiProperty({
    description: 'Quantidade de títulos',
    example: '',
  })
  quantidadeTitulos: string;

  @ApiProperty({
    description: 'Endereço do cartório',
    example: 'PRACA MANOEL DE VASCONCELOS, 426 CENTRO, SUMARE - SP',
  })
  endereco: string;

  @ApiProperty({
    description: 'Telefone do cartório',
    example: '19 3396-2809',
  })
  telefone: string;

  @ApiProperty({
    description: 'Lista de protestos neste cartório',
    type: [ProtestoCenprotDto],
  })
  protestos: ProtestoCenprotDto[];
}

export class CenprotResponseDto {
  @ApiProperty({
    description: 'CNPJ consultado',
    example: '00000000000000',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Protestos registrados no Cenprot, organizados por UF',
    type: Object,
    additionalProperties: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/CartorioCenprotDto',
      },
    },
  })
  cenprotProtestos: Record<string, CartorioCenprotDto[]>;
}
