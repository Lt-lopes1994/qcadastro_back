#!/bin/bash

# Script para limpar logs do Nginx semanalmente
echo "=============================="
echo "Iniciando limpeza dos logs do Nginx..."
echo "$(date)"
echo "=============================="

# Diretório dos logs
LOG_DIR="/home/ubuntu/qcadastro_back/nginx/logs"

# Verificar se o diretório existe
if [ ! -d "$LOG_DIR" ]; then
  echo "Diretório de logs não encontrado: $LOG_DIR"
  exit 1
fi

# Limpar os logs com sudo
echo "Limpando arquivos de log..."
sudo bash -c "
  if [ -f \"$LOG_DIR/access.log\" ]; then
    > \"$LOG_DIR/access.log\" 
    echo \"✓ access.log limpo\"
  else
    echo \"× Arquivo access.log não encontrado\"
  fi

  if [ -f \"$LOG_DIR/error.log\" ]; then
    > \"$LOG_DIR/error.log\"
    echo \"✓ error.log limpo\"
  else
    echo \"× Arquivo error.log não encontrado\"
  fi

  if [ -f \"$LOG_DIR/uploads_access.log\" ]; then
    > \"$LOG_DIR/uploads_access.log\"
    echo \"✓ uploads_access.log limpo\"
  else
    echo \"× Arquivo uploads_access.log não encontrado\"
  fi

  if [ -f \"$LOG_DIR/uploads_error.log\" ]; then
    > \"$LOG_DIR/uploads_error.log\"
    echo \"✓ uploads_error.log limpo\"
  else
    echo \"× Arquivo uploads_error.log não encontrado\"
  fi
"

echo "=============================="
echo "Limpeza dos logs concluída com sucesso!"
echo "=============================="