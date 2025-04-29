import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { Veiculo } from './entities/veiculo.entity';
import { Portador } from '../portador/entities/portador.entity';
import { Tutor } from '../tutor/entities/tutor.entity';
import { Tutelado } from '../tutor/entities/tutelado.entity';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname } from 'path';

@Injectable()
export class VeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private veiculoRepository: Repository<Veiculo>,
    @InjectRepository(Portador)
    private portadorRepository: Repository<Portador>,
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    @InjectRepository(Tutelado)
    private tuteladoRepository: Repository<Tutelado>,
  ) {}

  async create(
    createVeiculoDto: CreateVeiculoDto,
    userId: number,
    images?: {
      crlvImagem?: Express.Multer.File;
      anttImagem?: Express.Multer.File;
      fotoFrente?: Express.Multer.File;
      fotoTras?: Express.Multer.File;
      fotoLateralEsquerda?: Express.Multer.File;
      fotoLateralDireita?: Express.Multer.File;
      fotoTrasAberto?: Express.Multer.File;
      fotoBauFechado?: Express.Multer.File;
      fotoBauAberto?: Express.Multer.File;
    },
  ): Promise<Veiculo> {
    // Verificar se o usuário é um tutor
    const tutor = await this.tutorRepository.findOne({
      where: { userId },
    });

    if (!tutor) {
      throw new ForbiddenException('Apenas tutores podem cadastrar veículos');
    }

    // Verificar se o veículo já está cadastrado
    const veiculoExistente = await this.veiculoRepository.findOne({
      where: { placa: createVeiculoDto.placa },
    });

    if (veiculoExistente) {
      throw new BadRequestException(
        'Veículo com esta placa já está cadastrado',
      );
    }

    // Verificar se o tutelado designado existe e está vinculado ao tutor
    let tuteladoDesignado: Tutelado | null = null;
    if (createVeiculoDto.tuteladoDesignadoId) {
      tuteladoDesignado = await this.tuteladoRepository.findOne({
        where: {
          id: createVeiculoDto.tuteladoDesignadoId,
          tutorId: tutor.id,
        },
      });

      if (!tuteladoDesignado) {
        throw new BadRequestException(
          'O tutelado informado não existe ou não está vinculado a você',
        );
      }
    }

    // Extrair dados do veículo do DTO
    const { placa, veiculoPlaca } = createVeiculoDto;

    // Criar um novo veículo
    const veiculo = new Veiculo();
    veiculo.placa = placa;
    veiculo.marca = veiculoPlaca.marca;
    veiculo.modelo = veiculoPlaca.modelo;
    veiculo.marcaModelo = veiculoPlaca.marcaModelo;
    veiculo.submodelo = veiculoPlaca.submodelo || '';
    veiculo.versao = veiculoPlaca.versao || '';
    veiculo.ano = veiculoPlaca.ano;
    veiculo.anoModelo = veiculoPlaca.anoModelo;
    veiculo.chassi = veiculoPlaca.chassi || '';
    veiculo.cor = veiculoPlaca.cor || '';
    veiculo.municipio = veiculoPlaca.municipio || '';
    veiculo.uf = veiculoPlaca.uf || '';
    veiculo.origem = veiculoPlaca.origem || '';
    veiculo.situacao = veiculoPlaca.situacao || '';
    veiculo.segmento = veiculoPlaca.segmento || '';
    veiculo.subSegmento = veiculoPlaca.subSegmento || '';
    veiculo.fipe = veiculoPlaca.fipe;
    veiculo.extra = veiculoPlaca.extra;
    veiculo.tutorId = tutor.id;
    veiculo.userId = userId;

    // Se houver tutelado designado
    if (tuteladoDesignado) {
      veiculo.tuteladoDesignadoId = tuteladoDesignado.id;
    }

    // Processar imagens se fornecidas
    if (images) {
      console.log('Processando imagens para veículo placa:', placa);

      // Criar diretório se não existir
      const dir = `./uploads/veiculos/${placa}`;
      if (!existsSync(dir)) {
        console.log('Criando diretório:', dir);
        mkdirSync(dir, { recursive: true });
      }

      // Salvar CRLV
      if (images.crlvImagem) {
        console.log('Salvando CRLV:', images.crlvImagem.originalname);
        const filename = `crlv_${Date.now()}${extname(images.crlvImagem.originalname)}`;
        const filepath = `${dir}/${filename}`;

        try {
          writeFileSync(filepath, images.crlvImagem.buffer);
          veiculo.crlvImagePath = `uploads/veiculos/${placa}/${filename}`;
          console.log('CRLV salvo com sucesso em:', filepath);
        } catch (error) {
          console.error('Erro ao salvar CRLV:', error);
        }
      }

      // Salvar ANTT
      if (images.anttImagem && images.anttImagem.buffer) {
        const filename = `antt_${Date.now()}.${extname(images.anttImagem.originalname)}`;
        const filepath = `${dir}/${filename}`;
        writeFileSync(filepath, images.anttImagem.buffer);
        veiculo.anttImagePath = `uploads/veiculos/${placa}/${filename}`;
      }

      // Salvar foto da frente
      if (images.fotoFrente && images.fotoFrente.buffer) {
        const filename = `frente_${Date.now()}.${extname(images.fotoFrente.originalname)}`;
        const filepath = `${dir}/${filename}`;
        writeFileSync(filepath, images.fotoFrente.buffer);
        veiculo.fotoFrentePath = `uploads/veiculos/${placa}/${filename}`;
      }

      // Salvar foto traseira
      if (images.fotoTras && images.fotoTras.buffer) {
        const filename = `tras_${Date.now()}.${extname(images.fotoTras.originalname)}`;
        const filepath = `${dir}/${filename}`;
        writeFileSync(filepath, images.fotoTras.buffer);
        veiculo.fotoTrasPath = `uploads/veiculos/${placa}/${filename}`;
      }

      // Adicione as demais imagens com o mesmo padrão
      if (images.fotoLateralEsquerda && images.fotoLateralEsquerda.buffer) {
        const filename = `lateral_esq_${Date.now()}.${extname(images.fotoLateralEsquerda.originalname)}`;
        const filepath = `${dir}/${filename}`;
        writeFileSync(filepath, images.fotoLateralEsquerda.buffer);
        veiculo.fotoLateralEsquerdaPath = `uploads/veiculos/${placa}/${filename}`;
      }

      if (images.fotoLateralDireita && images.fotoLateralDireita.buffer) {
        const filename = `lateral_dir_${Date.now()}.${extname(images.fotoLateralDireita.originalname)}`;
        const filepath = `${dir}/${filename}`;
        writeFileSync(filepath, images.fotoLateralDireita.buffer);
        veiculo.fotoLateralDireitaPath = `uploads/veiculos/${placa}/${filename}`;
      }

      // ... continuar para as outras imagens
    }

    return this.veiculoRepository.save(veiculo);
  }

  async findAll(): Promise<Veiculo[]> {
    return this.veiculoRepository.find({
      relations: ['tutor', 'tuteladoDesignado'],
    });
  }

  async findByUser(userId: number): Promise<Veiculo[]> {
    return this.veiculoRepository.find({
      where: { userId },
      relations: ['tutor', 'tuteladoDesignado'],
    });
  }

  async findByTutor(tutorId: number): Promise<Veiculo[]> {
    return this.veiculoRepository.find({
      where: { tutorId },
      relations: ['tuteladoDesignado'],
    });
  }

  async findByTutelado(tuteladoId: number): Promise<Veiculo[]> {
    return this.veiculoRepository.find({
      where: { tuteladoDesignadoId: tuteladoId },
      relations: ['tutor'],
    });
  }

  async findOne(id: number): Promise<Veiculo> {
    const veiculo = await this.veiculoRepository.findOne({
      where: { id },
      relations: ['tutor', 'tuteladoDesignado'],
    });

    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }

    return veiculo;
  }

  async designarTutelado(
    veiculoId: number,
    tuteladoId: number,
    tutorId: number,
  ): Promise<Veiculo> {
    // Verificar se o veículo existe e pertence ao tutor
    const veiculo = await this.veiculoRepository.findOne({
      where: { id: veiculoId, tutorId },
    });

    if (!veiculo) {
      throw new NotFoundException(
        `Veículo com ID ${veiculoId} não encontrado ou não pertence a este tutor`,
      );
    }

    // Verificar se o tutelado existe e está vinculado ao tutor
    const tutelado = await this.tuteladoRepository.findOne({
      where: { id: tuteladoId, tutorId },
    });

    if (!tutelado) {
      throw new NotFoundException(
        `Tutelado com ID ${tuteladoId} não encontrado ou não está vinculado a este tutor`,
      );
    }

    // Designar o tutelado
    veiculo.tuteladoDesignadoId = tuteladoId;

    return this.veiculoRepository.save(veiculo);
  }

  async remove(id: number, tutorId: number): Promise<void> {
    const veiculo = await this.veiculoRepository.findOne({
      where: { id, tutorId },
    });

    if (!veiculo) {
      throw new NotFoundException(
        `Veículo com ID ${id} não encontrado ou não pertence a este tutor`,
      );
    }

    await this.veiculoRepository.remove(veiculo);
  }

  async ativarVeiculo(id: number): Promise<Veiculo> {
    const veiculo = await this.findOne(id);

    veiculo.ativo = true;
    veiculo.motivoDesativacao = '';

    return this.veiculoRepository.save(veiculo);
  }

  async desativarVeiculo(id: number, motivo: string): Promise<Veiculo> {
    const veiculo = await this.findOne(id);

    veiculo.ativo = false;
    veiculo.motivoDesativacao = motivo;

    return this.veiculoRepository.save(veiculo);
  }
}
