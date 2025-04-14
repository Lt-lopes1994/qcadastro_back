import { Module } from '@nestjs/common';
import { PesquisaNetrinService } from './pesquisa-netrin.service';
import { PesquisaNetrinController } from './pesquisa-netrin.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PesquisaNetrinController],
  providers: [PesquisaNetrinService],
  exports: [PesquisaNetrinService],
})
export class PesquisaNetrinModule {}
