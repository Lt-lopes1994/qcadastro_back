#!/bin/bash

# wait-for-it.sh - Verifica se um host/porta está disponível antes de executar um comando
# Uso: ./wait-for-it.sh host:porta [-t timeout] [-- comando args]

WAITFORIT_cmdname=${0##*/}

echoerr() { if [[ $WAITFORIT_QUIET -ne 1 ]]; then echo "$@" 1>&2; fi }

usage()
{
    cat << USAGE >&2
Uso:
    $WAITFORIT_cmdname host:porta [-t timeout] [-- comando args]
    -h HOST | --host=HOST       Host ou IP a ser testado
    -p PORTA | --port=PORTA     Porta TCP a ser testada
    -t TIMEOUT | --timeout=TIMEOUT    Timeout em segundos, zero para nenhum timeout
    -- COMANDO ARGS     Comando com args a ser executado após o teste
USAGE
    exit 1
}

wait_for()
{
    if [[ $WAITFORIT_TIMEOUT -gt 0 ]]; then
        echoerr "$WAITFORIT_cmdname: esperando $WAITFORIT_HOST:$WAITFORIT_PORT por $WAITFORIT_TIMEOUT segundos"
    else
        echoerr "$WAITFORIT_cmdname: esperando $WAITFORIT_HOST:$WAITFORIT_PORT sem timeout"
    fi
    start_ts=$(date +%s)
    while :
    do
        if [[ $WAITFORIT_ISBUSY -eq 1 ]]; then
            nc -z $WAITFORIT_HOST $WAITFORIT_PORT
            result=$?
        else
            (echo > /dev/tcp/$WAITFORIT_HOST/$WAITFORIT_PORT) >/dev/null 2>&1
            result=$?
        fi
        if [[ $result -eq 0 ]]; then
            end_ts=$(date +%s)
            echoerr "$WAITFORIT_cmdname: $WAITFORIT_HOST:$WAITFORIT_PORT está disponível após $((end_ts - start_ts)) segundos"
            break
        fi
        sleep 1
    done
    return $result
}

wait_for_wrapper()
{
    if [[ $WAITFORIT_TIMEOUT -gt 0 ]]; then
        wait_for "$@"
        WAITFORIT_RESULT=$?
        if [[ $WAITFORIT_RESULT -ne 0 ]]; then
            echoerr "$WAITFORIT_cmdname: timeout após esperar $WAITFORIT_TIMEOUT segundos por $WAITFORIT_HOST:$WAITFORIT_PORT"
        fi
        return $WAITFORIT_RESULT
    else
        wait_for "$@"
    fi
}

# Processamento dos argumentos
while [[ $# -gt 0 ]]
do
    case "$1" in
        *:* )
        WAITFORIT_hostport=(${1//:/ })
        WAITFORIT_HOST=${WAITFORIT_hostport[0]}
        WAITFORIT_PORT=${WAITFORIT_hostport[1]}
        shift 1
        ;;
        --timeout=*)
        WAITFORIT_TIMEOUT="${1#*=}"
        shift 1
        ;;
        -t)
        WAITFORIT_TIMEOUT="$2"
        if [[ $WAITFORIT_TIMEOUT == "" ]]; then break; fi
        shift 2
        ;;
        --)
        shift
        WAITFORIT_CLI=("$@")
        break
        ;;
        *)
        echoerr "Opção desconhecida: $1"
        usage
        ;;
    esac
done

if [[ "$WAITFORIT_HOST" == "" || "$WAITFORIT_PORT" == "" ]]; then
    echoerr "Erro: você precisa fornecer um host e porta para testar."
    usage
fi

WAITFORIT_TIMEOUT=${WAITFORIT_TIMEOUT:-15}
WAITFORIT_STRICT=${WAITFORIT_STRICT:-0}
WAITFORIT_CHILD=${WAITFORIT_CHILD:-0}
WAITFORIT_QUIET=${WAITFORIT_QUIET:-0}
WAITFORIT_ISBUSY=${WAITFORIT_ISBUSY:-0}

if [[ $WAITFORIT_CLI != "" ]]; then
    if [[ $WAITFORIT_RESULT -ne 0 && $WAITFORIT_STRICT -eq 1 ]]; then
        echoerr "$WAITFORIT_cmdname: timeout ocorreu e modo strict ativado"
        exit $WAITFORIT_RESULT
    fi
    exec "${WAITFORIT_CLI[@]}"
else
    exit $WAITFORIT_RESULT
fi