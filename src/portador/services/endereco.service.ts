import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Endereco } from '../entities/endereco.entity';
import { CreateEnderecoDto } from '../dto/create-endereco.dto';
import { GeocodingService } from './geocoding.service';

@Injectable()
export class EnderecoService {
  constructor(
    @InjectRepository(Endereco)
    private enderecoRepository: Repository<Endereco>,
    private geocodingService: GeocodingService,
  ) {}

  async create(
    createEnderecoDto: CreateEnderecoDto,
    userId: number,
  ): Promise<Endereco> {
    // Montar o endereço completo
    const enderecoCompleto = `${createEnderecoDto.logradouro}, ${createEnderecoDto.numero}${
      createEnderecoDto.complemento ? ', ' + createEnderecoDto.complemento : ''
    }, ${createEnderecoDto.bairro}, ${createEnderecoDto.cidade}, ${
      createEnderecoDto.estado
    } - CEP ${createEnderecoDto.cep}`;

    // Buscar coordenadas
    const coordinates = await this.geocodingService.getCoordinatesFromCep(
      createEnderecoDto.cep,
    );

    // Criar o endereço usando o método create com um objeto de propriedades
    const endereco = new Endereco();
    endereco.cep = createEnderecoDto.cep;
    endereco.logradouro = createEnderecoDto.logradouro;
    endereco.numero = createEnderecoDto.numero;
    endereco.complemento = createEnderecoDto.complemento ?? '';
    endereco.bairro = createEnderecoDto.bairro;
    endereco.cidade = createEnderecoDto.cidade;
    endereco.estado = createEnderecoDto.estado;
    endereco.enderecoCompleto = enderecoCompleto;
    endereco.userId = userId;
    endereco.latitude = coordinates?.lat || 0;
    endereco.longitude = coordinates?.lng || 0;

    // Salvar no banco de dados
    return await this.enderecoRepository.save(endereco);
  }

  async findByUser(userId: number): Promise<Endereco[]> {
    return this.enderecoRepository.find({ where: { userId } });
  }

  async findOne(id: number): Promise<Endereco> {
    const endereco = await this.enderecoRepository.findOne({ where: { id } });
    if (!endereco) {
      throw new NotFoundException(`Endereço com ID ${id} não encontrado`);
    }
    return endereco;
  }

  async update(
    id: number,
    updateEnderecoDto: Partial<CreateEnderecoDto>,
  ): Promise<Endereco> {
    const endereco = await this.findOne(id);

    // Atualizar campos
    if (updateEnderecoDto.cep) endereco.cep = updateEnderecoDto.cep;
    if (updateEnderecoDto.logradouro)
      endereco.logradouro = updateEnderecoDto.logradouro;
    if (updateEnderecoDto.numero) endereco.numero = updateEnderecoDto.numero;
    if (updateEnderecoDto.complemento)
      endereco.complemento = updateEnderecoDto.complemento;
    if (updateEnderecoDto.bairro) endereco.bairro = updateEnderecoDto.bairro;
    if (updateEnderecoDto.cidade) endereco.cidade = updateEnderecoDto.cidade;
    if (updateEnderecoDto.estado) endereco.estado = updateEnderecoDto.estado;

    // Reconstruir endereço completo se necessário
    if (
      updateEnderecoDto.logradouro ||
      updateEnderecoDto.numero ||
      updateEnderecoDto.complemento ||
      updateEnderecoDto.bairro ||
      updateEnderecoDto.cidade ||
      updateEnderecoDto.estado ||
      updateEnderecoDto.cep
    ) {
      endereco.enderecoCompleto = `${endereco.logradouro}, ${endereco.numero}${
        endereco.complemento ? ', ' + endereco.complemento : ''
      }, ${endereco.bairro}, ${endereco.cidade}, ${endereco.estado} - CEP ${endereco.cep}`;

      // Atualizar coordenadas se o CEP foi alterado
      if (updateEnderecoDto.cep) {
        const coordinates = await this.geocodingService.getCoordinatesFromCep(
          endereco.cep,
        );
        if (coordinates) {
          endereco.latitude = coordinates.lat;
          endereco.longitude = coordinates.lng;
        }
      }
    }

    return await this.enderecoRepository.save(endereco);
  }

  async remove(id: number): Promise<void> {
    const endereco = await this.findOne(id);
    await this.enderecoRepository.remove(endereco);
  }
}
