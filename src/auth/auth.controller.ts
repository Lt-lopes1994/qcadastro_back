/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cpf: { type: 'string', example: '12345678900' },
        password: { type: 'string', example: 'senha123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Autenticação bem-sucedida' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
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
