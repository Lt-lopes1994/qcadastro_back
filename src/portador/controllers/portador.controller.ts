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
  findAll(@Req() request: UserRequest) {
    // Verificar se o usuário é admin
    // Se não for admin, lançar uma exceção de permissão negada
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem acessar todos os portadores',
      );
    }
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

  @Get('portador/:userId')
  findOneByUser(
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

  @Get('portador-filtrado')
  async findAllNewPortadores(
    @Req() request: UserRequest,
    @Body('startDate') startDate: Date,
    @Body('endDate') endDate: Date,
  ) {
    console.log('startDate', startDate);
    console.log('endDate', endDate);
    // Verificar se o usuário é admin ou auditor
    if (request.user.role !== 'admin' && request.user.role !== 'auditor') {
      throw new ForbiddenException(
        'Apenas administradores podem acessar todos os portadores',
      );
    }
    // Verificar se as datas foram enviadas
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'As datas de início e fim são obrigatórias',
      );
    }
    // Verificar se a data de início é anterior à data de fim
    if (startDate >= endDate) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de fim',
      );
    }
    // Chamar o serviço para buscar os portadores filtrados
    // com base nas datas fornecidas
    return this.portadorService.findAllNewPortadores(startDate, endDate);
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
  @UseGuards(JwtAuthGuard)
  async aprovarDocumentos(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário é admin
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem aprovar documentos',
      );
    }

    return this.portadorService.aprovarDocumentos(id);
  }

  @Post(':id/rejeitar')
  @UseGuards(JwtAuthGuard)
  async rejeitarDocumentos(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário é admin
    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem rejeitar documentos',
      );
    }

    return this.portadorService.rejeitarDocumentos(id, motivo);
  }
}
