import { Body, Controller, Ip, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { IpBlockGuard } from '../security/guards/ip-block.guard';
import { LoginDto } from '../user/dto/login.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { getClientIp } from '../utils/ip.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(IpBlockGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Autentica um usuário com CPF e senha, retornando um token JWT válido por 24 horas.',
  })
  @ApiBody({
    description: 'Credenciais do usuário',
    type: LoginDto,
    examples: {
      loginExample: {
        summary: 'Exemplo de credenciais',
        value: {
          cpf: '12345678900',
          password: 'senha123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticação bem-sucedida',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'Token JWT para autenticação',
        },
        token_type: {
          type: 'string',
          example: 'Bearer',
          description: 'Tipo do token',
        },
        expires_in: {
          type: 'string',
          example: '24h',
          description: 'Tempo de expiração do token',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            cpf: { type: 'string', example: '123.456.789-00' },
            firstName: { type: 'string', example: 'João' },
            lastName: { type: 'string', example: 'Silva' },
            phoneNumber: { type: 'string', example: '11987654321' },
            email: { type: 'string', example: 'joao.silva@exemplo.com' },
            role: {
              type: 'string',
              example: 'user',
              enum: ['admin', 'user', 'auditor'],
            },
            emailVerified: { type: 'boolean', example: true },
            phoneVerified: { type: 'boolean', example: true },
            isActive: { type: 'boolean', example: true },
            fotoPath: {
              type: 'string',
              example: '/uploads/user-photos/avatar.jpg',
              nullable: true,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Email ou senha inválidos' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'IP bloqueado por tentativas excessivas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: {
          type: 'string',
          example:
            'IP temporariamente bloqueado por tentativas excessivas de login',
        },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['cpf deve ser um CPF válido'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Request() req: ExpressRequest,
  ) {
    // Usar o utilitário para obter o IP real
    const clientIp = getClientIp(req);

    // Passa o IP real para o serviço
    return this.authService.login(
      await this.authService.validateUser(
        loginDto.cpf,
        loginDto.password,
        clientIp, // Usar o IP real aqui
      ),
    );
  }
}
