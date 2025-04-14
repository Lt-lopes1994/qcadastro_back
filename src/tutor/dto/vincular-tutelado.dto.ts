import { IsNotEmpty, IsNumber } from 'class-validator';

export class VincularTuteladoDto {
  @IsNotEmpty()
  @IsNumber()
  tuteladoId: number;
}
