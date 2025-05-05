/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/empresa/services/empresa.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../entities/empresa.entity';
import { DadosBancarios } from '../entities/dados-bancarios.entity';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { CreateDadosBancariosDto } from '../dto/create-dados-bancarios.dto';
import { FileStorageService } from '../../portador/services/file-storage.service';
import { SecurityService } from '../../security/security.service';
import { LoggerService } from 'src/logger/service/logger.service';
import { TutorService } from '../../tutor/tutor.service';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(DadosBancarios)
    private readonly dadosBancariosRepository: Repository<DadosBancarios>,
    private readonly fileStorageService: FileStorageService,
    private readonly securityService: SecurityService,
    private readonly loggerService: LoggerService,
    private readonly tutorService: TutorService, // Adicione o TutorService
  ) {}

  async createDadosEmpresa(
    createEmpresaDto: CreateEmpresaDto,
    userId: number,
  ): Promise<Empresa> {
    // Sanitizar dados de entrada
    const empresaSanitizada = this.sanitizarDados(createEmpresaDto);

    // Criar e salvar a empresa
    const empresa = this.empresaRepository.create({
      ...empresaSanitizada,
      userId,
    });

    const savedEmpresa = await this.empresaRepository.save(empresa);

    // Verificar se o usuário é um tutor e fazer o vínculo automático
    try {
      // Tente buscar o tutor pelo userId
      const tutor = await this.tutorService.findTutorByUserId(userId);

      if (tutor) {
        // Usuário é um tutor, faça a vinculação
        console.log(
          `Usuário ${userId} é um tutor, vinculando empresa ${savedEmpresa.id}`,
        );

        await this.tutorService.vincularEmpresa(
          userId,
          { empresaId: savedEmpresa.id },
          true, // Indica que estamos usando userId, não o ID do tutor
        );
      }
    } catch (error) {
      // Se ocorrer um erro (ex: usuário não é tutor), apenas ignore e prossiga
      if (!(error instanceof NotFoundException)) {
        console.error('Erro ao tentar vincular tutor à empresa:', error);
      }
    }

    return savedEmpresa;
  }

  async deleteDadosEmpresa(idEmpresa: number, userId: number) {
    const empresa = await this.empresaRepository.findOne({
      where: { id: idEmpresa, userId },
      relations: ['dadosBancarios'], // Inclui os dados bancários relacionados
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada ou sem permissão');
    }
    try {
      // Se existirem dados bancários, deleta-os
      if (empresa.dadosBancarios) {
        await this.dadosBancariosRepository.delete({
          id: empresa.dadosBancarios.id,
        });
      }

      // Verifica se a empresa possui logo e deleta
      if (empresa.logoPath) {
        await this.fileStorageService.deleteFile(empresa.logoPath);
      }
      // Deleta a empresa
      await this.loggerService.log({
        action: 'deleteDadosEmpresa',
        entity: 'Empresa',
        entityId: idEmpresa,
        userId,
        details: { attempted: empresa },
        status: 'success',
      });

      await this.empresaRepository.delete(idEmpresa);
    } catch (error) {
      await this.loggerService.log({
        action: 'deleteDadosEmpresa',
        entity: 'Empresa',
        entityId: idEmpresa,
        userId,
        details: { attempted: empresa },
        status: 'error',
        errorMessage: error.message,
      });
    }
  }

  async createDadosBancarios(
    createDadosBancariosDto: CreateDadosBancariosDto,
    userId: number,
  ): Promise<DadosBancarios> {
    // Verificar se a empresa existe e pertence ao usuário
    const empresa = await this.empresaRepository.findOne({
      where: {
        id: createDadosBancariosDto.empresaId,
        userId: userId,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada ou sem permissão');
    }

    const dadosBancariosSanitizados = this.sanitizarDados(
      createDadosBancariosDto,
    );

    const dadosBancarios = this.dadosBancariosRepository.create({
      ...dadosBancariosSanitizados,
      userId,
      empresa,
    });

    return await this.dadosBancariosRepository.save(dadosBancarios);
  }

  async saveLogo(
    empresaId: number,
    logo: Express.Multer.File,
    userId: number,
  ): Promise<string> {
    // Verificar se a empresa existe e pertence ao usuário
    const empresa = await this.empresaRepository.findOne({
      where: {
        id: empresaId,
        userId: userId,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada ou sem permissão');
    }

    this.validarLogo(logo);
    const logoPath = await this.fileStorageService.saveFile(
      logo,
      'empresa-logos',
    );

    // Deletar logo antigo se existir
    if (empresa.logoPath) {
      await this.fileStorageService.deleteFile(empresa.logoPath);
    }

    // Atualizar a empresa com o novo caminho do logo
    empresa.logoPath = logoPath;
    await this.empresaRepository.save(empresa);

    return logoPath;
  }

  async findByUser(userId: number): Promise<Empresa[]> {
    return this.empresaRepository.find({
      where: { userId },
      relations: ['dadosBancarios'], // Inclui os dados bancários e de empresas relacionados
      order: {
        createdAt: 'DESC', // Ordena do mais recente para o mais antigo
      },
    });
  }

  private sanitizarDados<T extends Record<string, any>>(dados: T): T {
    const dadosSanitizados = { ...dados };
    for (const [key, value] of Object.entries(dadosSanitizados)) {
      if (typeof value === 'string') {
        (dadosSanitizados as Record<string, any>)[key] =
          this.securityService.sanitizeInput(value);
      }
    }
    return dadosSanitizados;
  }

  private validarLogo(file: Express.Multer.File) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (file.size > maxSize) {
      throw new BadRequestException(
        'Arquivo muito grande. Tamanho máximo: 5MB',
      );
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de arquivo inválido. Permitidos: JPEG, PNG',
      );
    }
  }
}
