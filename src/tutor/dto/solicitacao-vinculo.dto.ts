import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SolicitacaoVinculoDto {
  @ApiProperty({ description: 'ID do tutor', example: 1 })
  @IsNotEmpty()
  @IsNumber({}, { message: 'tutorId deve ser um número válido' })
  @Min(1, { message: 'tutorId deve ser maior que zero' })
  tutorId: number;
}
