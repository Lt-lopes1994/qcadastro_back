import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DesativarVeiculoDto {
  @ApiProperty({
    description: 'Motivo da desativação do veículo',
    example: 'Veículo em manutenção prolongada',
  })
  @IsString()
  @IsNotEmpty({ message: 'O motivo da desativação é obrigatório' })
  motivo: string;
}
