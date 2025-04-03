/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { LogData } from '../interfaces/log.interfaces';
import { SystemLog } from '../entities/system-log.entity';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(SystemLog)
    private logRepository: Repository<SystemLog>,
  ) {}

  async log(data: LogData): Promise<void> {
    const log = this.logRepository.create({
      action: data.action,
      entity: data.entity,
      entityId: data.entityId?.toString(),
      userId: data.userId,
      details: data.details,
      status: data.status,
      errorMessage: data.errorMessage,
      createdAt: new Date(),
    });

    await this.logRepository.save(log);
  }

  async findLogs(filters: Partial<LogData> = {}, page = 1, limit = 10) {
    const query = this.logRepository.createQueryBuilder('log');

    if (filters.entity) {
      query.andWhere('log.entity = :entity', { entity: filters.entity });
    }

    if (filters.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      query.andWhere('log.status = :status', { status: filters.status });
    }

    return query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }
}
