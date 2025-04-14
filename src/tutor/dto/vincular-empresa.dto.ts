import { IsNotEmpty, IsNumber } from 'class-validator';

export class VincularEmpresaDto {
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;
}
