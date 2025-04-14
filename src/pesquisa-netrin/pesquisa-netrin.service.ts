/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ReceitaFederalResponse {
  cpf: string;
  receitaFederal: {
    cpf: string;
    nome: string;
    nomeSocial: string;
    situacaoCadastral: string;
    digitoVerificador: string;
    comprovante: string;
    dataNascimento: string;
    dataInscricao: string;
    anoObito: string;
    urlComprovante: string;
  };
}

export interface ProcessoJudicialResponse {
  cpf: string;
  processosFull: {
    totalProcessos: number;
    totalProcessosAutor: number;
    totalProcessosReu: number;
    processosUltimos180dias: number;
    processos: {
      numero: string;
      numeroProcessoUnico: string;
      urlProcesso: string;
      grauProcesso: number;
      unidadeOrigem: string;
      assuntosCNJ: Array<{
        titulo: string;
        codigoCNJ: string;
        ePrincipal: boolean;
      }>;
      tribunal: string;
      uf: string;
      classeProcessual: {
        nome: string;
      };
      status: {
        statusProcesso: string;
      };
      partes: Array<{
        nome: string;
        cpf?: string;
        cnpj?: string;
        polo: string;
        tipo: string;
      }>;
    }[];
  };
}

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
}
