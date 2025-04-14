/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { TutorService } from './tutor.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { VincularTuteladoDto } from './dto/vincular-tutelado.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { UserRequest } from '../user/interfaces/user-request.interface';

@Controller('tutores')
@UseGuards(JwtAuthGuard)
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post()
  async cadastrar(
    @Body() createTutorDto: CreateTutorDto,
    @Req() request: UserRequest,
  ) {
    const userId = request.user.id;
    return this.tutorService.cadastrarUsuario(userId, createTutorDto);
  }

  @Post(':id/vincular-tutelado')
  async vincularTutelado(
    @Param('id', ParseIntPipe) tutorId: number,
    @Body() vincularDto: VincularTuteladoDto,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário tem permissão (é o próprio tutor ou admin)
    const tutor = await this.tutorService.findTutorByUserId(request.user.id);
    if (request.user.role !== 'admin' && tutor.id !== tutorId) {
      throw new ForbiddenException(
        'Você não tem permissão para realizar esta operação',
      );
    }

    return this.tutorService.vincularTutelado(tutorId, vincularDto);
  }

  @Delete(':tutorId/tutelados/:tuteladoId')
  async desvincularTutelado(
    @Param('tutorId', ParseIntPipe) tutorId: number,
    @Param('tuteladoId', ParseIntPipe) tuteladoId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário tem permissão (é o próprio tutor ou admin)
    if (request.user.role !== 'admin') {
      const tutor = await this.tutorService.findTutorByUserId(request.user.id);
      if (tutor.id !== tutorId) {
        throw new ForbiddenException(
          'Você não tem permissão para realizar esta operação',
        );
      }
    }

    return this.tutorService.desvincularTutelado(tutorId, tuteladoId);
  }

  @Get('perfil')
  async perfilTutor(@Req() request: UserRequest) {
    return this.tutorService.findTutorByUserId(request.user.id);
  }

  @Get('tutelado/perfil')
  async perfilTutelado(@Req() request: UserRequest) {
    return this.tutorService.findTuteladoByUserId(request.user.id);
  }

  @Get(':id/tutelados')
  async listarTutelados(
    @Param('id', ParseIntPipe) tutorId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário tem permissão (é o próprio tutor ou admin)
    if (request.user.role !== 'admin') {
      try {
        const tutor = await this.tutorService.findTutorByUserId(
          request.user.id,
        );
        if (tutor.id !== tutorId) {
          throw new ForbiddenException(
            'Você não tem permissão para acessar estes dados',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar estes dados',
        );
      }
    }

    return this.tutorService.listarTutelados(tutorId);
  }

  @Get()
  async listarTodos(@Req() request: UserRequest) {
    // Somente admins podem listar todos os tutores
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Somente administradores podem listar todos os tutores',
      );
    }

    return this.tutorService.listarTodosTutores();
  }
}
