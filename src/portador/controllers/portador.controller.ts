import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ParseIntPipe,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PortadorService } from '../services/portador.service';
import { CreatePortadorDto } from '../dto/create-portador.dto';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { UserRequest } from '../../user/interfaces/user-request.interface';

@Controller('portadores')
export class PortadorController {
  constructor(private readonly portadorService: PortadorService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cnhImagem', maxCount: 1 },
      { name: 'anttImagem', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createPortadorDto: CreatePortadorDto,
    @UploadedFiles()
    files: {
      cnhImagem?: Express.Multer.File[];
      anttImagem?: Express.Multer.File[];
    },
    @Req() request: UserRequest,
  ) {
    // Verificar se a imagem da CNH foi enviada
    if (!files.cnhImagem || !files.cnhImagem[0]) {
      throw new BadRequestException('A imagem da CNH é obrigatória');
    }

    // Obter o ID do usuário do token JWT
    const userId = request.user.id;

    return this.portadorService.create(
      createPortadorDto,
      userId,
      files.cnhImagem[0],
      files.anttImagem && files.anttImagem[0] ? files.anttImagem[0] : undefined,
    );
  }

  // As demais rotas de portador são protegidas por padrão
  // Implementar validação de acesso baseado em role se necessário:

  @Get()
  findAll() {
    return this.portadorService.findAll();
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário está tentando acessar seus próprios dados
    // ou se tem permissão admin
    if (request.user.role !== 'admin' && request.user.id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar estes dados',
      );
    }

    return this.portadorService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.portadorService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cnhImagem', maxCount: 1 },
      { name: 'anttImagem', maxCount: 1 },
    ]),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePortadorDto: Partial<CreatePortadorDto>,
    @UploadedFiles()
    files: {
      cnhImagem?: Express.Multer.File[];
      anttImagem?: Express.Multer.File[];
    },
  ) {
    return this.portadorService.update(
      id,
      updatePortadorDto,
      files.cnhImagem && files.cnhImagem[0] ? files.cnhImagem[0] : undefined,
      files.anttImagem && files.anttImagem[0] ? files.anttImagem[0] : undefined,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.portadorService.remove(id);
  }

  // Proteger rotas administrativas com verificação de role
  @Post(':id/aprovar')
  async aprovar(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ) {
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem aprovar documentos',
      );
    }

    return this.portadorService.aprovarDocumentos(id);
  }

  @Post(':id/rejeitar')
  async rejeitar(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
    @Req() request: UserRequest,
  ) {
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem rejeitar documentos',
      );
    }

    return this.portadorService.rejeitarDocumentos(id, motivo);
  }
}
