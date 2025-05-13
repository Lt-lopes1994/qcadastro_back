import { IsEnum, IsObject, IsOptional } from 'class-validator';

export enum TipoUsuario {
  TUTOR = 'tutor',
  TUTELADO = 'tutelado',
}

export class CreateTutorDto {
  @IsEnum(TipoUsuario)
  tipo: TipoUsuario;

  @IsOptional()
  @IsObject()
  scoreCredito?: any;

  @IsOptional()
  status?: string;
}
