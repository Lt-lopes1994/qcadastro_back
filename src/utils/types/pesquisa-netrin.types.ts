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
