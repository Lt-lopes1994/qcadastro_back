#!/bin/bash
echo "==============================================="
echo "Script para gerar e executar migrações do TypeORM"
echo "==============================================="

# Solicitar o nome da migração
read -p "Digite o nome para a nova migração: " MIGRATION_NAME

if [ -z "$MIGRATION_NAME" ]; then
  echo "Erro: Nome da migração não pode ser vazio."
  exit 1
fi

echo "Gerando migração: $MIGRATION_NAME..."

# Gerar a migração
# Gerar a migração
npm run typeorm -- migration:generate -d ./src/database/datasource.ts ./src/migrations/$MIGRATION_NAME
# Verificar se a migração foi gerada com sucesso
if [ $? -eq 0 ]; then
  echo "Migração gerada com sucesso!"
  echo "Executando a migração..."
  
  # Executar a migração
  npm run typeorm migration:run
  
  if [ $? -eq 0 ]; then
    echo "✅ Migração executada com sucesso!"
  else
    echo "❌ Erro ao executar a migração."
    exit 1
  fi
else
  echo "❌ Erro ao gerar a migração."
  exit 1
fi

echo "==============================================="