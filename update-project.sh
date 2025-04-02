#!/bin/bash

echo "=============================="
echo "Iniciando atualização do projeto..."
echo "=============================="

# Diretório do projeto
PROJECT_DIR="/home/ubuntu/qcadastro_back"

# Navegar até o diretório do projeto
cd "$PROJECT_DIR" || {
  echo "Erro: Diretório do projeto não encontrado!"
  exit 1
}

# Atualizar o repositório Git
echo "Fazendo git fetch e pull..."
git fetch origin master
if git reset --hard origin/master; then
  echo "Repositório atualizado com sucesso."
else
  echo "Erro ao atualizar o repositório Git."
  exit 1
fi

# Reconstruir as imagens Docker
echo "Reconstruindo imagens Docker..."
if docker-compose down && docker-compose build && docker-compose up -d; then
  echo "Containers Docker reiniciados com sucesso."
else
  echo "Erro ao reiniciar os containers Docker."
  exit 1
fi

echo "=============================="
echo "Atualização concluída com sucesso!"
echo "=============================="