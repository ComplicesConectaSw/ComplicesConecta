#!/bin/bash
# Script de configuración de Datadog Agent para ComplicesConecta v3.4.1
# Basado en la configuración de las capturas proporcionadas

set -e

echo "🔧 Configurando Datadog Agent para ComplicesConecta v3.4.1"
echo "========================================================"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ kubectl encontrado${NC}"

# Verificar que helm está instalado
if ! command -v helm &> /dev/null; then
    echo -e "${RED}❌ Helm no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Helm encontrado${NC}"

# Paso 1: Agregar el repositorio de Datadog
echo ""
echo "📦 Paso 1: Agregando repositorio de Datadog..."
helm repo add datadog https://helm.datadoghq.com
helm repo update

echo -e "${GREEN}✅ Repositorio agregado${NC}"

# Paso 2: Solicitar API Key
echo ""
echo "🔑 Paso 2: Configurando credenciales..."
echo -e "${YELLOW}Por favor ingresa tu Datadog API Key:${NC}"
read -s DD_API_KEY

if [ -z "$DD_API_KEY" ]; then
    echo -e "${RED}❌ API Key no puede estar vacía${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API Key configurada${NC}"

# Paso 3: Crear el secret con la API Key
echo ""
echo "🔐 Paso 3: Creando secret de Kubernetes..."
kubectl create secret generic datadog-secret \
  --from-literal=api-key="$DD_API_KEY" \
  --namespace=default \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✅ Secret creado${NC}"

# Paso 4: Instalar el Datadog Operator
echo ""
echo "⚙️  Paso 4: Instalando Datadog Operator..."
helm install datadog-operator datadog/datadog-operator \
  --namespace default

echo -e "${GREEN}✅ Datadog Operator instalado${NC}"

# Paso 5: Esperar a que el Operator esté listo
echo ""
echo "⏳ Paso 5: Esperando a que el Operator esté listo..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=datadog-operator \
  --namespace=default \
  --timeout=300s

echo -e "${GREEN}✅ Operator está listo${NC}"

# Paso 6: Aplicar la configuración del agente
echo ""
echo "🚀 Paso 6: Desplegando Datadog Agent..."
kubectl apply -f datadog-agent.yaml

echo -e "${GREEN}✅ Configuración aplicada${NC}"

# Paso 7: Verificar el despliegue
echo ""
echo "🔍 Paso 7: Verificando despliegue..."
echo "Esperando a que los pods estén listos..."

sleep 10

# Verificar pods del agente
kubectl get pods -l app.kubernetes.io/name=datadog -n default

echo ""
echo "========================================================"
echo -e "${GREEN}✅ Instalación completada!${NC}"
echo ""
echo "📊 Para verificar el estado del agente:"
echo "   kubectl get datadogagent -n default"
echo ""
echo "📝 Para ver los logs del agente:"
echo "   kubectl logs -l app.kubernetes.io/name=datadog -n default"
echo ""
echo "🌐 Dashboard de Datadog:"
echo "   https://us5.datadoghq.com"
echo ""
echo "⏳ Esperando conexión del agente (esto puede tomar 1-3 minutos)..."
echo "   Puedes hacer clic en 'Finish' cuando veas el agente conectado."
echo "========================================================"

