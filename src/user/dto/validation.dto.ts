import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  ValidateIf,
  Matches,
} from 'class-validator';

export class SendVerificationCodeDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Número de telefone inválido' })
  @IsOptional()
  phoneNumber?: string;

  @ValidateIf((o) => !o.email && !o.phoneNumber)
  @IsString({ message: 'É necessário fornecer email ou telefone' })
  requiredField: string = 'Este campo é usado apenas para validação';
}

export class VerifyCodeDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Número de telefone inválido' })
  @IsOptional()
  phoneNumber?: string;

  @IsString({ message: 'O código é obrigatório' })
  @MinLength(6, { message: 'O código deve ter no mínimo 6 caracteres' })
  code: string;

  @ValidateIf((o) => !o.email && !o.phoneNumber)
  @IsString({ message: 'É necessário fornecer email ou telefone' })
  requiredField: string = 'Este campo é usado apenas para validação';
}
