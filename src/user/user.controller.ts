/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { IpBlockGuard } from '../security/guards/ip-block.guard';
import { NetrinResponseDto } from './dto/processos-judiciais.dto';
import { SendVerificationCodeDto, VerifyCodeDto } from './dto/validation.dto';
import { RegisteredUser } from './entity/user.entity';
import { UserRequest } from './interfaces/user-request.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  async register(
    @Body() userData: Partial<RegisteredUser>,
  ): Promise<RegisteredUser> {
    return this.userService.createUser(userData);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(IpBlockGuard)
  @Post('send-verification-code')
  async sendVerificationCode(
    @Body() dto: SendVerificationCodeDto,
  ): Promise<{ message: string }> {
    if (dto.email) {
      await this.userService.sendEmailVerificationCode(dto.email);
      return { message: 'Código de verificação enviado para o email' };
    } else if (dto.phoneNumber) {
      await this.userService.sendPhoneVerificationCode(dto.phoneNumber);
      return { message: 'Código de verificação enviado para o telefone' };
    } else {
      throw new BadRequestException('É necessário fornecer email ou telefone');
    }
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(IpBlockGuard)
  @Post('verify-email')
  async verifyEmail(
    @Body() dto: VerifyCodeDto,
  ): Promise<{ success: boolean; message: string }> {
    if (!dto.email || !dto.code) {
      throw new BadRequestException('Email e código são obrigatórios');
    }

    const success = await this.userService.verifyEmail(dto.email, dto.code);
    return {
      success,
      message: 'Email verificado com sucesso',
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(IpBlockGuard)
  @Post('verify-phone')
  async verifyPhone(
    @Body() dto: VerifyCodeDto,
  ): Promise<{ success: boolean; message: string }> {
    if (!dto.phoneNumber || !dto.code) {
      throw new BadRequestException(
        'Número de telefone e código são obrigatórios',
      );
    }

    const success = await this.userService.verifyPhone(
      dto.phoneNumber,
      dto.code,
    );
    return {
      success,
      message: 'Telefone verificado com sucesso',
    };
  }

  @Post(':id/save-processos-judiciais')
  async saveProcessosJudiciais(
    @Param('id') userId: number,
    @Body() netrinData: NetrinResponseDto,
    @Req() req: UserRequest,
  ) {
    // Verificar se o usuário está tentando modificar seus próprios dados
    // ou se tem permissão de admin
    if (req.user.role !== 'admin' && req.user.id !== +userId) {
      throw new BadRequestException(
        'Você não tem permissão para realizar esta ação',
      );
    }

    return this.userService.saveProcessosJudiciais(+userId, netrinData);
  }

  // Outros endpoints para verificar CPF, etc.
}
