// src/empresa/dto/create-empresa.dto.ts
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateEmpresaDto {
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @IsNotEmpty()
  @IsString()
  razaoSocial: string;

  @IsNotEmpty()
  @IsString()
  nomeFantasia: string;

  @IsNotEmpty()
  @IsString()
  naturezaJuridica: string;

  @IsNotEmpty()
  @IsString()
  logradouro: string;

  @IsNotEmpty()
  @IsString()
  numero: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsNotEmpty()
  @IsString()
  bairro: string;

  @IsNotEmpty()
  @IsString()
  municipio: string;

  @IsNotEmpty()
  @IsString()
  cep: string;

  @IsNotEmpty()
  @IsString()
  uf: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  telefone: string;

  @IsNotEmpty()
  @IsString()
  situacaoCadastral: string;

  @IsNotEmpty()
  @IsString()
  dataInicioAtividade: string;

  @IsNotEmpty()
  @IsString()
  atividadeEconomica: string;

  @IsNotEmpty()
  @IsString()
  porte: string;

  @IsNotEmpty()
  @IsString()
  capitalSocial: string;

  @IsOptional()
  @IsString()
  urlComprovante?: string;
}
