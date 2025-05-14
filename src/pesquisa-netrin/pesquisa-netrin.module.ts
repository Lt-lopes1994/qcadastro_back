import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PesquisaNetrinController } from './pesquisa-netrin.controller';
import { PesquisaNetrinService } from './pesquisa-netrin.service';
import { NetrinRequestLog } from './entities/netrin-request-log.entity';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([NetrinRequestLog])],
  controllers: [PesquisaNetrinController],
  providers: [PesquisaNetrinService],
  exports: [PesquisaNetrinService],
})
export class PesquisaNetrinModule {}
