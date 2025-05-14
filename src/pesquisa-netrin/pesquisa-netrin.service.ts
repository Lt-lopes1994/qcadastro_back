/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetrinRequestLog } from './entities/netrin-request-log.entity';
import type {
  ProcessoJudicialResponse,
  ReceitaFederalCNPJResponse,
  ReceitaFederalResponse,
  ScoreCreditoResponse,
  VeiculoPlacaResponse,
} from 'src/utils/types/pesquisa-netrin.types';

@Injectable()
export class PesquisaNetrinService {
  private readonly netrinToken: string;
  private readonly baseUrl = 'https://regularidade-cpf.netrin.com.br/v1';
  private readonly processosUrl =
    'https://api.netrin.com.br/v1/consulta-composta';

  constructor(
    private configService: ConfigService,
    @InjectRepository(NetrinRequestLog)
    private netrinLogRepository: Repository<NetrinRequestLog>,
  ) {
    this.netrinToken = this.configService.get<string>('NETRIN_TOKEN') || '';
  }

  // Método privado para registrar requisições assincronamente
  private async logRequest(
    userId: number | null,
    endpointType: string,
    parameter: string,
    success: boolean = true,
  ): Promise<void> {
    try {
      const now = new Date();
      const log = new NetrinRequestLog();
      if (userId !== null) {
        log.userId = userId;
      }
      log.endpointType = endpointType;
      log.parameter = parameter;
      log.success = success;
      log.month = now.getMonth() + 1; // +1 pois getMonth retorna 0-11
      log.year = now.getFullYear();

      // Salva o log de forma assíncrona para não bloquear a operação principal
      await this.netrinLogRepository.save(log).catch((error) => {
        console.error('Erro ao salvar log de requisição Netrin:', error);
      });
    } catch (error) {
      // Apenas logar o erro, sem interromper o fluxo principal
      console.error('Erro ao registrar requisição Netrin:', error);
    }
  }

  // Método para obter estatísticas de requisições mensais
  async getMonthlyStats(month?: number, year?: number): Promise<any> {
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    try {
      const stats = await this.netrinLogRepository
        .createQueryBuilder('log')
        .select('log.endpointType', 'tipo')
        .addSelect('COUNT(*)', 'total')
        .where('log.month = :month', { month: currentMonth })
        .andWhere('log.year = :year', { year: currentYear })
        .groupBy('log.endpointType')
        .getRawMany();

      const userStats = await this.netrinLogRepository
        .createQueryBuilder('log')
        .select('log.userId', 'userId')
        .addSelect('COUNT(*)', 'total')
        .where('log.month = :month', { month: currentMonth })
        .andWhere('log.year = :year', { year: currentYear })
        .andWhere('log.userId IS NOT NULL')
        .groupBy('log.userId')
        .getRawMany();

      return {
        month: currentMonth,
        year: currentYear,
        totalRequests: stats.reduce<number>(
          (sum: number, item: { total: string }) =>
            sum + parseInt(item.total, 10),
          0,
        ),
        byEndpoint: stats,
        byUser: userStats,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new BadRequestException(
        'Erro ao obter estatísticas de requisições',
      );
    }
  }

  async consultarCPF(
    cpf: string,
    userId?: number,
  ): Promise<ReceitaFederalResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Remover formatações do CPF (apenas números)
      const cpfLimpo = cpf.replace(/\D/g, '');

      // Montar a URL da consulta (corrigida)
      const url = `${this.baseUrl}/?token=${this.netrinToken}&cpf=${cpfLimpo}`;

      console.log('URL de consulta: ', url); // Para debug

      // Fazer a requisição
      const response = await axios.get<ReceitaFederalResponse>(url);

      // Registrar requisição bem-sucedida assincronamente
      void this.logRequest(userId || null, 'cpf', cpfLimpo);

      return response.data;
    } catch (error) {
      // Registrar falha na requisição
      void this.logRequest(userId || null, 'cpf', cpf, false);

      if (axios.isAxiosError(error)) {
        console.error('Erro detalhado da API Netrin:', error.response?.data);
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar CPF');
    }
  }

  async consultarProcessos(
    cpf: string,
    userId?: number,
  ): Promise<ProcessoJudicialResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.processosUrl}?token=${this.netrinToken}&s=processos-full&cpf=${cpf}`;

      // Fazer a requisição
      const response = await axios.get<ProcessoJudicialResponse>(url);

      // Registrar requisição bem-sucedida assincronamente
      void this.logRequest(userId || null, 'processos', cpf);

      return response.data;
    } catch (error) {
      // Registrar falha na requisição
      void this.logRequest(userId || null, 'processos', cpf, false);

      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar processos judiciais');
    }
  }

  async consultarVeiculo(
    placa: string,
    userId?: number,
  ): Promise<VeiculoPlacaResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.processosUrl}?token=${this.netrinToken}&s=veiculos-placas&placa=${placa}`;

      // Fazer a requisição
      const response = await axios.get<VeiculoPlacaResponse>(url);

      // Registrar requisição bem-sucedida assincronamente
      void this.logRequest(userId || null, 'veiculo', placa);

      return response.data;
    } catch (error) {
      // Registrar falha na requisição
      void this.logRequest(userId || null, 'veiculo', placa, false);

      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar informações do veículo');
    }
  }

  async consultarScoreCredito(
    cpf: string,
    userId?: number,
  ): Promise<ScoreCreditoResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.processosUrl}?token=${this.netrinToken}&s=score-credito-renda-presumida-pf-simplificado&cpf=${cpf}`;

      // Fazer a requisição
      const response = await axios.get<ScoreCreditoResponse>(url);

      // Registrar requisição bem-sucedida assincronamente
      void this.logRequest(userId || null, 'scoreCredito', cpf);

      return response.data;
    } catch (error) {
      // Registrar falha na requisição
      void this.logRequest(userId || null, 'scoreCredito', cpf, false);

      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar score de crédito');
    }
  }

  async consultarCNPJ(
    cnpj: string,
    userId?: number,
  ): Promise<ReceitaFederalCNPJResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.processosUrl}?token=${this.netrinToken}&s=receita-federal-cnpj&cnpj=${cnpj}`;

      // Fazer a requisição
      const response = await axios.get<ReceitaFederalCNPJResponse>(url);

      // Registrar requisição bem-sucedida assincronamente
      void this.logRequest(userId || null, 'cnpj', cnpj);

      return response.data;
    } catch (error) {
      // Registrar falha na requisição
      void this.logRequest(userId || null, 'cnpj', cnpj, false);

      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar CNPJ');
    }
  }
}
