import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class FipeItemDto {
  @IsString()
  @IsOptional()
  ano_modelo?: string;

  @IsString()
  @IsOptional()
  codigo_fipe?: string;

  @IsString()
  @IsOptional()
  combustivel?: string;

  @IsString()
  @IsOptional()
  texto_marca?: string;

  @IsString()
  @IsOptional()
  texto_modelo?: string;

  @IsString()
  @IsOptional()
  texto_valor?: string;
}

export class VeiculoFipeDto {
  @IsObject({ each: true })
  @IsOptional()
  dados?: FipeItemDto[];
}

export class VeiculoExtraDto {
  @IsString()
  @IsOptional()
  chassi?: string;

  @IsString()
  @IsOptional()
  combustivel?: string;

  @IsString()
  @IsOptional()
  especie?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  tipoVeiculo?: string;
}

export class VeiculoPlacaDto {
  @IsString()
  @IsNotEmpty({ message: 'A marca é obrigatória' })
  marca: string;

  @IsString()
  @IsNotEmpty({ message: 'O modelo é obrigatório' })
  modelo: string;

  @IsString()
  @IsNotEmpty({ message: 'A marca/modelo é obrigatória' })
  marcaModelo: string;

  @IsString()
  @IsOptional()
  submodelo?: string;

  @IsString()
  @IsOptional()
  versao?: string;

  @IsString()
  @IsNotEmpty({ message: 'O ano é obrigatório' })
  ano: string;

  @IsString()
  @IsNotEmpty({ message: 'O ano do modelo é obrigatório' })
  anoModelo: string;

  @IsString()
  @IsOptional()
  chassi?: string;

  @IsString()
  @IsOptional()
  cor?: string;

  @IsString()
  @IsOptional()
  municipio?: string;

  @IsString()
  @IsOptional()
  uf?: string;

  @IsString()
  @IsOptional()
  origem?: string;

  @IsString()
  @IsOptional()
  situacao?: string;

  @IsString()
  @IsOptional()
  segmento?: string;

  @IsString()
  @IsOptional()
  subSegmento?: string;

  @IsObject()
  @IsOptional()
  fipe?: VeiculoFipeDto;

  @IsObject()
  @IsOptional()
  extra?: VeiculoExtraDto;
}

export class CreateVeiculoDto {
  @IsString()
  @IsNotEmpty({ message: 'A placa é obrigatória' })
  placa: string;

  @IsObject()
  @IsNotEmpty({ message: 'Os dados do veículo são obrigatórios' })
  veiculoPlaca: VeiculoPlacaDto;
}
