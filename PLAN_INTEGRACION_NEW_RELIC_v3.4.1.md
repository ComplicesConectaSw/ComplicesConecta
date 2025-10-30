# 📊 Plan de Integración New Relic + Docker - ComplicesConecta v3.4.1

## 🎯 Objetivo
Integrar New Relic para monitoreo avanzado de Docker y métricas de aplicación en tiempo real.

---

## 📋 Información de Cuenta New Relic

- **Account ID**: 7299297
- **License Key**: `6f647c9c6eaa46100c049ab77e900462FFFFNRAL`
- **URL Dashboard**: https://one.newrelic.com/nr1-core?account=7299297&state=dc44eece-8089-5246-1af9-903ef8497d22

---

## 🚀 Pasos de Implementación

### **Paso 1: Crear Archivo de Configuración del Agente**
```bash
mkdir ~/newrelic-infra && cd ~/newrelic-infra && echo "license_key: 6f647c9c6eaa46100c049ab77e900462FFFFNRAL" > newrelic-infra.yml
```

**Resultado Esperado**: 
- Directorio `~/newrelic-infra/` creado
- Archivo `newrelic-infra.yml` con license key configurada

---

### **Paso 2: Crear Dockerfile para New Relic Infrastructure**
```bash
cat >> newrelic-infra.dockerfile << EOF
FROM newrelic/infrastructure:latest
ADD newrelic-infra.yml /etc/newrelic-infra.yml
EOF
```

**Resultado Esperado**:
- Archivo `newrelic-infra.dockerfile` creado
- Extiende imagen oficial de New Relic
- Monta configuración en `/etc/newrelic-infra.yml`

---

### **Paso 3: Crear Docker Compose para New Relic**
```bash
cat >> docker-compose.yaml << EOF
version: '3'

services:
  agent:
    container_name: newrelic-infra
    build:
      context: .
      dockerfile: newrelic-infra.dockerfile
    cap_add:
      - SYS_PTRACE
    network_mode: host
    pid: host
    privileged: true
    volumes:
      - "/:/host:ro"
      - "/var/run/docker.sock:/var/run/docker.sock"
    restart: unless-stopped
EOF
```

**Resultado Esperado**:
- Archivo `docker-compose.yaml` creado
- Configuración de contenedor con permisos privilegiados
- Montaje de Docker socket para monitoreo
- Reinicio automático configurado

---

### **Paso 4: Iniciar Agente New Relic**
```bash
docker compose -f docker-compose.yaml up -d
```

**Resultado Esperado**:
- Contenedor `newrelic-infra` corriendo en segundo plano
- Agente enviando métricas a New Relic
- Dashboard de New Relic mostrando datos en tiempo real

---

## 🔗 Integración con Sistema Actual

### **1. Conectar PerformanceMonitoringService con New Relic**

**Ubicación**: `src/services/PerformanceMonitoringService.ts`

**Modificaciones Necesarias**:
```typescript
import * as newrelic from 'newrelic';

class PerformanceMonitoringService {
  // Agregar método para enviar métricas a New Relic
  private sendToNewRelic(metric: PerformanceMetric): void {
    newrelic.recordCustomEvent('PerformanceMetric', {
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      category: metric.category,
      timestamp: metric.timestamp.toISOString()
    });
  }

  // Modificar recordMetric para incluir New Relic
  recordMetric(metricData: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      id: `${metricData.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...metricData,
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);
    
    // Enviar a New Relic
    this.sendToNewRelic(fullMetric);
    
    // ... resto del código
  }
}
```

---

### **2. Instalar Dependencias New Relic**

```bash
npm install newrelic --save
```

**Archivo de configuración**: `newrelic.js` (raíz del proyecto)
```javascript
'use strict'

