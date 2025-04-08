/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  UploadedFile,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { IpBlockGuard } from '../security/guards/ip-block.guard';
import { NetrinResponseDto } from './dto/processos-judiciais.dto';
import { SendVerificationCodeDto, VerifyCodeDto } from './dto/validation.dto';
import { RegisteredUser } from './entity/user.entity';
import { UserRequest } from './interfaces/user-request.interface';
import { UserService } from './user.service';
import { CreateEnderecoDto } from '../portador/dto/create-endereco.dto';

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

  @Public()
  @Post('test-fetch-processos')
  async testFetchProcessos(
    @Body('userId') userId: number,
    @Body('cpf') cpf: string,
  ) {
    return this.userService.fetchProcessosJudiciais(userId, cpf);
  }

  @Post('complete-registration')
  @UseInterceptors(FileInterceptor('foto'))
  async completeRegistration(
    @Body() body: { nome: string; endereco: CreateEnderecoDto },
    @UploadedFile() foto: Express.Multer.File,
    @Req() request: UserRequest,
  ) {
    if (!body.nome || !body.endereco) {
      throw new BadRequestException('Nome e endereço são obrigatórios');
    }

    const userId = request.user.id;

    return this.userService.completeRegistration(userId, body, foto);
  }

  @Post('update-profile')
  @UseInterceptors(FileInterceptor('foto'))
  async updateProfile(
    @Body() body: { nome?: string; endereco?: string },
    @UploadedFile() foto: Express.Multer.File,
    @Req() request: UserRequest,
  ) {
    const userId = request.user.id;

    // Parse do endereço se existir
    const data = {
      nome: body.nome,
      endereco: body.endereco ? JSON.parse(body.endereco) : undefined,
    };

    return this.userService.updateProfile(userId, data, foto);
  }
  @Post('new-users')
  async filterNewUsers(
    @Body('startDate') startDateStr: string,
    @Body('endDate') endDateStr: string,
  ) {
    // Validar e converter as datas
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Verificar se são datas válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Datas inválidas');
    }

    // Se a data for futura, usar a data atual
    const now = new Date();
    if (startDate > now) {
      console.log('Data inicial ajustada: do futuro para 30 dias atrás');
      startDate.setDate(now.getDate() - 30);
    }
    if (endDate > now) {
      console.log('Data final ajustada: do futuro para hoje');
      endDate.setTime(now.getTime());
    }

    return this.userService.filterNewUsers(startDate, endDate);
  }

  @Get('users')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  // Outros endpoints para verificar CPF, etc.
}
