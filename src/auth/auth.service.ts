/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SecurityService } from '../security/security.service';
import { BruteForceProtectionService } from '../security/brute-force-protection.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private securityService: SecurityService,
    private jwtService: JwtService,
    private bruteForceService: BruteForceProtectionService,
  ) {}

  async validateUser(
    cpf: string,
    password: string,
    ipAddress: string,
  ): Promise<any> {
    // Verificar se o IP está bloqueado
    const isBlocked = await this.bruteForceService.isIpBlocked(ipAddress);
    if (isBlocked) {
      throw new UnauthorizedException(
        'Acesso temporariamente bloqueado devido a múltiplas tentativas falhas',
      );
    }

    try {
      const user = await this.userService.findUserByCpf(cpf);
      if (!user) {
        await this.bruteForceService.recordLoginAttempt(ipAddress, cpf, false);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await this.securityService.verifyPassword(
        user.password,
        password,
      );

      if (!isPasswordValid) {
        await this.bruteForceService.recordLoginAttempt(ipAddress, cpf, false);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Registrar login bem-sucedido
      await this.bruteForceService.recordLoginAttempt(ipAddress, cpf, true);

      const { password: _, ...result } = user;

      return result;
    } catch (error) {
      throw new UnauthorizedException('Erro de autenticação: ' + error.message);
    }
  }

  login(user: any) {
    const payload = {
      sub: user.id,
      cpf: user.cpf,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      fotoPath: user.fotoPath || null,
    };

    const jwtToken = this.jwtService.sign(payload);

    // Obter as informações de expiração do token para o frontend
    const expiresIn = '24h'; // valor padrão que deve corresponder à configuração do JwtModule

    return {
      access_token: jwtToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: {
        id: user.id,
        cpf: user.cpf,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        // Adicionar campos extras solicitados
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isActive: user.isActive,
        lgpdAcceptedAt: user.lgpdAcceptedAt,
        cpfStatus: user.cpfStatus,
        fotoPath: user.fotoPath,
      },
    };
  }
}
