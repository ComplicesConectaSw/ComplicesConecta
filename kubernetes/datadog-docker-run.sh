#!/bin/bash
# Script para ejecutar Datadog Agent en Docker
# ComplicesConecta v3.4.1

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🐳 Desplegando Datadog Agent en Docker"
echo "========================================"

# API Key de Datadog
DD_API_KEY="316e57de13f5435f8d49c484a61c6757"

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor inícialo primero.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está corriendo${NC}"

# Detener contenedor anterior si existe
if docker ps -a | grep -q dd-agent; then
    echo -e "${YELLOW}⚠️  Deteniendo contenedor anterior...${NC}"
    docker stop dd-agent 2>/dev/null || true
    docker rm dd-agent 2>/dev/null || true
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p /var/run/datadog 2>/dev/null || sudo mkdir -p /var/run/datadog || true

# Ejecutar Datadog Agent
echo "🚀 Iniciando Datadog Agent..."

docker run -d \
  --name dd-agent \
  --restart unless-stopped \
  -e DD_API_KEY="${DD_API_KEY}" \
  -e DD_SITE="us5.datadoghq.com" \
  -e DD_ENV="production" \
  -e DD_SERVICE="complicesconecta" \
  -e DD_VERSION="3.4.1" \
  -e DD_TAGS="project:complicesconecta platform:docker" \
  -e DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true \
  -e DD_APM_ENABLED=true \
  -e DD_APM_NON_LOCAL_TRAFFIC=true \
  -e DD_LOGS_ENABLED=true \
  -e DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true \
  -e DD_CONTAINER_EXCLUDE="name:dd-agent" \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /proc/:/host/proc/:ro \
  -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \
  -v /var/lib/docker/containers:/var/lib/docker/containers:ro \
  -v /var/run/datadog:/var/run/datadog \
  -p 8126:8126/tcp \
  -p 8125:8125/udp \
  gcr.io/datadoghq/agent:7

echo ""
echo -e "${GREEN}✅ Datadog Agent desplegado exitosamente!${NC}"
echo ""
echo "📊 Información del contenedor:"
docker ps | grep dd-agent

echo ""
echo "📝 Para ver los logs del agente:"
echo "   docker logs -f dd-agent"
echo ""
echo "🌐 Dashboard de Datadog:"
echo "   https://us5.datadoghq.com"
echo ""
echo "⏳ Esperando conexión (1-3 minutos)..."
echo "========================================"

