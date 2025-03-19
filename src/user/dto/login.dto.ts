import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'CPF é obrigatório' })
  cpf: string;

  @IsString({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;
}
