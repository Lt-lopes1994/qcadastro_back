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

export interface VeiculoPlacaResponse {
  placa: string;
  veiculoPlaca: {
    marca: string;
    modelo: string;
    marcaModelo: string;
    submodelo?: string;
    versao?: string;
    ano: string;
    anoModelo: string;
    chassi?: string;
    codigoSituacao?: string;
    cor?: string;
    municipio?: string;
    uf?: string;
    origem?: string;
    situacao?: string;
    segmento?: string;
    subSegmento?: string;
    fipe?: {
      dados?: Array<{
        ano_modelo?: string;
        codigo_fipe?: string;
        codigo_marca?: number;
        codigo_modelo?: string;
        combustivel?: string;
        id_valor?: number;
        mes_referencia?: string;
        referencia_fipe?: number;
        score?: number;
        sigla_combustivel?: string;
        texto_marca?: string;
        texto_modelo?: string;
        texto_valor?: string;
        tipo_modelo?: number;
      }>;
    };
    extra?: any;
  };
}

export interface ScoreCreditoResponse {
  cpf: string;
  scoreCreditoRendaPresumidaPFSimplificado: {
    name: string;
    cpf: number;
    scoreCredito: {
      D00: number;
      D30: number;
      D60: number;
    };
    renda: {
      individual: number;
      empresarial: string;
      familiar: number;
      presumido: number;
      classeSocialPessoal: number;
      classeSocialFamiliar: number;
      aponsentadoria: string;
    };
  };
}

export interface ReceitaFederalCNPJResponse {
  cnpj: string;
  receitaFederalCnpj: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    naturezaJuridica: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    cep: string;
    uf: string;
    telefone: string;
    situacaoCadastral: string;
    dataInicioAtividade: string;
    atividadeEconomica: string;
    porte: string;
    capitalSocial: string;
    urlComprovante?: string;
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
