/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../admin/entities/role.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obter o nível mínimo de role necessário para o endpoint
    const requiredRoleLevel = this.reflector.get<number>(
      'role',
      context.getHandler(),
    );

    // Se não houver role necessária, permitir o acesso
    if (!requiredRoleLevel) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se não houver usuário autenticado, negar acesso
    if (!user) {
      return false;
    }

    // Buscar informações da role do usuário
    const userRole = await this.roleRepository.findOne({
      where: { id: user.roleId },
    });

    // Se não encontrar a role, negar acesso
    if (!userRole) {
      return false;
    }

    // Verificar se o nível da role do usuário é suficiente
    return userRole.level >= requiredRoleLevel;
  }
}
