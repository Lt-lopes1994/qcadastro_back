import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

// DTO para os dados toxicológicos
class ToxicologicoDto {
  @IsOptional()
  @IsString()
  dataUso?: string;

  @IsOptional()
  @IsString()
  situacao?: string;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;
}

// DTO para os bloqueios
class BloqueioDto {
  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  data?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  penalidadeDias?: string;

  @IsOptional()
  @IsString()
  dataInicio?: string;

  @IsOptional()
  @IsString()
  dataFim?: string;
}

// DTO para dados completos da CNH
class CnhCompletoDto {
  @IsString()
  numero: string;

  @IsString()
  categoria: string;

  @IsDateString()
  dataExpiracao: string;

  @IsOptional()
  @IsString()
  renach?: string;

  @IsOptional()
  @IsDateString()
  primeiraCnh?: string;

  @IsOptional()
  @IsDateString()
  emissaoData?: string;

  @IsOptional()
  @IsString()
  numeroRegistro?: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsObject()
  toxicologico?: ToxicologicoDto;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @IsOptional()
  bloqueios?: BloqueioDto[];
}

// DTO para dados do cliente
class ClienteDto {
  @IsOptional()
  @IsString()
  guid?: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  nomeMae?: string;

  @IsOptional()
  @IsString()
  nomePai?: string;

  @IsOptional()
  @IsString()
  numeroDocumento?: string;

  @IsOptional()
  @IsString()
  numeroRG?: string;

  @IsOptional()
  @IsString()
  estadoRG?: string;

  @IsOptional()
  @IsString()
  expeditorRG?: string;

  @IsOptional()
  @IsDateString()
  dataNascimento?: string;
}

// DTO para dados completos do motorista
class MotoristasCNHcompletoDto {
  @IsObject()
  cnh: CnhCompletoDto;

  @IsObject()
  cliente: ClienteDto;
}

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

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsObject()
  motoristasCNHcompleto?: MotoristasCNHcompletoDto;
}
