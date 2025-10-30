# 📊 Configuración de Datadog Agent - ComplicesConecta v3.4.1

**Fecha**: 30 de Octubre, 2025  
**Plataforma**: Kubernetes (EKS)  
**Site**: US5 (us5.datadoghq.com)

---

## 📋 RESUMEN DE CONFIGURACIÓN

Según las capturas proporcionadas, necesitas configurar Datadog Agent en Kubernetes con la siguiente configuración:

### ✅ Features Habilitadas

| Feature | Estado | Descripción |
|---------|--------|-------------|
| **Infrastructure Monitoring** | ✅ Incluido | Métricas de infraestructura completas |
| **Application Performance Monitoring** | ❌ Deshabilitado | Métricas de rendimiento de aplicaciones |
| **Log Management** | ❌ Deshabilitado | Recolección de logs |
| **DDOT Collector** | ❌ Deshabilitado | OpenTelemetry traces |

---

## 🚀 PASOS DE INSTALACIÓN

### Paso 1: Preparar el Entorno

```bash
# 1. Verificar que tienes acceso a tu cluster de Kubernetes
kubectl cluster-info

# 2. Verificar que estás en el namespace correcto
kubectl config current-context

# 3. Verificar que Helm está instalado
helm version
```

---

### Paso 2: Agregar Repositorio de Datadog

```bash
# Agregar el repositorio de Helm de Datadog
helm repo add datadog https://helm.datadoghq.com

# Actualizar repositorios
helm repo update

# Verificar que el repositorio está disponible
helm search repo datadog
```

**Salida esperada**:
```
NAME                            CHART VERSION   APP VERSION     DESCRIPTION
datadog/datadog                 3.x.x          7              Datadog Agent
datadog/datadog-operator        1.x.x          1              Datadog Operator
```

---

### Paso 3: Instalar el Datadog Operator (Recomendado)

```bash
# Instalar el Datadog Operator
helm install datadog-operator datadog/datadog-operator \
  --namespace default

# Verificar instalación
kubectl get pods -l app.kubernetes.io/name=datadog-operator
```

**Por qué Operator**:
- ✅ Gestión declarativa de configuración
- ✅ Updates automáticos
- ✅ Menos riesgo de misconfiguration
- ✅ Mejor health reporting

---

### Paso 4: Crear el Secret con tu API Key

⚠️ **IMPORTANTE**: Necesitas tu Datadog API Key. Puedes encontrarla en:
- Dashboard de Datadog → Organization Settings → API Keys
- URL: https://us5.datadoghq.com/organization-settings/api-keys

```bash
# Reemplazar YOUR_API_KEY con tu API key real
kubectl create secret generic datadog-secret \
  --from-literal=api-key="YOUR_API_KEY_HERE" \
  --namespace=default

# Verificar que el secret se creó
kubectl get secret datadog-secret -n default
```

**Alternativa usando archivo**:
```bash
# Crear archivo con la API key
echo -n "YOUR_API_KEY_HERE" > api-key.txt

# Crear secret desde archivo
kubectl create secret generic datadog-secret \
  --from-file=api-key=api-key.txt \
  --namespace=default

# IMPORTANTE: Eliminar el archivo después
rm api-key.txt
```

---

### Paso 5: Configurar el Archivo datadog-agent.yaml

El archivo `kubernetes/datadog-agent.yaml` ya está creado con la configuración según tus capturas:

```yaml
kind: DatadogAgent
apiVersion: v1
metadata:
  name: datadog
spec:
  global:
    site: "us5.datadoghq.com"  # Según tu captura
    credentials:
      apiSecret:
        secretName: "datadog-secret"
        keyName: "api-key"
  
  # Infrastructure Monitoring: INCLUIDO
  # APM: DESHABILITADO
  # Log Management: DESHABILITADO
  # DDOT Collector: DESHABILITADO
```

**Verificar configuración**:
```bash
# Ver el contenido del archivo
cat kubernetes/datadog-agent.yaml

# Validar YAML
kubectl apply --dry-run=client -f kubernetes/datadog-agent.yaml
```

