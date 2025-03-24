import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portador } from '../entities/portador.entity';
import { CreatePortadorDto } from '../dto/create-portador.dto';
import { FileStorageService } from './file-storage.service';
import { RegisteredUser } from '../../user/entity/user.entity';

@Injectable()
export class PortadorService {
  constructor(
    @InjectRepository(Portador)
    private portadorRepository: Repository<Portador>,
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
    private fileStorageService: FileStorageService,
  ) {}

  async create(
    createPortadorDto: CreatePortadorDto,
    userId: number,
    cnhFile: Express.Multer.File,
    anttFile?: Express.Multer.File,
  ): Promise<Portador> {
    // Salvar as imagens
    const cnhImagemPath = await this.fileStorageService.saveFile(
      cnhFile,
      'cnh',
    );
    let anttImagemPath: string | null = null;

    if (anttFile) {
      anttImagemPath = await this.fileStorageService.saveFile(anttFile, 'antt');
    }

    // Criar novo portador
    const portador = new Portador();
    Object.assign(portador, {
      ...createPortadorDto,
      cnhValidade: new Date(createPortadorDto.cnhValidade),
      anttValidade: createPortadorDto.anttValidade
        ? new Date(createPortadorDto.anttValidade)
        : null,
      cnhImagemPath,
      anttImagemPath,
      userId,
      status: 'PENDENTE',
    });

    // Salvar o portador
    const savedPortador = await this.portadorRepository.save(portador);

    // Atualizar o papel do usuário para "portador" (se já não for admin)
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      // Não alterar se o usuário for admin
      if (user.role !== 'admin') {
        user.role = 'portador';
        await this.userRepository.save(user);
      }
    }

    return savedPortador;
  }

  async findAll(): Promise<Portador[]> {
    return this.portadorRepository.find();
  }

  async findByUser(userId: number): Promise<Portador[]> {
    return this.portadorRepository.find({ where: { userId } });
  }

  async findOne(id: number): Promise<Portador> {
    const portador = await this.portadorRepository.findOne({ where: { id } });
    if (!portador) {
      throw new NotFoundException(`Portador com ID ${id} não encontrado`);
    }
    return portador;
  }

  async update(
    id: number,
    updatePortadorDto: Partial<CreatePortadorDto>,
    cnhFile?: Express.Multer.File,
    anttFile?: Express.Multer.File,
  ): Promise<Portador> {
    const portador = await this.findOne(id);

    // Atualizar as imagens se fornecidas
    if (cnhFile) {
      // Remover arquivo antigo
      await this.fileStorageService.deleteFile(portador.cnhImagemPath);

      // Salvar novo arquivo
      portador.cnhImagemPath = await this.fileStorageService.saveFile(
        cnhFile,
        'cnh',
      );
    }

    if (anttFile) {
      // Remover arquivo antigo se existir
      if (portador.anttImagemPath) {
        await this.fileStorageService.deleteFile(portador.anttImagemPath);
      }

      // Salvar novo arquivo
      portador.anttImagemPath = await this.fileStorageService.saveFile(
        anttFile,
        'antt',
      );
    }

    // Atualizar os dados
    if (updatePortadorDto.cnhNumero)
      portador.cnhNumero = updatePortadorDto.cnhNumero;
    if (updatePortadorDto.cnhCategoria)
      portador.cnhCategoria = updatePortadorDto.cnhCategoria;
    if (updatePortadorDto.cnhValidade)
      portador.cnhValidade = new Date(updatePortadorDto.cnhValidade);
    if (updatePortadorDto.anttNumero)
      portador.anttNumero = updatePortadorDto.anttNumero;
    if (updatePortadorDto.anttValidade)
      portador.anttValidade = new Date(updatePortadorDto.anttValidade);

    return this.portadorRepository.save(portador);
  }

  async remove(id: number): Promise<void> {
    const portador = await this.findOne(id);

    // Remover arquivos
    await this.fileStorageService.deleteFile(portador.cnhImagemPath);
    if (portador.anttImagemPath) {
      await this.fileStorageService.deleteFile(portador.anttImagemPath);
    }

    await this.portadorRepository.remove(portador);
  }

  async aprovarDocumentos(id: number): Promise<Portador> {
    const portador = await this.findOne(id);
    portador.status = 'APROVADO';
    portador.motivoRejeicao = '';
    return this.portadorRepository.save(portador);
  }

  async rejeitarDocumentos(id: number, motivo: string): Promise<Portador> {
    if (!motivo) {
      throw new BadRequestException(
        'É necessário fornecer um motivo para rejeição',
      );
    }

    const portador = await this.findOne(id);
    portador.status = 'REJEITADO';
    portador.motivoRejeicao = motivo;
    return this.portadorRepository.save(portador);
  }

  /**
   * Gera um documento de termo de responsabilidade para o portador assinar
   */
  async gerarTermoResponsabilidade(portadorId: number, userId: number) {
    // Verificar se o portador existe e pertence ao usuário
    const portador = await this.findOne(portadorId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const isAdmin = user && user.role === 'admin';

    if (portador.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Você não tem permissão para esta operação');
    }

    // Delegar para o serviço do ClickSign
    // Esta parte seria implementada quando tivermos o ClickSignService injetado
    return {
      message:
        'Use o endpoint /documentos/portador/:portadorId/assinar para gerar o termo de responsabilidade',
    };
  }
}
