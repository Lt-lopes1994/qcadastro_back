/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaAcao, TipoAcao } from './entities/auditoria-acao.entity';

interface RegistrarAuditoriaDto {
  tipoAcao: TipoAcao;
  entidadeOrigemTipo: string;
  entidadeOrigemId: number;
  entidadeDestinoTipo: string;
  entidadeDestinoId: number;
  usuarioId: number;
  dadosAnteriores?: any;
  dadosPosteriores?: any;
  observacao?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(AuditoriaAcao)
    private auditoriaRepository: Repository<AuditoriaAcao>,
  ) {}

  async registrarAcao(dados: RegistrarAuditoriaDto): Promise<AuditoriaAcao> {
    const auditoriaAcao = this.auditoriaRepository.create({
      tipoAcao: dados.tipoAcao,
      entidadeOrigemTipo: dados.entidadeOrigemTipo,
      entidadeOrigemId: dados.entidadeOrigemId,
      entidadeDestinoTipo: dados.entidadeDestinoTipo,
      entidadeDestinoId: dados.entidadeDestinoId,
      usuarioId: dados.usuarioId,
      dadosAnteriores: dados.dadosAnteriores,
      dadosPosteriores: dados.dadosPosteriores,
      observacao: dados.observacao,
    });

    return this.auditoriaRepository.save(auditoriaAcao);
  }

  async listarAcoesPorEntidade(
    tipo: string,
    id: number,
    limit: number = 100,
  ): Promise<AuditoriaAcao[]> {
    return this.auditoriaRepository.find({
      where: [
        { entidadeOrigemTipo: tipo, entidadeOrigemId: id },
        { entidadeDestinoTipo: tipo, entidadeDestinoId: id },
      ],
      order: { dataAcao: 'DESC' },
      take: limit,
    });
  }

  async listarAcoesPorUsuario(
    usuarioId: number,
    limit: number = 100,
  ): Promise<AuditoriaAcao[]> {
    return this.auditoriaRepository.find({
      where: { usuarioId },
      order: { dataAcao: 'DESC' },
      take: limit,
    });
  }

  async listarAcoesPorTipo(
    tipoAcao: TipoAcao,
    limit: number = 100,
  ): Promise<AuditoriaAcao[]> {
    return this.auditoriaRepository.find({
      where: { tipoAcao },
      order: { dataAcao: 'DESC' },
      take: limit,
    });
  }
}
