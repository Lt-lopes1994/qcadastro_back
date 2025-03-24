/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { ClickSignService } from './click-sign.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { PortadorService } from '../portador/services/portador.service';
import { UserService } from '../user/user.service';
import { Logger } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('documentos')
@UseGuards(JwtAuthGuard)
export class ClickSignController {
  private readonly logger = new Logger(ClickSignController.name);

  constructor(
    private readonly clickSignService: ClickSignService,
    private readonly portadorService: PortadorService,
    private readonly userService: UserService,
  ) {}

  @Post('portador/:portadorId/assinar')
  async criarDocumentoPortador(
    @Param('portadorId') portadorId: number,
    @Req() request: UserRequest,
  ) {
    // Obter dados do portador
    const portador = await this.portadorService.findOne(portadorId);

    await this.testarConexao();

    // Verificar se o portador existe
    if (!portador) {
      throw new NotFoundException(
        `Portador com ID ${portadorId} não encontrado`,
      );
    }

    // Verificar se o usuário tem permissão para criar este documento
    if (request.user.role !== 'admin' && request.user.id !== portador.userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      );
    }

    // Obter dados completos do usuário
    const user = await this.userService.findUserByCpf(request.user.cpf);

    // Gerar PDF com dados do portador
    const pdfPath = await this.clickSignService.gerarDocumentoPortador(
      portador,
      user,
    );

    // Enviar para ClickSign e obter URL de assinatura
    const resultado = await this.clickSignService.enviarParaClickSign(
      pdfPath,
      portador,
      user,
    );

    return {
      message: 'Documento criado com sucesso',
      signUrl: resultado.signUrl,
      expiraEm: resultado.expiresAt,
      documentId: resultado.id,
    };
  }

  @Get('status/:documentKey')
  async verificarStatusDocumento(@Param('documentKey') documentKey: string) {
    return this.clickSignService.verificarStatusDocumento(documentKey);
  }

  @Get('test-connection')
  async testarConexao() {
    const resultado = await this.clickSignService.testarConexaoApi();
    return {
      sucesso: resultado,
      mensagem: resultado
        ? 'Conexão com ClickSign bem-sucedida'
        : 'Falha na conexão com ClickSign',
    };
  }

  @Public()
  @Post('webhook/clicksign')
  async receberWebhookClickSign(@Body() payload: any) {
    this.logger.log('Webhook recebido da ClickSign:', payload);

    if (payload.event && payload.event.name === 'document.signed') {
      const documentKey = payload.document.key;
      await this.clickSignService.atualizarStatusDocumento(
        documentKey,
        'assinado',
      );

      // Podemos adicionar lógica adicional aqui, como notificar o usuário
    }

    return { success: true };
  }
}
