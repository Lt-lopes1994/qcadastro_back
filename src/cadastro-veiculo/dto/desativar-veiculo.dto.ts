import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DesativarVeiculoDto {
  @ApiProperty({
    description: 'Motivo da desativação do veículo',
    example: 'Veículo em manutenção prolongada',
  })
  @IsString()
  @IsNotEmpty({ message: 'O motivo da desativação é obrigatório' })
  @MaxLength(255, { message: 'O motivo não pode ter mais de 255 caracteres' })
  motivo: string;
}
