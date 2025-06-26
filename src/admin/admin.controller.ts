import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CertificateManagerService } from '../security/certificate-manager.service';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserRequest } from '../types';
import { Req } from '@nestjs/common';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly certificateManager: CertificateManagerService) {}

  @Post('certificate/update')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        certificate: {
          type: 'string',
          format: 'binary',
          description: 'Novo certificado digital em formato P12/PFX',
        },
        password: {
          type: 'string',
          description: 'Senha do novo certificado',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('certificate'))
  async updateCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Body('password') password: string,
    @Req() request: UserRequest,
  ) {
    // Verificar se o usuário é admin
    if (request.user.role !== 'admin') {
      throw new UnauthorizedException(
        'Apenas administradores podem atualizar certificados',
      );
    }

    if (!file) {
      throw new BadRequestException('Arquivo de certificado não fornecido');
    }

    if (!password) {
      throw new BadRequestException('Senha do certificado é obrigatória');
    }

    const success = await this.certificateManager.updateCertificate(
      file.buffer,
      password,
    );

    if (!success) {
      throw new BadRequestException('Não foi possível atualizar o certificado');
    }

    return { message: 'Certificado atualizado com sucesso' };
  }
}
