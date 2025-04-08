import { Injectable } from '@nestjs/common';
import { UserRole, ROLE_HIERARCHY } from '../enums/roles.enum';

@Injectable()
export class PermissionsService {
  /**
   * Verifica se a role1 tem permissão igual ou maior que a role2
   */
  hasPermission(role1: string, role2: string): boolean {
    const role1Index = ROLE_HIERARCHY.indexOf(role1 as UserRole);
    const role2Index = ROLE_HIERARCHY.indexOf(role2 as UserRole);

    // Se alguma role não existir na hierarquia, não tem permissão
    if (role1Index === -1 || role2Index === -1) {
      return false;
    }

    // Quanto maior o índice, maior o nível de permissão
    return role1Index >= role2Index;
  }

  /**
   * Verifica se o usuário possui pelo menos uma das roles especificadas
   */
  hasRole(userRole: string, requiredRoles: string[]): boolean {
    // Se não houver roles requeridas, permite acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Verifica se o usuário tem alguma das roles requeridas ou uma role superior
    return requiredRoles.some((role) => this.hasPermission(userRole, role));
  }
}
