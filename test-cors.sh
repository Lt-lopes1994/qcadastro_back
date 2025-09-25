#!/bin/bash

echo "=== Testando CORS ===" 
echo ""

# Teste com diferentes origens
origins=(
    "https://www.qprospekta.com"
    "https://qprospekta.com"
    "https://q-cadastro.vercel.app"
    "http://localhost:9000"
    "https://q-cadastro-lt-lopes1994s-projects.vercel.app"
)

for origin in "${origins[@]}"; do
    echo "Testando origem: $origin"
    response=$(curl -s -I -X OPTIONS https://localhost:443/api/v1/auth/login \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -k)
    
    if echo "$response" | grep -q "Access-Control-Allow-Origin: $origin"; then
        echo "✅ CORS permitido para $origin"
    else
        echo "❌ CORS bloqueado para $origin"
    fi
    echo ""
done

echo "=== Teste completo ===" 
