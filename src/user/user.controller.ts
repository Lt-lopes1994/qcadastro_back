import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { SendVerificationCodeDto, VerifyCodeDto } from './dto/validation.dto';
import { IpBlockGuard } from '../security/guards/ip-block.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.createUser(userData);
  }

  // Aplicando limites de taxa mais restritivos para endpoints críticos
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

  // Outros endpoints para verificar CPF, etc.
}
