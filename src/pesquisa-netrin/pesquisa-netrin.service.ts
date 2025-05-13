/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
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

  constructor(private configService: ConfigService) {
    this.netrinToken = this.configService.get<string>('NETRIN_TOKEN') || '';
  }

  async consultarCPF(cpf: string): Promise<ReceitaFederalResponse> {
    console.log(cpf, 'cpf');

    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.baseUrl}/?token=${this.netrinToken}&${cpf}`;

      // Fazer a requisição
      const response = await axios.get<ReceitaFederalResponse>(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar CPF');
    }
  }

  async consultarProcessos(cpf: string): Promise<ProcessoJudicialResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.processosUrl}?token=${this.netrinToken}&s=processos-full&cpf=${cpf}`;

      // Fazer a requisição
      const response = await axios.get<ProcessoJudicialResponse>(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar processos judiciais');
    }
  }

  async consultarVeiculo(placa: string): Promise<VeiculoPlacaResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.processosUrl}?token=${this.netrinToken}&s=veiculos-placas&placa=${placa}`;

      // Fazer a requisição
      const response = await axios.get<VeiculoPlacaResponse>(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar informações do veículo');
    }
  }

  async consultarScoreCredito(cpf: string): Promise<ScoreCreditoResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.processosUrl}?token=${this.netrinToken}&s=score-credito-renda-presumida-pf-simplificado&cpf=${cpf}`;

      // Fazer a requisição
      const response = await axios.get<ScoreCreditoResponse>(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar score de crédito');
    }
  }

  async consultarCNPJ(cnpj: string): Promise<ReceitaFederalCNPJResponse> {
    try {
      // Validar se o token existe
      if (!this.netrinToken) {
        throw new BadRequestException('Token da API Netrin não configurado');
      }

      // Montar a URL da consulta
      const url = `${this.processosUrl}?token=${this.netrinToken}&s=receita-federal-cnpj&cnpj=${cnpj}`;

      // Fazer a requisição
      const response = await axios.get<ReceitaFederalCNPJResponse>(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Erro na consulta à API Netrin: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new BadRequestException('Erro ao consultar CNPJ');
    }
  }
}
