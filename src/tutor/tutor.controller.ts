/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { CreateTutorDto } from './dto/create-tutor.dto';
import type { DesignarVeiculoDto } from './dto/designar-veiculo.dto';
import type { VincularEmpresaDto } from './dto/vincular-empresa.dto';
import { VincularTuteladoDto } from './dto/vincular-tutelado.dto';
import { TutorService } from './tutor.service';

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

  @Post(':id/designar-veiculo')
  async designarVeiculo(
    @Param('id', ParseIntPipe) tutorId: number,
    @Body() designarVeiculoDto: DesignarVeiculoDto,
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
            'Você não tem permissão para realizar esta operação',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para realizar esta operação',
        );
      }
    }

    return this.tutorService.designarVeiculo(tutorId, designarVeiculoDto);
  }

  @Post('enviar-convite')
  async enviarConvite(
    @Body('email') emailDestino: string,
    @Req() request: UserRequest,
  ) {
    const userId = request.user.id;
    await this.tutorService.enviarEmailConvite(emailDestino, userId);

    return {
      success: true,
      message: 'Convite enviado com sucesso',
      email: emailDestino,
    };
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

  @Get('verificar/:cpf')
  async verificarCpf(@Param('cpf') cpf: string) {
    return this.tutorService.verificarCpf(cpf);
  }

  @Post(':id/vincular-empresa')
  async vincularEmpresa(
    @Param('id', ParseIntPipe) tutorId: number,
    @Body() vincularEmpresaDto: VincularEmpresaDto,
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
            'Você não tem permissão para realizar esta operação',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para realizar esta operação',
        );
      }
    }

    return this.tutorService.vincularEmpresa(tutorId, vincularEmpresaDto);
  }

  @Post('vincular-minha-empresa')
  async vincularMinhaEmpresa(
    @Body() vincularEmpresaDto: VincularEmpresaDto,
    @Req() request: UserRequest,
  ) {
    try {
      console.log(
        'Recebendo requisição para vincular empresa:',
        vincularEmpresaDto,
      );
      const userId = request.user.id;
      console.log('UserID do requisitante:', userId);

      const resultado = await this.tutorService.vincularEmpresa(
        userId,
        vincularEmpresaDto,
        true,
      );
      console.log('Resultado da operação:', resultado);

      return {
        success: true,
        message: 'Empresa vinculada com sucesso',
        data: resultado,
      };
    } catch (error) {
      console.error('Erro ao vincular empresa:', error);
      throw error;
    }
  }

  @Post(':id/assinar-contrato')
  async assinarContrato(
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
            'Você não tem permissão para realizar esta operação',
          );
        }
      } catch (error) {
        throw new ForbiddenException(
          'Você não tem permissão para realizar esta operação',
        );
      }
    }

    return this.tutorService.assinarContrato(tutorId);
  }
}
