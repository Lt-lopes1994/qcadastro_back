import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CapacidadeCarga } from './entities/capacidade-carga.entity';
import { CreateCapacidadeCargaDto } from './dto/create-capacidade-carga.dto';
import { Veiculo } from '../cadastro-veiculo/entities/veiculo.entity';

@Injectable()
export class CapacidadeCargaService {
  constructor(
    @InjectRepository(CapacidadeCarga)
    private capacidadeCargaRepository: Repository<CapacidadeCarga>,
    @InjectRepository(Veiculo)
    private veiculoRepository: Repository<Veiculo>,
  ) {}

  async create(
    createCapacidadeCargaDto: CreateCapacidadeCargaDto,
  ): Promise<CapacidadeCarga> {
    // Verificar se o veículo existe
    const veiculo = await this.veiculoRepository.findOne({
      where: { id: createCapacidadeCargaDto.veiculoId },
    });

    if (!veiculo) {
      throw new NotFoundException(
        `Veículo com ID ${createCapacidadeCargaDto.veiculoId} não encontrado`,
      );
    }

    // Verificar se já existe uma capacidade de carga para este veículo
    const capacidadeExistente = await this.capacidadeCargaRepository.findOne({
      where: { veiculoId: createCapacidadeCargaDto.veiculoId },
    });

    if (capacidadeExistente) {
      // Se já existe, atualiza os dados
      Object.assign(capacidadeExistente, createCapacidadeCargaDto);
      return this.capacidadeCargaRepository.save(capacidadeExistente);
    }

    // Se não existe, cria um novo
    const capacidadeCarga = this.capacidadeCargaRepository.create(
      createCapacidadeCargaDto,
    );
    return this.capacidadeCargaRepository.save(capacidadeCarga);
  }

  async findAll(): Promise<CapacidadeCarga[]> {
    return this.capacidadeCargaRepository.find({
      relations: ['veiculo'],
    });
  }

  async findOne(id: number): Promise<CapacidadeCarga> {
    const capacidadeCarga = await this.capacidadeCargaRepository.findOne({
      where: { id },
      relations: ['veiculo'],
    });

    if (!capacidadeCarga) {
      throw new NotFoundException(
        `Capacidade de carga com ID ${id} não encontrada`,
      );
    }

    return capacidadeCarga;
  }

  async findByVeiculo(veiculoId: number): Promise<CapacidadeCarga> {
    const capacidadeCarga = await this.capacidadeCargaRepository.findOne({
      where: { veiculoId },
    });

    if (!capacidadeCarga) {
      throw new NotFoundException(
        `Capacidade de carga não encontrada para o veículo com ID ${veiculoId}`,
      );
    }

    return capacidadeCarga;
  }

  async update(
    id: number,
    updateCapacidadeCargaDto: Partial<CreateCapacidadeCargaDto>,
  ): Promise<CapacidadeCarga> {
    const capacidadeCarga = await this.findOne(id);
    Object.assign(capacidadeCarga, updateCapacidadeCargaDto);
    return this.capacidadeCargaRepository.save(capacidadeCarga);
  }

  async remove(id: number): Promise<void> {
    const result = await this.capacidadeCargaRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Capacidade de carga com ID ${id} não encontrada`,
      );
    }
  }
}
