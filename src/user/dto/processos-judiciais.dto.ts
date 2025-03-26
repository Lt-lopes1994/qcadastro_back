import {
  IsString,
  IsObject,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AdvogadoDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  oab?: string;
}

class AssuntoCnjDto {
  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  codigoCNJ?: string;

  @IsBoolean()
  @IsOptional()
  ePrincipal?: boolean;
}

class ClasseProcessualDto {
  @IsString()
  nome: string;
}

class ParteProcessoDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  @IsString()
  @IsOptional()
  polo?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsArray()
  @IsOptional()
  advogados?: AdvogadoDto[];
}

class ValorCausaDto {
  @IsString()
  @IsOptional()
  moeda?: string;

  @IsNumber()
  @IsOptional()
  valor?: number;
}

class StatusProcessoDto {
  @IsString()
  @IsOptional()
  statusProcesso?: string;

  @IsArray()
  @IsOptional()
  julgamentos?: any[];

  @IsString()
  @IsOptional()
  ramoDireito?: string;

  @IsArray()
  @IsOptional()
  penhoras?: any[];

  @IsString()
  @IsOptional()
  justicaGratuita?: string;
}

class MovimentoDto {
  @IsDateString()
  @IsOptional()
  data?: string;

  @IsNumber()
  @IsOptional()
  indice?: number;

  @IsObject()
  @IsOptional()
  classificacaoCNJ?: any;

  @IsBoolean()
  @IsOptional()
  eMovimento?: boolean;

  @IsArray()
  @IsOptional()
  nomeOriginal?: string[];
}

class ProcessoDto {
  @IsString()
  @IsOptional()
  numero?: string;

  @IsString()
  @IsOptional()
  numeroProcessoUnico?: string;

  @IsString()
  @IsOptional()
  numeroProcessoAntigo?: string;

  @IsString()
  @IsOptional()
  urlProcesso?: string;

  @IsNumber()
  @IsOptional()
  grauProcesso?: number;

  @IsString()
  @IsOptional()
  sistema?: string;

  @IsString()
  @IsOptional()
  segmento?: string;

  @IsString()
  @IsOptional()
  tribunal?: string;

  @IsString()
  @IsOptional()
  uf?: string;

  @IsString()
  @IsOptional()
  orgaoJulgador?: string;

  @IsString()
  @IsOptional()
  unidadeOrigem?: string;

  @IsObject()
  @IsOptional()
  classeProcessual?: ClasseProcessualDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AssuntoCnjDto)
  assuntosCNJ?: AssuntoCnjDto[];

  @IsDateString()
  @IsOptional()
  dataDistribuicao?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ParteProcessoDto)
  partes?: ParteProcessoDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MovimentoDto)
  movimentos?: MovimentoDto[];

  @IsObject()
  @IsOptional()
  valorCausa?: ValorCausaDto;

  @IsBoolean()
  @IsOptional()
  ePrioritario?: boolean;

  @IsBoolean()
  @IsOptional()
  eSegredoJustica?: boolean;

  @IsBoolean()
  @IsOptional()
  eProcessoDigital?: boolean;

  @IsString()
  @IsOptional()
  juiz?: string;

  @IsObject()
  @IsOptional()
  status?: StatusProcessoDto;

  @IsDateString()
  @IsOptional()
  dataAutuacao?: string;

  @IsDateString()
  @IsOptional()
  dataProcessamento?: string;
}

class ProcessosCpfDto {
  @IsNumber()
  @IsOptional()
  totalProcessos?: number;

  @IsNumber()
  @IsOptional()
  totalProcessosAutor?: number;

  @IsNumber()
  @IsOptional()
  totalProcessosReu?: number;

  @IsNumber()
  @IsOptional()
  processosUltimos180dias?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessoDto)
  processos: ProcessoDto[];
}

export class NetrinResponseDto {
  @IsString()
  @IsOptional()
  cpf?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ProcessosCpfDto)
  processosCPF: ProcessosCpfDto;
}
