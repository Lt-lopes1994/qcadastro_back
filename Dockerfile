FROM node:20-alpine

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código-fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Expor porta
EXPOSE 8000

# Adicionar bash
RUN apk add --no-cache bash

# Copiar wait-for-it.sh
COPY wait-for-it.sh /wait-for-it.sh

# Dar permissão de execução para wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Comando para iniciar a aplicação
CMD ["/bin/bash", "-c", "/wait-for-it.sh db:3306 --timeout=60 -- npm run start:prod"]