exports.config = {
  app_name: ['ComplicesConecta-v3.4.1'],
  license_key: '6f647c9c6eaa46100c049ab77e900462FFFFNRAL',
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
}
```

---

### **3. Actualizar AnalyticsDashboard para Mostrar Datos de New Relic**

**Ubicación**: `src/components/admin/AnalyticsDashboard.tsx`

**Nuevas Funcionalidades**:
- Conectar API de New Relic para obtener métricas
- Mostrar alertas de New Relic en el dashboard
- Visualizar APM (Application Performance Monitoring)
- Integrar logs de New Relic

---

## 📊 Métricas a Monitorear en New Relic

### **Frontend Metrics**
- ✅ Web Vitals (LCP, FCP, FID, CLS, TTFB)
- ✅ Page Load Time
- ✅ Time to Interactive
- ✅ API Response Times
- ✅ Error Rates

### **Backend Metrics**
- ⏳ Database Query Performance
- ⏳ Supabase Connection Pool
- ⏳ Memory Usage
- ⏳ CPU Usage
- ⏳ Network I/O

### **Docker Metrics**
- ⏳ Container Health
- ⏳ Container Resource Usage
- ⏳ Docker Network Performance
- ⏳ Volume I/O

---

## 🔔 Configuración de Alertas

### **Alertas Críticas**
1. **Page Load > 4s**: Alerta crítica
2. **Error Rate > 5%**: Alerta alta
3. **API Response > 1s**: Alerta media
4. **Memory Usage > 80%**: Alerta alta

### **Canales de Notificación**
- Email: Configurar en New Relic dashboard
- Webhook: Integrar con Slack/Discord (opcional)
- SMS: Para alertas críticas (opcional)

---

## 🧪 Testing y Validación

### **Paso 1: Verificar Conexión**
1. Acceder a https://one.newrelic.com/nr1-core?account=7299297
2. Verificar que aparece el host en Infrastructure
3. Comprobar métricas de Docker en tiempo real

### **Paso 2: Pruebas de Estrés**
```bash
# Generar carga para verificar monitoreo
npm run test:load
```

### **Paso 3: Validar Alertas**
- Simular error crítico
- Verificar que se dispara alerta en New Relic
- Comprobar notificaciones

---

## 📁 Archivos a Crear/Modificar

### **Nuevos Archivos**
- [ ] `~/newrelic-infra/newrelic-infra.yml`
- [ ] `~/newrelic-infra/newrelic-infra.dockerfile`
- [ ] `~/newrelic-infra/docker-compose.yaml`
- [ ] `newrelic.js` (raíz del proyecto)
- [ ] `src/config/newrelic.config.ts`

### **Archivos a Modificar**
- [ ] `src/services/PerformanceMonitoringService.ts`
- [ ] `src/components/admin/AnalyticsDashboard.tsx`
- [ ] `package.json` (agregar newrelic)
- [ ] `vite.config.ts` (configurar New Relic plugin)
- [ ] `.env` (agregar NEW_RELIC_LICENSE_KEY)

---

## 🔒 Seguridad

### **Protección de Credenciales**
```bash
# Agregar a .env
NEW_RELIC_LICENSE_KEY=6f647c9c6eaa46100c049ab77e900462FFFFNRAL
NEW_RELIC_ACCOUNT_ID=7299297
NEW_RELIC_APP_NAME=ComplicesConecta-v3.4.1
```

### **Agregar a .gitignore**
```
# New Relic
newrelic.js
newrelic-infra.yml
~/newrelic-infra/
```

---

## 📈 Roadmap de Integración

### **Fase 1: Infraestructura (Próxima Sesión)** ⏳
- Configurar Docker con New Relic
- Instalar agente de infraestructura
- Validar conexión y métricas básicas

### **Fase 2: APM (Application Performance Monitoring)** 📅
- Integrar New Relic APM con aplicación React
- Configurar custom events
- Implementar distributed tracing

### **Fase 3: Alertas y Notificaciones** 📅
- Configurar alertas críticas
- Integrar webhooks
- Crear runbooks de respuesta

### **Fase 4: Optimización** 📅
- Analizar métricas recolectadas
- Optimizar queries lentas
- Reducir latencias identificadas

---

## 🎓 Recursos de Documentación

- **New Relic Docs**: https://docs.newrelic.com/
- **Docker Monitoring**: https://docs.newrelic.com/docs/infrastructure/install-infrastructure-agent/linux-installation/docker-container-infrastructure-monitoring/
- **APM Guide**: https://docs.newrelic.com/docs/apm/new-relic-apm/getting-started/introduction-apm/
- **Best Practices**: https://docs.newrelic.com/docs/new-relic-solutions/best-practices-guides/full-stack-observability/infrastructure-monitoring-best-practices-guide/

---

## ✅ Checklist de Implementación

### **Pre-requisitos**
- [x] Cuenta New Relic creada
- [x] License Key obtenida
- [x] Docker instalado y corriendo
- [x] Proyecto compilando sin errores

### **Implementación**
- [ ] Crear directorio newrelic-infra
- [ ] Crear archivo de configuración
- [ ] Crear Dockerfile
- [ ] Crear Docker Compose
- [ ] Iniciar agente New Relic
- [ ] Verificar conexión en dashboard
- [ ] Instalar dependencia npm newrelic
- [ ] Crear archivo newrelic.js
- [ ] Modificar PerformanceMonitoringService
- [ ] Actualizar AnalyticsDashboard
- [ ] Configurar alertas
- [ ] Testing completo

### **Post-implementación**
- [ ] Documentar en README.md
- [ ] Crear guía de troubleshooting
- [ ] Capacitar al equipo
- [ ] Monitorear por 48h

---

## 🐛 Troubleshooting Común

### **Error: Container no inicia**
```bash
# Verificar logs
docker logs newrelic-infra

# Verificar permisos
sudo chmod 666 /var/run/docker.sock
```

### **Error: No se envían métricas**
- Verificar license key en newrelic-infra.yml
- Comprobar conectividad a internet
- Revisar logs del contenedor

### **Error: Dashboard vacío**
- Esperar 5-10 minutos (lag inicial)
- Verificar que el contenedor está corriendo
- Comprobar firewall/proxy

---

## 📝 Notas Importantes

1. **License Key es privada**: NO commitear en Git
2. **Requiere privilegios**: Contenedor necesita modo privilegiado
3. **Consumo de recursos**: Monitorear impacto en performance
4. **Costos**: Revisar límites de cuenta gratuita New Relic
5. **Backup**: Hacer backup antes de modificar Docker

---

## 🎯 Objetivos de la Próxima Sesión

1. ✅ Ejecutar comandos de configuración
2. ✅ Iniciar contenedor New Relic
3. ✅ Validar conexión al dashboard
4. ✅ Instalar dependencias npm
5. ✅ Modificar servicios existentes
6. ✅ Testing completo
7. ✅ Commit y push a GitHub

**Tiempo Estimado**: 45-60 minutos

---

**Estado Actual del Proyecto**: 
- ✅ Errores de linting corregidos (0 errores)
- ✅ Build exitoso (9.16s)
- ✅ Tests actualizados
- ✅ Cambios subidos a GitHub
- ⏳ Listo para integración New Relic

---

**Fecha de Creación**: 2025-01-29
**Versión**: v3.4.1
**Última Actualización**: 2025-01-29 23:45 UTC