---

### Paso 6: Desplegar el Agente

```bash
# Aplicar la configuración
kubectl apply -f kubernetes/datadog-agent.yaml

# Verificar que se creó el DatadogAgent resource
kubectl get datadogagent -n default

# Ver el estado del despliegue
kubectl describe datadogagent datadog -n default
```

**Salida esperada**:
```
NAME      STATUS    AGENT   CLUSTER-AGENT   CLUSTER-CHECKS-RUNNER
datadog   Running   3/3     1/1             0/0
```

---

### Paso 7: Verificar que el Agente está Corriendo

```bash
# Ver los pods del agente
kubectl get pods -l app.kubernetes.io/name=datadog -n default

# Ver logs del agente
kubectl logs -l app.kubernetes.io/name=datadog -n default --tail=50

# Verificar métricas
kubectl exec -it <datadog-agent-pod> -n default -- agent status
```

**Indicadores de éxito**:
```
✅ Estado: Running
✅ Conexión a us5.datadoghq.com: Success
✅ API Key válida: Yes
✅ Métricas enviándose: Yes
```

---

### Paso 8: Configurar Environment Tag

Según tu captura, necesitas configurar un tag de `env`:

**Opción 1: Editar el DatadogAgent**
```bash
kubectl edit datadogagent datadog -n default
```

Agregar en `spec.agent.env`:
```yaml
env:
  - name: DD_ENV
    value: "production"  # o "development"
  - name: DD_SERVICE
    value: "complicesconecta"
  - name: DD_VERSION
    value: "3.4.1"
```

**Opción 2: Usar Global Variables (ya está en el archivo)**

El archivo `datadog-agent.yaml` ya incluye esta configuración.

---

### Paso 9: Verificar en el Dashboard de Datadog

1. **Ir al Dashboard**:
   - URL: https://us5.datadoghq.com
   - Infrastructure → Infrastructure List

2. **Buscar tu Agente**:
   - Filtrar por `env:production` o `service:complicesconecta`
   - Deberías ver tus nodos de Kubernetes

3. **Verificar Métricas**:
   - Metrics → Explorer
   - Buscar: `system.cpu.user`, `system.mem.used`
   - Filtrar por tu environment

---

## 🔧 CONFIGURACIÓN CON SCRIPT AUTOMATIZADO

Para simplificar el proceso, usa el script `datadog-setup.sh`:

```bash
# Dar permisos de ejecución
chmod +x kubernetes/datadog-setup.sh

# Ejecutar el script
./kubernetes/datadog-setup.sh
```

El script te pedirá tu API Key y realizará todos los pasos automáticamente.

---

## 🐛 TROUBLESHOOTING

### Problema 1: "Waiting for the Agent to connect"

**Causa**: El agente aún no se ha conectado a Datadog.

**Solución**:
```bash
# Verificar estado del pod
kubectl get pods -l app.kubernetes.io/name=datadog -n default

# Ver logs
kubectl logs -l app.kubernetes.io/name=datadog -n default --tail=100

# Verificar conectividad
kubectl exec -it <datadog-agent-pod> -n default -- curl -I https://us5.datadoghq.com
```

**Tiempo normal de conexión**: 1-3 minutos

---

### Problema 2: API Key inválida

**Error**: `API key invalid`

**Solución**:
```bash
# Verificar el secret
kubectl get secret datadog-secret -n default -o yaml

# Recrear el secret con la API key correcta
kubectl delete secret datadog-secret -n default

kubectl create secret generic datadog-secret \
  --from-literal=api-key="NUEVA_API_KEY" \
  --namespace=default

# Reiniciar los pods del agente
kubectl rollout restart daemonset/datadog-agent -n default
```

---

### Problema 3: Pods en estado CrashLoopBackOff

**Causa**: Configuración incorrecta o recursos insuficientes.

**Verificación**:
```bash
# Ver eventos del pod
kubectl describe pod <datadog-agent-pod> -n default

# Ver logs de error
kubectl logs <datadog-agent-pod> -n default --previous

# Verificar recursos disponibles
kubectl top nodes
```

