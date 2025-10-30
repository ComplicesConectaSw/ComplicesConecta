#!/bin/bash
# Script para ejecutar Datadog Agent en Docker - CONFIGURACIÓN COMPLETA
# ComplicesConecta v3.4.1
# Incluye: APM, Security, Profiling, Logs, Multi-line detection

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Desplegando Datadog Agent COMPLETO en Docker${NC}"
echo "========================================================"

# API Key de Datadog (creada por complicesconectasw@outlook.es)
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
    echo -e "${GREEN}✅ Contenedor anterior eliminado${NC}"
fi

# Crear directorios necesarios
echo -e "${BLUE}📁 Creando directorios necesarios...${NC}"
mkdir -p /var/run/datadog 2>/dev/null || sudo mkdir -p /var/run/datadog || true
mkdir -p /opt/datadog-agent/run 2>/dev/null || sudo mkdir -p /opt/datadog-agent/run || true

echo -e "${BLUE}🚀 Iniciando Datadog Agent con TODAS las funcionalidades...${NC}"
echo ""
echo "Características habilitadas:"
echo "  ✅ APM (Application Performance Monitoring)"
echo "  ✅ Security Monitoring (AppSec + IAST + SCA)"
echo "  ✅ Profiling automático"
echo "  ✅ Logs con multi-line detection"
echo "  ✅ Runtime Security"
echo "  ✅ Docker monitoring"
echo ""

# Ejecutar Datadog Agent con CONFIGURACIÓN COMPLETA
docker run -d \
  --name dd-agent \
  --restart unless-stopped \
  -e DD_API_KEY="${DD_API_KEY}" \
  -e DD_SITE="us5.datadoghq.com" \
  -e DD_ENV="production" \
  -e DD_SERVICE="complicesconecta" \
  -e DD_VERSION="3.4.1" \
  -e DD_TAGS="project:complicesconecta platform:docker created_by:complicesconectasw" \
  \
  `# APM Configuration` \
  -e DD_APM_ENABLED=true \
  -e DD_APM_NON_LOCAL_TRAFFIC=true \
  -e DD_APM_RECEIVER_SOCKET=/var/run/datadog/apm.socket \
  \
  `# Security Configuration` \
  -e DD_APPSEC_ENABLED=true \
  -e DD_IAST_ENABLED=true \
  -e DD_APPSEC_SCA_ENABLED=true \
  -e DD_RUNTIME_SECURITY_CONFIG_ENABLED=true \
  \
  `# Profiling Configuration` \
  -e DD_PROFILING_ENABLED=auto \
  \
  `# Logs Configuration` \
  -e DD_LOGS_ENABLED=true \
  -e DD_LOGS_CONFIG_AUTO_MULTI_LINE_DETECTION=true \
  -e DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true \
  -e DD_CONTAINER_EXCLUDE_LOGS="name:dd-agent" \
  \
  `# DogStatsD Configuration` \
  -e DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true \
  -e DD_DOGSTATSD_SOCKET=/var/run/datadog/dsd.socket \
  \
  `# Volumes - Data persistence` \
  -v /var/run/datadog:/var/run/datadog \
  -v /opt/datadog-agent/run:/opt/datadog-agent/run:rw \
  \
  `# Volumes - Docker monitoring` \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /proc/:/host/proc/:ro \
  -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \
  -v /var/lib/docker/containers:/var/lib/docker/containers:ro \
  \
  `# Volumes - System monitoring` \
  -v /:/host/root:ro \
  -v /sys/kernel/debug:/sys/kernel/debug \
  -v /etc/os-release:/etc/os-release \
  -v /etc/passwd:/etc/passwd:ro \
  -v /etc/group:/etc/group:ro \
  \
  `# Linux Capabilities for Security Monitoring` \
  --cap-add SYS_ADMIN \
  --cap-add SYS_RESOURCE \
  --cap-add SYS_PTRACE \
  --cap-add NET_ADMIN \
  --cap-add NET_BROADCAST \
  --cap-add NET_RAW \
  --cap-add IPC_LOCK \
  --cap-add CHOWN \
  \
  `# Port Mappings` \
  -p 8126:8126/tcp \
  -p 8125:8125/udp \
  \
  gcr.io/datadoghq/agent:7

# Verificar que se inició correctamente
sleep 3

if docker ps | grep -q dd-agent; then
    echo ""
    echo -e "${GREEN}✅✅✅ Datadog Agent desplegado exitosamente! ✅✅✅${NC}"
    echo ""
    echo -e "${BLUE}📊 Información del contenedor:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|dd-agent"
    
    echo ""
    echo -e "${BLUE}🔧 Funcionalidades Habilitadas:${NC}"
    echo "  ✅ APM (Application Performance Monitoring)"
    echo "  ✅ Security (AppSec, IAST, SCA, Runtime Security)"
    echo "  ✅ Profiling (Auto-detección)"
    echo "  ✅ Logs (Multi-line detection)"
    echo "  ✅ DogStatsD (Métricas custom)"
    echo "  ✅ Docker Monitoring"
    echo "  ✅ System Monitoring"
    
    echo ""
    echo -e "${BLUE}📝 Comandos útiles:${NC}"
    echo "  Ver logs en tiempo real:"
    echo "    docker logs -f dd-agent"
    echo ""
    echo "  Ver status del agente:"
    echo "    docker exec -it dd-agent agent status"
    echo ""
    echo "  Reiniciar agente:"
    echo "    docker restart dd-agent"
    echo ""
    echo "  Detener agente:"
    echo "    docker stop dd-agent"
    
    echo ""
    echo -e "${BLUE}🌐 Dashboard de Datadog:${NC}"
    echo "  https://us5.datadoghq.com"
    echo ""
    echo "  Ir a:"
    echo "    - Infrastructure → Host Map (ver tu servidor)"
    echo "    - APM → Services (ver trazas de aplicación)"
    echo "    - Security → Application Security (ver vulnerabilidades)"
    echo "    - Logs → Explorer (ver logs en tiempo real)"
    
    echo ""
    echo -e "${YELLOW}⏳ Esperando conexión inicial (2-3 minutos)...${NC}"
    echo "   El agente está reportando a Datadog. Verifica el dashboard."
    echo ""
    echo "========================================================"
else
    echo ""
    echo -e "${RED}❌ Error: El contenedor no se inició correctamente${NC}"
    echo "Ver logs de error:"
    echo "  docker logs dd-agent"
    exit 1
fi

