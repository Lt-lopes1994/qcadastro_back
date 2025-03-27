#!/bin/bash
# wait-for-it.sh: Espera pela disponibilidade de um host e porta
# Uso: ./wait-for-it.sh host:porta [--timeout=segundos] [-- comando arg1 arg2...]
# Script baseado no original: https://github.com/vishnubob/wait-for-it

WAITFORIT_cmdname=${0##*/}
WAITFORIT_timeout=15
WAITFORIT_strict=0
WAITFORIT_child=0
WAITFORIT_quiet=0
WAITFORIT_host=""
WAITFORIT_port=""
WAITFORIT_result=0

function usage {
  cat << USAGE >&2
Uso:
    $WAITFORIT_cmdname host:porta [-s] [-t timeout] [-- comando arg1 arg2...]
    -h HOST | --host=HOST       Host ou IP a esperar
    -p PORT | --port=PORT       Porta TCP a esperar
    -s | --strict               Modo estrito, falha se não estiver disponível antes do timeout
    -q | --quiet                Não produz nenhuma saída
    -t TIMEOUT | --timeout=TIMEOUT 
                                Segundos a esperar, zero para infinito
    -- COMMAND ARGS             Executa comando com argumentos após o teste
USAGE
  exit 1
}

function wait_for {
  if [[ $WAITFORIT_timeout -gt 0 ]]; then
    echo "Esperando $WAITFORIT_timeout segundos por $WAITFORIT_host:$WAITFORIT_port"
  else
    echo "Esperando por $WAITFORIT_host:$WAITFORIT_port sem timeout"
  fi
  
  WAITFORIT_start_ts=$(date +%s)
  while :
  do
    if [[ $WAITFORIT_timeout -gt 0 ]]; then
      WAITFORIT_current_ts=$(date +%s)
      WAITFORIT_secs_passed=$(( WAITFORIT_current_ts - WAITFORIT_start_ts ))
      if [[ $WAITFORIT_secs_passed -gt $WAITFORIT_timeout ]]; then
        echo "Tempo limite atingido"
        WAITFORIT_result=1
        break
      fi
    fi
    
    (echo > /dev/tcp/$WAITFORIT_host/$WAITFORIT_port) >/dev/null 2>&1
    WAITFORIT_result=$?
    
    if [[ $WAITFORIT_result -eq 0 ]]; then
      echo "$WAITFORIT_host:$WAITFORIT_port está disponível após $WAITFORIT_secs_passed segundos"
      break
    fi
    
    echo "Aguardando $WAITFORIT_host:$WAITFORIT_port... $WAITFORIT_secs_passed segundos"
    sleep 1
  done
  
  return $WAITFORIT_result
}

# Processar argumentos
while [[ $# -gt 0 ]]
do
  case "$1" in
    *:* )
    WAITFORIT_hostport=(${1//:/ })
    WAITFORIT_host=${WAITFORIT_hostport[0]}
    WAITFORIT_port=${WAITFORIT_hostport[1]}
    shift 1
    ;;
    --host=*)
    WAITFORIT_host="${1#*=}"
    shift 1
    ;;
    --port=*)
    WAITFORIT_port="${1#*=}"
    shift 1
    ;;
    -q | --quiet)
    WAITFORIT_quiet=1
    shift 1
    ;;
    -s | --strict)
    WAITFORIT_strict=1
    shift 1
    ;;
    -t)
    WAITFORIT_timeout="$2"
    if [[ $WAITFORIT_timeout == "" ]]; then break; fi
    shift 2
    ;;
    --timeout=*)
    WAITFORIT_timeout="${1#*=}"
    shift 1
    ;;
    --)
    shift
    WAITFORIT_CLI=("$@")
    break
    ;;
    --help)
    usage
    ;;
    *)
    echo "Opção desconhecida: $1"
    usage
    ;;
  esac
done

if [[ "$WAITFORIT_host" == "" || "$WAITFORIT_port" == "" ]]; then
  echo "Erro: você precisa fornecer um host e porta para testar."
  usage
fi

wait_for
WAITFORIT_RESULT=$?

if [[ $WAITFORIT_CLI ]]; then
  if [[ $WAITFORIT_RESULT -ne 0 && $WAITFORIT_strict -eq 1 ]]; then
    echo "Não foi possível conectar ao $WAITFORIT_host:$WAITFORIT_port"
    exit $WAITFORIT_RESULT
  fi
  exec "${WAITFORIT_CLI[@]}"
else
  exit $WAITFORIT_RESULT
fi