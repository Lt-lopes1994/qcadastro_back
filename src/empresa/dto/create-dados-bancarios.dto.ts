import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateDadosBancariosDto {
  @IsNotEmpty()
  @IsString()
  apelidoConta: string;

  @IsNotEmpty()
  @IsString()
  condicaoVencimento: string;

  @IsNotEmpty()
  @IsString()
  condicaoPagamento: string;

  @IsNotEmpty()
  @IsString()
  nomeBanco: string;

  @IsNotEmpty()
  @IsString()
  agencia: string;

  @IsNotEmpty()
  @IsString()
  tipoConta: string;

  @IsNotEmpty()
  @IsString()
  numeroConta: string;

  @IsNotEmpty()
  @IsString()
  digitoVerificador: string;

  @IsNotEmpty()
  @IsString()
  chavePix: string;

  @IsNotEmpty()
  @IsNumber()
  empresaId: number;
}
