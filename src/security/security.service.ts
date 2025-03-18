/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  // Gerar um hash seguro para senhas
  async hashPassword(password: string): Promise<string> {
    // Em uma implementação real, você deve usar bcrypt
    // Isso é apenas uma demonstração
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  // Verificar se a senha está correta
  async verifyPassword(
    storedPassword: string,
    suppliedPassword: string,
  ): Promise<boolean> {
    const [salt, storedHash] = storedPassword.split(':');
    const hash = crypto
      .pbkdf2Sync(suppliedPassword, salt, 1000, 64, 'sha512')
      .toString('hex');
    return storedHash === hash;
  }

  // Gerar um token seguro (para redefinição de senha, etc.)
  generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Sanitizar entrada para evitar SQL injection
  sanitizeInput(input: string): string {
    // Implementação básica - em um ambiente real, use bibliotecas específicas
    return input
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/\0/g, '\\0');
  }
}
