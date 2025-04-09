#!/bin/bash
echo "==============================================="
echo "Script para criação de usuários em massa de teste"
echo "==============================================="

# Executar o script TypeScript
npx ts-node -r tsconfig-paths/register ./src/scripts/create-test-users.ts

echo "==============================================="