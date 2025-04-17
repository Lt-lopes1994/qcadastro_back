import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RespostaSolicitacaoDto {
  @IsBoolean()
  aprovado: boolean;

  @IsOptional()
  @IsString()
  mensagem?: string;
}