**Solución común**:
```yaml
# Reducir recursos en datadog-agent.yaml
resources:
  requests:
    memory: "128Mi"  # Reducido de 256Mi
    cpu: "100m"      # Reducido de 200m
```

---

### Problema 4: No aparecen métricas en Datadog

**Verificaciones**:
```bash
# 1. Verificar que el agente envía métricas
kubectl exec -it <datadog-agent-pod> -n default -- agent status

# 2. Buscar errores de envío
kubectl logs <datadog-agent-pod> -n default | grep -i error

# 3. Verificar network policies
kubectl get networkpolicies -n default

# 4. Verificar que el site es correcto
kubectl get datadogagent datadog -n default -o yaml | grep site
```

---

## 📊 INTEGRACIÓN CON COMPLICESCONECTA

### Habilitar APM (Application Performance Monitoring)

Si decides habilitar APM después:

```yaml
# Editar datadog-agent.yaml
features:
  apm:
    enabled: true
    hostPort: 8126
```

Luego, en tu aplicación (`server.js` o `main.tsx`):

```typescript
// Agregar al inicio del archivo
import tracer from 'dd-trace';

tracer.init({
  hostname: process.env.DD_AGENT_HOST || 'localhost',
  port: 8126,
  service: 'complicesconecta',
  env: 'production',
  version: '3.4.1',
  logInjection: true
});
```

---

### Habilitar Log Management

```yaml
# Editar datadog-agent.yaml
features:
  logCollection:
    enabled: true
    containerCollectAll: true
```

En tu aplicación, asegúrate de que los logs tengan formato JSON:

```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString()
});
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Pre-requisitos
- [ ] Kubectl instalado y configurado
- [ ] Helm instalado (v3.x)
- [ ] Acceso al cluster de Kubernetes
- [ ] API Key de Datadog disponible
- [ ] Site correcto identificado (us5.datadoghq.com)

### Instalación
- [ ] Repositorio de Datadog agregado
- [ ] Datadog Operator instalado
- [ ] Secret `datadog-secret` creado
- [ ] Archivo `datadog-agent.yaml` aplicado
- [ ] Pods del agente en estado Running

### Verificación
- [ ] Agente conectado en Dashboard de Datadog
- [ ] Métricas visibles en Infrastructure List
- [ ] Environment tag configurado
- [ ] No hay errores en logs del agente
- [ ] Botón "Finish" clickeable (agente detectado)

---

## 🎯 SIGUIENTES PASOS

Después de que el agente esté conectado:

1. **Explorar Dashboard de Infraestructura**
   - Ver métricas de CPU, memoria, disco
   - Configurar alertas básicas
   - Crear primeros dashboards personalizados

2. **Configurar Integraciones**
   - PostgreSQL (Supabase)
   - Redis (si estás usando)
   - Nginx/Load Balancer

3. **Habilitar Features Adicionales** (opcional)
   - APM para monitoreo de aplicaciones
   - Log Management para debugging
   - Real User Monitoring (RUM) para frontend

---

## 📚 RECURSOS ADICIONALES

- **Documentación Oficial**: https://docs.datadoghq.com/containers/kubernetes/
- **Datadog Operator**: https://github.com/DataDog/datadog-operator
- **Troubleshooting**: https://docs.datadoghq.com/agent/troubleshooting/
- **Dashboard de Datadog**: https://us5.datadoghq.com

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisar logs del agente**:
   ```bash
   kubectl logs -l app.kubernetes.io/name=datadog -n default --tail=200
   ```

2. **Verificar configuración**:
   ```bash
   kubectl get datadogagent datadog -n default -o yaml
   ```

3. **Contactar a Datadog Support**:
   - https://help.datadoghq.com/

---

**Última Actualización**: 30 de Octubre, 2025  
**Versión de Datadog Agent**: 7.x  
**Kubernetes Version**: 1.28+  
**Estado**: Listo para Desplegar

---

*Guía de configuración de Datadog Agent para ComplicesConecta v3.4.1*

