import { IsNumber } from 'class-validator';

export class SolicitacaoVinculoDto {
  @IsNumber()
  tutorId: number;
}
