import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePortadorDto {
  @IsString({ message: 'O número da CNH é obrigatório' })
  @IsNotEmpty({ message: 'O número da CNH não pode ser vazio' })
  cnhNumero: string;

  @IsString({ message: 'A categoria da CNH é obrigatória' })
  @IsNotEmpty({ message: 'A categoria da CNH não pode ser vazia' })
  cnhCategoria: string;

  @IsDateString({}, { message: 'A validade da CNH deve ser uma data válida' })
  cnhValidade: string;

  @IsOptional()
  @IsString()
  anttNumero?: string;

  @IsOptional()
  @IsDateString({}, { message: 'A validade da ANTT deve ser uma data válida' })
  anttValidade?: string;
}
