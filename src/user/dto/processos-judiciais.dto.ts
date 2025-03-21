import {
  IsString,
  IsObject,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

class ParteProcessoDto {
  @IsString()
  nome: string;

  @IsString()
  posicao: string;

  @IsString()
  tipo: string;
}

class ProcessoDto {
  @IsString()
  numero: string;

  @IsString()
  @IsOptional()
  dataNotificacao: string;

  @IsString()
  @IsOptional()
  tipo: string;

  @IsString()
  @IsOptional()
  assuntoPrincipal: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  varaJulgadora: string;

  @IsString()
  @IsOptional()
  tribunal: string;

  @IsString()
  @IsOptional()
  tribunalLevel: string;

  @IsString()
  @IsOptional()
  tribunalTipo: string;

  @IsString()
  @IsOptional()
  tribunalCidade: string;

  @IsString()
  @IsOptional()
  estado: string;

  @IsArray()
  @IsOptional()
  partes: ParteProcessoDto[];
}

class ProcessosCpfDto {
  @IsNumber()
  totalProcessos: number;

  @IsNumber()
  totalProcessosAutor: number;

  @IsNumber()
  totalProcessosReu: number;

  @IsNumber()
  processosUltimos180dias: number;

  @IsArray()
  processos: ProcessoDto[];
}

export class NetrinResponseDto {
  @IsString()
  cpf: string;

  @IsObject()
  processosCPF: ProcessosCpfDto;
}
