import { IsBoolean, IsNotEmpty } from 'class-validator';

export class AssinarContratoDto {
  @IsNotEmpty()
  @IsBoolean()
  assinado: boolean;
}
