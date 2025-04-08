/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Portador } from '../entities/portador.entity';
import { CreatePortadorDto } from '../dto/create-portador.dto';
import { FileStorageService } from './file-storage.service';
import { RegisteredUser } from '../../user/entity/user.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class PortadorService {
  constructor(
    @InjectRepository(Portador)
    private portadorRepository: Repository<Portador>,
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
    private fileStorageService: FileStorageService,
    private readonly emailService: EmailService,
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
    return this.portadorRepository.find({ relations: ['user'] });
  }

  async findAllNewPortadores(
    startDate: Date,
    endDate: Date,
  ): Promise<Portador[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    end.setHours(23, 59, 59, 999); // Define o final do dia
    start.setHours(0, 0, 0, 0); // Define o início do dia

    console.log(
      'Datas filtradas:',
      start.toISOString(),
      end.toISOString(),
      startDate,
      endDate,
      start,
      end,
    );

    try {
      const allPortadores = await this.portadorRepository.find({
        relations: ['user'],
        where: {
          createdAt: Between(start, end),
        },
      });
      console.log('Portadores encontrados:', allPortadores);

      if (allPortadores.length === 0) {
        throw new NotFoundException(
          'Nenhum portador encontrado entre as datas fornecidas',
        );
      }
      return allPortadores;
    } catch (error) {
      console.error('Erro ao buscar portadores:', error);
      throw new BadRequestException(
        'Erro ao buscar portadores entre as datas fornecidas',
      );
    }
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

  /**
   * Aprova os documentos de um portador
   */
  async aprovarDocumentos(id: number): Promise<Portador> {
    const portador = await this.findOne(id);
    if (!portador) {
      throw new NotFoundException(`Portador com ID ${id} não encontrado`);
    }

    // Atualizar o status para aprovado
    portador.status = 'APROVADO';
    portador.updatedAt = new Date();
    portador.motivoRejeicao = '';

    const portadorAtualizado = await this.portadorRepository.save(portador);

    // Notificar o usuário sobre a aprovação
    try {
      const user = await this.userRepository.findOne({
        where: { id: portador.userId },
      });
      if (user && user.email) {
        await this.emailService.sendDocumentApprovedEmail(user.email, {
          nome: `${user.firstName} ${user.lastName}`,
          tipoDocumento: 'Documentos de motorista',
        });
      }
    } catch (error) {
      console.error('Erro ao enviar email de aprovação:', error);
    }

    return portadorAtualizado;
  }

  /**
   * Rejeita os documentos de um portador
   */
  async rejeitarDocumentos(id: number, motivo: string): Promise<Portador> {
    if (!motivo) {
      throw new BadRequestException(
        'É necessário informar o motivo da rejeição',
      );
    }

    const portador = await this.findOne(id);
    if (!portador) {
      throw new NotFoundException(`Portador com ID ${id} não encontrado`);
    }

    // Atualizar o status para rejeitado
    portador.status = 'REJEITADO';
    portador.updatedAt = new Date();
    portador.motivoRejeicao = motivo;

    const portadorAtualizado = await this.portadorRepository.save(portador);

    // Notificar o usuário sobre a rejeição
    try {
      const user = await this.userRepository.findOne({
        where: { id: portador.userId },
      });
      if (user && user.email) {
        await this.emailService.sendDocumentRejectedEmail(user.email, {
          nome: `${user.firstName} ${user.lastName}`,
          tipoDocumento: 'Documentos de motorista',
          motivo: motivo,
        });
      }
    } catch (error) {
      console.error('Erro ao enviar email de rejeição:', error);
    }

    return portadorAtualizado;
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
