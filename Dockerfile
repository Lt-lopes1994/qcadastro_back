FROM node:20-alpine

# Criar diretório da aplicação
WORKDIR /app

# Criar diretórios de upload
RUN mkdir -p uploads/cnh uploads/antt uploads/user-photos uploads/empresa-logos uploads/veiculos uploads/contratos uploads/documentos

# Configurar permissões (importante para contêineres)
RUN chmod -R 777 uploads

# Criar diretório para certificados com permissões adequadas
RUN mkdir -p /etc/qcadastro/certs && \
    chmod 700 /etc/qcadastro/certs && \
    chown node:node /etc/qcadastro/certs

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

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]