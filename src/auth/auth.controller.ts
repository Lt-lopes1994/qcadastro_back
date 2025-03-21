/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, UseGuards, Request, Body, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../user/dto/login.dto';
import { IpBlockGuard } from '../security/guards/ip-block.guard';
import { Request as ExpressRequest } from 'express';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(IpBlockGuard)
  @Post('login')
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
