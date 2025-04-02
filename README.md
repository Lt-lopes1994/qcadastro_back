# QCadastro Backend
### Descrição
Sistema de cadastro e gerenciamento desenvolvido em NestJS para controle de portadores, veículos e processos judiciais.

## Tecnologias Principais
NestJS
TypeORM
MySQL
Docker
JWT para autenticação
Twilio para SMS
IagenteSMTP para emails
## Estrutura do Projeto
Módulos Principais
1. Auth
Autenticação JWT
Proteção de rotas
Controle de acesso baseado em roles (admin, portador, user)
2. Usuário
Cadastro e gerenciamento de usuários
Verificação por email e SMS
Integração com API Netrin para busca de processos judiciais
3. Portador
Gestão de portadores de veículos
Upload e validação de documentos (CNH e ANTT)
Gerenciamento de endereços com geocodificação
4. Veículos
Cadastro de veículos
Validação de placas
Integração com tabela FIPE
Segurança
Rate limiting via ThrottlerModule
Proteção contra DDoS
Sanitização de inputs
CORS configurável
Helmet para headers HTTP seguros
Configuração do Ambiente
Requisitos
Node.js
MySQL
Docker e Docker Compose
## Variáveis de Ambiente

```plaintext 
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=senha
DB_NAME=qeCadastro
JWT_SECRET=seu_jwt_secret
TWILIO_ACCOUNT_SID=seu_sid
TWILIO_AUTH_TOKEN=seu_token
TWILIO_PHONE_NUMBER=seu_numero
```

## Instalação 
```bash
# Instalar dependências
npm install

# Construir o projeto
npm run build

# Rodar migrações
npm run typeorm migration:run
```
## Rodando o Projeto 
```bash 
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod
```

## SCRIPTS UTILITÁRIOS

### RESET DATABASE 
```bash
npm run script:reset-database
```
### CRIAR ADMIN 
```bash 
npm run script:create-admin
```

### BACKUP  DATABASE 
```bash
npm run script:create-dump
```

## EndPoints Principais 
### Auth
 - POST /api/v1/auth/login
 - POST /api/v1/auth/refresh-token
### Usuários
 - POST /api/v1/users
 - GET /api/v1/users/verify-email
 - GET /api/v1/users/verify-phone
### Portadores
 - POST /api/v1/portadores
 - GET /api/v1/portadores
 - PUT /api/v1/portadores/:id
 - DELETE /api/v1/portadores/:id
 - POST /api/v1/portadores/:id/aprovar
 - POST /api/v1/portadores/:id/rejeitar
### Veículos
 - POST /api/v1/veiculos
 - GET /api/v1/veiculos
 - GET /api/v1/veiculos/:placa

## DEPLOY 
O projeto está configurado para deploy usando Docker Compose, com:
 - Nginx como proxy reverso
 - MySQL como banco de dados
 - Volumes para persistência
 - Healthchecks configurados

para fazer deploy: 
```bash 
docker-compose up -d
```

## Manutenção
Para atualizar o projeto em produção:
```plaintext
./update-project.sh
```
Este Script Fará: 
 1. Pull das últimas alterações 
 2. Rebuild dos containers
 3. Restart dos serviços