import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Portador } from 'src/portador/entities/portador.entity';
import { Repository } from 'typeorm';
import type { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { Veiculo } from './entities/veiculo.entity';

@Injectable()
export class VeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private veiculoRepository: Repository<Veiculo>,
    @InjectRepository(Portador)
    private portadorRepository: Repository<Portador>,
  ) {}

  // Modificar o método create para aceitar tutorId
  async create(
    createVeiculoDto: CreateVeiculoDto,
    userId: number,
    tutorId?: number,
  ): Promise<Veiculo> {
    // Verificar se o portador existe e pertence ao usuário
    const portadores = await this.portadorRepository.find({
      where: { userId },
    });

    if (portadores.length === 0) {
      throw new BadRequestException(
        'Você precisa ser um portador cadastrado para registrar veículos',
      );
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
    veiculo.portadorId = portadores[0].id;
    veiculo.userId = userId;

    // Se fornecido tutorId, adicionar ao veículo
    if (tutorId) {
      veiculo.tutorId = tutorId;
    }

    return this.veiculoRepository.save(veiculo);
  }

  async findAll(): Promise<Veiculo[]> {
    return this.veiculoRepository.find();
  }

  async findByUser(userId: number): Promise<Veiculo[]> {
    return this.veiculoRepository.find({ where: { userId } });
  }

  async findByPortador(portadorId: number): Promise<Veiculo[]> {
    return this.veiculoRepository.find({ where: { portadorId } });
  }

  // Adicionar método para buscar veículos por tutor
  async findByTutor(tutorId: number): Promise<Veiculo[]> {
    return this.veiculoRepository.find({ where: { tutorId } });
  }

  async findOne(id: number): Promise<Veiculo> {
    const veiculo = await this.veiculoRepository.findOne({ where: { id } });
    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }
    return veiculo;
  }

  async update(
    id: number,
    updateVeiculoDto: Partial<CreateVeiculoDto>,
  ): Promise<Veiculo> {
    const veiculo = await this.findOne(id);

    if (updateVeiculoDto.placa && updateVeiculoDto.placa !== veiculo.placa) {
      const veiculoExistente = await this.veiculoRepository.findOne({
        where: { placa: updateVeiculoDto.placa },
      });

      if (veiculoExistente && veiculoExistente.id !== id) {
        throw new BadRequestException(
          'Veículo com esta placa já está cadastrado',
        );
      }

      veiculo.placa = updateVeiculoDto.placa;
    }

    if (updateVeiculoDto.veiculoPlaca) {
      const { veiculoPlaca } = updateVeiculoDto;

      if (veiculoPlaca.marca) veiculo.marca = veiculoPlaca.marca;
      if (veiculoPlaca.modelo) veiculo.modelo = veiculoPlaca.modelo;
      if (veiculoPlaca.marcaModelo)
        veiculo.marcaModelo = veiculoPlaca.marcaModelo;
      if (veiculoPlaca.submodelo) veiculo.submodelo = veiculoPlaca.submodelo;
      if (veiculoPlaca.versao) veiculo.versao = veiculoPlaca.versao;
      if (veiculoPlaca.ano) veiculo.ano = veiculoPlaca.ano;
      if (veiculoPlaca.anoModelo) veiculo.anoModelo = veiculoPlaca.anoModelo;
      if (veiculoPlaca.chassi) veiculo.chassi = veiculoPlaca.chassi;
      if (veiculoPlaca.cor) veiculo.cor = veiculoPlaca.cor;
      if (veiculoPlaca.municipio) veiculo.municipio = veiculoPlaca.municipio;
      if (veiculoPlaca.uf) veiculo.uf = veiculoPlaca.uf;
      if (veiculoPlaca.origem) veiculo.origem = veiculoPlaca.origem;
      if (veiculoPlaca.situacao) veiculo.situacao = veiculoPlaca.situacao;
      if (veiculoPlaca.segmento) veiculo.segmento = veiculoPlaca.segmento;
      if (veiculoPlaca.subSegmento)
        veiculo.subSegmento = veiculoPlaca.subSegmento;
      if (veiculoPlaca.fipe) veiculo.fipe = veiculoPlaca.fipe;
      if (veiculoPlaca.extra) veiculo.extra = veiculoPlaca.extra;
    }

    return this.veiculoRepository.save(veiculo);
  }

  async remove(id: number): Promise<void> {
    const veiculo = await this.findOne(id);
    await this.veiculoRepository.remove(veiculo);
  }
}
