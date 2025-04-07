import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  roleId: number;
}
