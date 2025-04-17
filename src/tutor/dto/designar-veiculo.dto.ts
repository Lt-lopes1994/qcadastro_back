import { IsNotEmpty, IsNumber } from 'class-validator';

export class DesignarVeiculoDto {
  @IsNotEmpty()
  @IsNumber()
  tuteladoId: number;

  @IsNotEmpty()
  @IsNumber()
  veiculoId: number;
}
