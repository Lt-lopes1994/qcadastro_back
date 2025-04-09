/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { ProcessoJudicial } from '../../user/entity/processo-judicial.entity';

// Manipulação segura de datas
function parseDate(dateString?: string): Date | null {
  if (!dateString) return null;

  // Tenta converter a data
  const parsedDate = new Date(dateString);

  // Verifica se é uma data válida
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

@Injectable()
export class PortadorService {
  constructor(
    @InjectRepository(Portador)
    private portadorRepository: Repository<Portador>,
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
    @InjectRepository(ProcessoJudicial)
    private processoRepository: Repository<ProcessoJudicial>,
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

    // Dados básicos
    Object.assign(portador, {
      cnhNumero: createPortadorDto.cnhNumero,
      cnhCategoria: createPortadorDto.cnhCategoria,
      cnhValidade: new Date(createPortadorDto.cnhValidade),
      anttValidade: createPortadorDto.anttValidade
        ? new Date(createPortadorDto.anttValidade)
        : null,
      anttNumero: createPortadorDto.anttNumero,
      cnhImagemPath,
      anttImagemPath,
      userId,
      status: 'PENDENTE',
    });

    // Dados completos da CNH e do cliente
    if (createPortadorDto.motoristasCNHcompleto) {
      const { cnh, cliente } = createPortadorDto.motoristasCNHcompleto;

      // Dados da CNH
      if (cnh) {
        portador.cnhRenach = cnh.renach ?? '';
        if (cnh.primeiraCnh) {
          const parsedDate = parseDate(cnh.primeiraCnh);
          if (parsedDate) {
            portador.cnhPrimeira = parsedDate;
          }
        }

        if (cnh.emissaoData) {
          const parsedDate = parseDate(cnh.emissaoData);
          if (parsedDate) {
            portador.cnhEmissao = parsedDate;
          }
        }
        portador.cnhNumeroRegistro = cnh.numeroRegistro ?? '';
        portador.cnhObservacao = cnh.observacao ?? '';
        portador.cnhToxicologico = cnh.toxicologico;
        portador.cnhTelefone = cnh.telefone ?? '';
        portador.cnhEndereco = cnh.endereco ?? '';
        portador.cnhEmail = cnh.email ?? '';
        if (cnh.dataNascimento) {
          portador.dataNascimento = new Date(cnh.dataNascimento);
        }
        portador.cnhBloqueios = cnh.bloqueios;
      }

      // Dados do cliente
      if (cliente) {
        portador.nomeCompleto = cliente.nome ?? '';
        portador.nomeMae = cliente.nomeMae ?? '';
        portador.nomePai = cliente.nomePai ?? '';
        portador.cpf = cliente.numeroDocumento ?? '';
        portador.numeroRG = cliente.numeroRG ?? '';
        portador.estadoRG = cliente.estadoRG ?? '';
        portador.expeditorRG = cliente.expeditorRG ?? '';
        if (cliente.dataNascimento) {
          portador.dataNascimento = new Date(cliente.dataNascimento);
        }
      }
    } else if (createPortadorDto.cpf) {
      // Se só tiver o CPF e não tiver dados completos
      portador.cpf = createPortadorDto.cpf;
    }

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
    try {
      // Converter as datas para o início e fim do dia em UTC
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Ajustar para o início do dia em UTC (00:00:00.000)
      start.setUTCHours(0, 0, 0, 0);

      // Ajustar para o fim do dia em UTC (23:59:59.999)
      end.setUTCHours(23, 59, 59, 999);

      console.log('Data início (UTC):', start.toISOString());
      console.log('Data fim (UTC):', end.toISOString());

      // Buscar portadores com relações
      const portadores = await this.portadorRepository.find({
        relations: ['user'],
        where: {
          createdAt: Between(start, end),
        },
      });

      // Buscar IDs de usuários únicos dos portadores
      const userIds = [...new Set(portadores.map((p) => p.userId))];

      // Buscar todos os processos judiciais desses usuários em uma única query
      const processos = await this.processoRepository
        .createQueryBuilder('processo')
        .where('processo.userId IN (:...userIds)', { userIds })
        .getMany();

      // Organizar processos por userId para acesso rápido
      const processosPorUsuario = processos.reduce((acc, processo) => {
        if (!acc[processo.userId]) {
          acc[processo.userId] = [];
        }
        acc[processo.userId].push(processo);
        return acc;
      }, {});

      // Remover dados sensíveis e adicionar processos
      for (const portador of portadores) {
        if (portador.user) {
          // Campos a manter do usuário
          const {
            id,
            firstName,
            lastName,
            cpf,
            email,
            phoneNumber,
            role,
            isActive,
            fotoPath,
            createdAt,
            updatedAt,
          } = portador.user;

          // Substituir objeto user com versão filtrada
          portador.user = {
            id,
            firstName,
            lastName,
            cpf,
            email,
            phoneNumber,
            role,
            isActive,
            fotoPath,
            createdAt,
            updatedAt,
            // Adicionar processos judiciais
            processos: processosPorUsuario[portador.userId] || [],
          } as unknown as RegisteredUser;
        }
      }

      console.log('Portadores encontrados pela query:', portadores.length);
      return portadores;
    } catch (error) {
      console.error('Erro ao buscar portadores:', error);
      throw new BadRequestException(
        'Erro ao buscar portadores: ' + error.message,
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
  async aprovarDocumentos(id: number, aprovadorId: number): Promise<Portador> {
    const portador = await this.findOne(id);
    if (!portador) {
      throw new NotFoundException(`Portador com ID ${id} não encontrado`);
    }

    // Atualizar o status para aprovado e incluir informações do aprovador
    portador.status = 'APROVADO';
    portador.updatedAt = new Date();
    portador.motivoRejeicao = '';
    portador.aprovadorId = aprovadorId;
    portador.dataAprovacao = new Date();

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
