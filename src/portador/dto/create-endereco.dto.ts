import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateEnderecoDto {
  @IsString({ message: 'O CEP é obrigatório' })
  @IsNotEmpty({ message: 'O CEP não pode ser vazio' })
  cep: string;

  @IsString({ message: 'O logradouro é obrigatório' })
  @IsNotEmpty({ message: 'O logradouro não pode ser vazio' })
  logradouro: string;

  @IsString({ message: 'O número é obrigatório' })
  @IsNotEmpty({ message: 'O número não pode ser vazio' })
  numero: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsString({ message: 'O bairro é obrigatório' })
  @IsNotEmpty({ message: 'O bairro não pode ser vazio' })
  bairro: string;

  @IsString({ message: 'A cidade é obrigatória' })
  @IsNotEmpty({ message: 'A cidade não pode ser vazia' })
  cidade: string;

  @IsString({ message: 'O estado é obrigatório' })
  @IsNotEmpty({ message: 'O estado não pode ser vazio' })
  estado: string;

  @IsOptional()
  @IsNumber()
  usuarioId?: number;
}
