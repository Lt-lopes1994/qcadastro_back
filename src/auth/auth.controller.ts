/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Ip, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { IpBlockGuard } from '../security/guards/ip-block.guard';
import { LoginDto } from '../user/dto/login.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

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
    const user: any = await this.authService.validateUser(
      loginDto.cpf,
      loginDto.password,
      ip || req.ip || '0.0.0.0',
    );
    return this.authService.login(user);
  }
}
