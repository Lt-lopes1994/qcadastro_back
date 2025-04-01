// src/empresa/services/empresa.service.ts
import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../entities/empresa.entity';
import { DadosBancarios } from '../entities/dados-bancarios.entity';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { CreateDadosBancariosDto } from '../dto/create-dados-bancarios.dto';
import { FileStorageService } from '../../portador/services/file-storage.service';
import { SecurityService } from '../../security/security.service';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(DadosBancarios)
    private dadosBancariosRepository: Repository<DadosBancarios>,
    private fileStorageService: FileStorageService,
    private securityService: SecurityService,
  ) {}

  async create(
    createEmpresaDto: CreateEmpresaDto,
    createDadosBancariosDto: CreateDadosBancariosDto,
    logo?: Express.Multer.File,
  ): Promise<Empresa> {
    // Verificar se o CNPJ já existe
    const empresaExistente = await this.empresaRepository.findOne({
      where: { cnpj: createEmpresaDto.cnpj },
    });

    if (empresaExistente) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    // Sanitizar dados
    const empresaSanitizada = this.sanitizarDados(createEmpresaDto);
    const dadosBancariosSanitizados = this.sanitizarDados(
      createDadosBancariosDto,
    );

    // Salvar logo se fornecida
    let logoPath: string | null = null;
    if (logo) {
      this.validarLogo(logo);
      logoPath = await this.fileStorageService.saveFile(logo, 'empresa-logos');
    }

    // Criar empresa
    const empresa = this.empresaRepository.create({
      ...empresaSanitizada,
      logoPath,
    });

    // Criar dados bancários
    const dadosBancarios = this.dadosBancariosRepository.create(
      dadosBancariosSanitizados,
    );

    // Associar dados bancários à empresa
    empresa.dadosBancarios = dadosBancarios;

    // Salvar tudo
    const savedEmpresa = (await this.empresaRepository.save([empresa]))[0];
    return savedEmpresa;
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
