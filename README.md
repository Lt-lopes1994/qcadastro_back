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

### BACKUP DATABASE

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

## DOCKER LOCAL

```bash
Docker

- Inicialização e controle

# Iniciar os serviços em modo detached (background)
docker-compose -f docker-compose.dev.yml up -d

# Parar os serviços
docker-compose -f docker-compose.dev.yml down

# Reiniciar os serviços
docker-compose -f docker-compose.dev.yml restart

# Reconstruir as imagens e iniciar
docker-compose -f docker-compose.dev.yml up -d --build

# Parar serviços e remover volumes
docker-compose -f docker-compose.dev.yml up -d

- Logs e monitoramento

# Ver logs de todos os serviços
docker-compose -f docker-compose.dev.yml logs

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs apenas do app
docker-compose -f docker-compose.dev.yml logs app_dev

# Ver logs do banco
docker-compose -f docker-compose.dev.yml logs db_dev

- Execução de comandos

# Acessar o shell do container da aplicação
docker exec -it qcadastro_app_dev sh

# Executar as migrations
docker exec qcadastro_app_dev npm run typeorm migration:run

# Criar um usuário admin
docker exec qcadastro_app_dev npm run script:create-admin

# Executar testes
docker exec qcadastro_app_dev npm test

- Status e inspeção

# Verificar status dos serviços
docker-compose -f docker-compose.dev.yml ps

# Ver uso de recursos
docker stats qcadastro_app_dev qcadastro_db_dev

# Inspecionar container
docker inspect qcadastro_app_dev

- Banco de dados

# Acessar o MySQL do container
docker exec -it qcadastro_db_dev mysql -u dev_user -pdev_password qeCadastro

# Fazer dump do banco de dados
docker exec qcadastro_db_dev sh -c 'mysqldump -u dev_user -pdev_password qeCadastro > /tmp/backup.sql'
docker cp qcadastro_db_dev:/tmp/backup.sql ./backup.sql

- Limpeza
# Remover containers parados
docker container prune -f

# Remover volumes não utilizados
docker volume prune -f

# Remover imagens não utilizadas
docker image prune -f
```

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

1.  Pull das últimas alterações
2.  Rebuild dos containers
3.  Restart dos serviços
