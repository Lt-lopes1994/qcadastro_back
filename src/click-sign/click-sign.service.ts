/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from './entities/document.entity';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class ClickSignService {
  private readonly logger = new Logger(ClickSignService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly tempDir: string;

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {
    this.apiKey = process.env.CLICKSIGN_API_KEY || 'seu_api_key_aqui';

    // Alterando para URL do ambiente sandbox
    this.apiUrl =
      process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1';

    this.logger.log(`API URL configurada: ${this.apiUrl}`);

    this.tempDir = path.join(process.cwd(), 'temp');

    // Garantir que o diretório temp exista
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Gera um documento PDF para o portador assinar
   */
  async gerarDocumentoPortador(portador: any, user: any): Promise<string> {
    try {
      // Criar um novo documento PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Adicionar título
      page.drawText('TERMO DE ACORDO E RESPONSABILIDADE', {
        x: 50,
        y: height - 50,
        size: 16,
        font,
        color: rgb(0, 0, 0),
      });

      // Dados do portador
      page.drawText(`Nome: ${user.firstName} ${user.lastName}`, {
        x: 50,
        y: height - 100,
        size: 12,
        font,
      });

      page.drawText(`CPF: ${user.cpf}`, {
        x: 50,
        y: height - 120,
        size: 12,
        font,
      });

      page.drawText(`Número CNH: ${portador.cnhNumero}`, {
        x: 50,
        y: height - 140,
        size: 12,
        font,
      });

      page.drawText(`Categoria CNH: ${portador.cnhCategoria}`, {
        x: 50,
        y: height - 160,
        size: 12,
        font,
      });

      page.drawText(
        `Validade CNH: ${new Date(portador.cnhValidade).toLocaleDateString('pt-BR')}`,
        {
          x: 50,
          y: height - 180,
          size: 12,
          font,
        },
      );

      // Texto do acordo
      page.drawText(
        'Declaro que as informações acima são verdadeiras e estou ciente',
        {
          x: 50,
          y: height - 240,
          size: 10,
          font,
        },
      );

      page.drawText(
        'das minhas responsabilidades como portador cadastrado no sistema.',
        {
          x: 50,
          y: height - 260,
          size: 10,
          font,
        },
      );

      // Local para assinatura
      page.drawText('Local e data:', {
        x: 50,
        y: height - 320,
        size: 10,
        font,
      });

      page.drawText('Assinatura digital:', {
        x: 50,
        y: height - 380,
        size: 10,
        font,
      });

      // Salvar o PDF
      const pdfBytes = await pdfDoc.save();
      const fileName = `portador_${user.id}_${Date.now()}.pdf`;
      const filePath = path.join(this.tempDir, fileName);

      fs.writeFileSync(filePath, pdfBytes);
      return filePath;
    } catch (error) {
      this.logger.error(`Erro ao gerar documento PDF: ${error.message}`);
      throw new Error('Falha ao gerar documento PDF');
    }
  }

  /**
   * Envia o documento para a ClickSign e cria um signatário
   */
  async enviarParaClickSign(
    filePath: string,
    portador: any,
    user: any,
  ): Promise<any> {
    try {
      // Testar conexão com a API antes de prosseguir
      const conexaoOk = await this.testarConexaoApi();
      if (!conexaoOk) {
        throw new Error(
          'Falha na conexão com a API ClickSign. Verifique sua API key e URL.',
        );
      }

      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      // Ler o arquivo como buffer
      const fileContent = fs.readFileSync(filePath);

      // Verificar tamanho
      if (fileContent.length === 0) {
        throw new Error('O arquivo PDF está vazio');
      }

      const base64File = fileContent.toString('base64');

      // Log para depuração
      this.logger.log(
        `Arquivo lido com sucesso. Tamanho: ${fileContent.length} bytes`,
      );

      // Data de expiração (15 dias a partir de hoje)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 15);

      // Criar o documento - Formato CORRETO conforme documentação
      this.logger.log(
        `Criando documento para o usuário: ${user.firstName} ${user.lastName}`,
      );

      // Adicionar o prefixo MIME ao content_base64
      const docResponse = await axios.post(
        `${this.apiUrl}/documents`,
        {
          document: {
            path: `/Termo_Portador_${user.firstName}_${user.lastName}.pdf`,
            content_base64: `data:application/pdf;base64,${base64File}`, // Com o prefixo MIME que estava faltando
            deadline_at: expiresAt.toISOString(),
            auto_close: true,
            locale: 'pt-BR',
          },
        },
        {
          params: { access_token: this.apiKey },
        },
      );

      const documentKey = docResponse.data.document.key;
      this.logger.log(`Documento criado com sucesso. Key: ${documentKey}`);

      // Formatação do CPF (remover pontos e traços)
      const cpf = user.cpf.replace(/[.-]/g, '');

      // Formatação do número de telefone para o formato internacional
      let phoneNumber = user.phoneNumber;
      // Remover qualquer formatação existente
      phoneNumber = phoneNumber.replace(/\D/g, '');
      // Se começar com 0, remover
      if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
      }
      // Garantir que tenha o prefixo internacional
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+55${phoneNumber}`;
      }
      // Se ainda não tiver o +, adicionar
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+${phoneNumber}`;
      }

      this.logger.log(`Telefone formatado: ${phoneNumber}`);

      // Após criar o documento e antes de gerar as URLs de assinatura

      // Array para armazenar as chaves de todos os signatários
      const signers: Array<{
        key: any;
        email: string;
        nome: string;
        tipo: string;
      }> = [];

      // 1. Criar o signatário principal (portador)
      const portadorSignerResponse = await axios.post(
        `${this.apiUrl}/signers`,
        {
          signer: {
            email: user.email,
            phone_number: phoneNumber,
            auths: ['email'],
            name: `${user.firstName} ${user.lastName}`,
            documentation: cpf,
            has_documentation: true,
          },
        },
        {
          params: { access_token: this.apiKey },
        },
      );

      const portadorSignerKey = portadorSignerResponse.data.signer.key;
      this.logger.log(
        `Signatário (portador) criado com sucesso. Key: ${portadorSignerKey}`,
      );
      signers.push({
        key: portadorSignerKey,
        email: user.email,
        nome: `${user.firstName} ${user.lastName}`,
        tipo: 'portador',
      });

      // 2. Criar o signatário testemunha
      const testemunhaEmail = 'brunomantovanlopes@gmail.com';
      const testemunhaSignerResponse = await axios.post(
        `${this.apiUrl}/signers`,
        {
          signer: {
            email: testemunhaEmail,
            auths: ['email'],
            name: 'Bruno Mantovan Lopes (Testemunha)',
            has_documentation: false,
          },
        },
        {
          params: { access_token: this.apiKey },
        },
      );

      const testemunhaSignerKey = testemunhaSignerResponse.data.signer.key;
      this.logger.log(
        `Signatário (testemunha) criado com sucesso. Key: ${testemunhaSignerKey}`,
      );
      signers.push({
        key: testemunhaSignerKey,
        email: testemunhaEmail,
        nome: 'Bruno Mantovan Lopes (Testemunha)',
        tipo: 'testemunha',
      });

      // 3. Criar o signatário da gerência
      const gerenciaEmail = 'bruno.lopes@qualityentregas.com.br';
      const gerenciaSignerResponse = await axios.post(
        `${this.apiUrl}/signers`,
        {
          signer: {
            email: gerenciaEmail,
            auths: ['email'],
            name: 'Bruno Lopes (Gerência)',
            has_documentation: false,
          },
        },
        {
          params: { access_token: this.apiKey },
        },
      );

      const gerenciaSignerKey = gerenciaSignerResponse.data.signer.key;
      this.logger.log(
        `Signatário (gerência) criado com sucesso. Key: ${gerenciaSignerKey}`,
      );
      signers.push({
        key: gerenciaSignerKey,
        email: gerenciaEmail,
        nome: 'Bruno Lopes (Gerência)',
        tipo: 'gerencia',
      });

      // Vincular todos os signatários ao documento em ordem
      // Portador assina primeiro, depois testemunha, depois gerência

      // 1. Vincular o portador
      await axios.post(
        `${this.apiUrl}/lists`,
        {
          list: {
            document_key: documentKey,
            signer_key: portadorSignerKey,
            sign_as: 'sign',
            message:
              'Por favor, assine este documento para completar seu cadastro.',
            // Definir a sequência - portador é o primeiro
            sequence_enabled: true,
            sequence_number: 1,
          },
        },
        {
          params: { access_token: this.apiKey },
        },
      );
      this.logger.log(`Portador vinculado ao documento com sucesso.`);

      // 2. Vincular a testemunha
      await axios.post(
        `${this.apiUrl}/lists`,
        {
          list: {
            document_key: documentKey,
            signer_key: testemunhaSignerKey,
            sign_as: 'witness',
            message: 'Por favor, assine este documento como testemunha.',
            // Definir a sequência - testemunha é o segundo
            sequence_enabled: true,
            sequence_number: 2,
          },
        },
        {
          params: { access_token: this.apiKey },
        },
      );
      this.logger.log(`Testemunha vinculada ao documento com sucesso.`);

      // 3. Vincular a gerência
      await axios.post(
        `${this.apiUrl}/lists`,
        {
          list: {
            document_key: documentKey,
            signer_key: gerenciaSignerKey,
            sign_as: 'approve',
            message:
              'Por favor, aprove este documento como representante da gerência.',
            // Definir a sequência - gerência é o terceiro
            sequence_enabled: true,
            sequence_number: 3,
          },
        },
        {
          params: { access_token: this.apiKey },
        },
      );
      this.logger.log(`Gerência vinculada ao documento com sucesso.`);

      // Definir URL de callback para retorno após assinatura
      const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/assinatura/concluida/${documentKey}`;

      // Gerar URL de assinatura apenas para o portador (principal)
      const signUrlResponse = await axios.post(
        `${this.apiUrl}/sign_urls`,
        {
          request_signature_key: {
            document_key: documentKey,
            signer_key: portadorSignerKey,
            return_url: callbackUrl,
          },
        },
        {
          params: { access_token: this.apiKey },
        },
      );

      const signUrl = signUrlResponse.data.sign_url;
      this.logger.log(`URL de assinatura gerada com sucesso: ${signUrl}`);

      // Salvar no banco de dados com todos os signatários
      const documento = new DocumentEntity();
      documento.nome = `Termo_Portador_${user.firstName}_${user.lastName}`;
      documento.documentoKey = documentKey;
      documento.status = 'pendente';
      documento.userId = user.id;
      documento.portadorId = portador.id;
      documento.signUrl = signUrl;
      documento.signatarios = signers;
      documento.expiresAt = expiresAt;

      await this.documentRepository.save(documento);

      // Excluir o arquivo temporário
      fs.unlinkSync(filePath);

      return {
        documentKey,
        signUrl,
        expiresAt,
        id: documento.id,
      };
    } catch (error) {
      // Log detalhado do erro
      this.logger.error(`Erro ao enviar para ClickSign: ${error.message}`);

      if (error.response) {
        this.logger.error(
          `Detalhes do erro: ${JSON.stringify(error.response.data)}`,
        );
        this.logger.error(`Status do erro: ${error.response.status}`);
        this.logger.error(
          `Cabeçalhos: ${JSON.stringify(error.response.headers)}`,
        );
      }

      throw new Error('Falha ao criar documento de assinatura');
    }
  }

  /**
   * Verifica o status de um documento na ClickSign
   */
  async verificarStatusDocumento(documentKey: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/documents/${documentKey}`,
        {
          params: { access_token: this.apiKey },
        },
      );

      const document = response.data.document;

      // Atualizar o status no banco de dados
      const documentoEntity = await this.documentRepository.findOne({
        where: { documentoKey: documentKey },
      });

      if (documentoEntity) {
        documentoEntity.status = document.status;
        await this.documentRepository.save(documentoEntity);
      }

      return document;
    } catch (error) {
      this.logger.error(
        `Erro ao verificar status do documento: ${error.message}`,
      );
      throw new Error('Falha ao verificar status do documento');
    }
  }

  /**
   * Atualiza o status de um documento
   */
  async atualizarStatusDocumento(
    documentKey: string,
    status: string,
  ): Promise<void> {
    const documentoEntity = await this.documentRepository.findOne({
      where: { documentoKey: documentKey },
    });

    if (documentoEntity) {
      documentoEntity.status = status;
      await this.documentRepository.save(documentoEntity);
      this.logger.log(
        `Status do documento ${documentKey} atualizado para ${status}`,
      );
    }
  }

  /**
   * Testa a conexão com a API do ClickSign
   */
  async testarConexaoApi(): Promise<boolean> {
    try {
      // Testando com um endpoint simples e seguro
      const response = await axios.get(`${this.apiUrl}/documents`, {
        params: { access_token: this.apiKey },
      });

      this.logger.log('✅ Conexão com API ClickSign bem-sucedida');
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Erro na conexão com API ClickSign: ${error.message}`,
      );

      if (error.response) {
        this.logger.error(`Status do erro: ${error.response.status}`);
        this.logger.error(`Detalhes: ${JSON.stringify(error.response.data)}`);
      }

      return false;
    }
  }
}
