/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface GeocodingResponse {
  lat: number;
  lng: number;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  async getCoordinatesFromCep(cep: string): Promise<GeocodingResponse | null> {
    try {
      // Usando o ViaCEP para obter o endereço
      const viaCepResponse = await axios.get(
        `https://viacep.com.br/ws/${cep}/json/`,
      );
      const addressData = viaCepResponse.data;

      if (addressData.erro) {
        this.logger.warn(`CEP não encontrado: ${cep}`);
        return null;
      }

      // Montando o endereço para geocodificação
      const address = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}, ${addressData.uf}, ${cep}, Brasil`;

      // Usando a API do OpenStreetMap (Nominatim) para geocodificação
      // Nota: Em ambiente de produção é recomendável usar uma API paga como Google Maps
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: address,
            format: 'json',
            limit: 1,
          },
          headers: {
            'User-Agent': 'QCadastro-App',
          },
        },
      );

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Erro ao obter coordenadas para o CEP ${cep}:`, error);
      return null;
    }
  }
}
