import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  level?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
