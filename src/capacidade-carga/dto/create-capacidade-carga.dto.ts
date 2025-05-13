import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCapacidadeCargaDto {
  @ApiProperty({
    description: 'Nome da configuração de capacidade de carga',
    example: 'Configuração padrão',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'Largura do vão da porta traseira em cm',
    example: 220.5,
  })
  @IsNumber()
  @IsNotEmpty()
  larguraVaoPortaTraseira: number;

  @ApiProperty({
    description: 'Altura do vão da porta traseira em cm',
    example: 180.0,
  })
  @IsNumber()
  @IsNotEmpty()
  alturaVaoPortaTraseira: number;

  @ApiProperty({
    description: 'Profundidade interna do baú em cm',
    example: 450.0,
  })
  @IsNumber()
  @IsNotEmpty()
  profundidadeInternaBau: number;

  @ApiProperty({ description: 'Indica se possui ganchos', example: true })
  @IsBoolean()
  @IsOptional()
  temGanchos: boolean;

  @ApiPropertyOptional({
    description: 'Descreve impedimentos internos, se houver',
    example: 'Divisória parcial no meio do baú',
  })
  @IsString()
  @IsOptional()
  impeditivoInterno?: string;

  @ApiProperty({ description: 'Tara do veículo em kg', example: 2500 })
  @IsNumber()
  @IsNotEmpty()
  tara: number;

  @ApiProperty({ description: 'Lotação (carga total) em kg', example: 5000 })
  @IsNumber()
  @IsNotEmpty()
  lotacao: number;

  @ApiProperty({ description: 'Peso bruto em kg', example: 7500 })
  @IsNumber()
  @IsNotEmpty()
  pesoBruto: number;

  @ApiProperty({
    description: 'Capacidade total de carga em kg',
    example: 5000,
  })
  @IsNumber()
  @IsNotEmpty()
  capacidadeTotalCarga: number;

  @ApiProperty({ description: 'ID do veículo associado', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  veiculoId: number;
}
