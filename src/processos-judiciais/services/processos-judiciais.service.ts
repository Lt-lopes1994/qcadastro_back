import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessoJudicial } from '../../user/entity/processo-judicial.entity';

@Injectable()
export class ProcessosJudiciaisService {
  constructor(
    @InjectRepository(ProcessoJudicial)
    private processoJudicialRepository: Repository<ProcessoJudicial>,
  ) {}

  async findByUser(userId: number): Promise<ProcessoJudicial[]> {
    return this.processoJudicialRepository.find({
      where: { userId },
      order: { dataNotificacao: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ProcessoJudicial> {
    const processo = await this.processoJudicialRepository.findOne({
      where: { id },
    });

    if (!processo) {
      throw new NotFoundException(`Processo judicial #${id} não encontrado`);
    }

    return processo;
  }
}
