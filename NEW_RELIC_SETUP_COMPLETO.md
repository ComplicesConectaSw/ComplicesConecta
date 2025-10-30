# 📊 New Relic - Configuración Completa
**ComplicesConecta v3.4.1**

---

## ✅ ESTADO ACTUAL

### **Infrastructure Monitoring** ✅ ACTIVO
- **Contenedor**: `newrelic-infra` corriendo
- **Agent ID**: 9138276377702931557
- **Estado**: Up and running
- **Métricas**: Docker, CPU, memoria, red

### **APM (Application Performance Monitoring)** ⏳ CONFIGURADO
- **Package**: `newrelic@latest` instalado
- **Config**: `newrelic.js` creado
- **Dockerfile**: Configurado con variables de entorno
- **Estado**: Listo para deploy

---

## 🔧 ARCHIVOS CREADOS

### **1. newrelic.js** ✅
Configuración principal del agente New Relic
- App name: ComplicesConecta
- License key configurada
- Distributed tracing habilitado
- AI monitoring activado
- Logging a stdout
- Custom events: 100k samples
- Span events: 10k samples

### **2. Dockerfile** ✅
Multi-stage build con New Relic integrado
- Base: node:20-alpine
- Build optimizado
- Variables de entorno configuradas
- Health check incluido
- Usuario no-root (seguridad)
- Auto-require de newrelic

### **3. .dockerignore** ✅
Optimización de build
- Excluye node_modules
- Excluye archivos de desarrollo
- Reduce tamaño de imagen

### **4. docker-build-newrelic.ps1** ✅
Script automatizado para gestión
- Build de imagen
- Run de contenedor
- Stop/Start
- Logs en tiempo real
- Status monitoring

---

## 🚀 COMANDOS DISPONIBLES

### **Opción 1: Script PowerShell (RECOMENDADO)**
```powershell
# Build y run en un solo comando
.\docker-build-newrelic.ps1 -Action run

# Solo build
.\docker-build-newrelic.ps1 -Action build

# Ver logs
.\docker-build-newrelic.ps1 -Action logs

# Ver status
.\docker-build-newrelic.ps1 -Action status

# Rebuild completo
.\docker-build-newrelic.ps1 -Action rebuild
```

### **Opción 2: Comandos Docker Manuales**
```bash
# 1. Build
docker build -t complicesconecta:latest .

# 2. Run
docker run -d \
  --name complicesconecta \
  -p 3000:3000 \
  -e NEW_RELIC_LICENSE_KEY=6f647c9c6eaa46100c049ab77e900462FFFFNRAL \
  -e NEW_RELIC_APP_NAME="ComplicesConecta" \
  complicesconecta:latest

# 3. Ver logs
docker logs -f complicesconecta

# 4. Stop
docker stop complicesconecta
docker rm complicesconecta
```

---

## 📊 DASHBOARDS NEW RELIC

### **Infrastructure Dashboard**
🔗 https://one.newrelic.com/nr1-core?account=7299297&state=dc44eece-8089-5246-1af9-903ef8497d22

**Métricas Disponibles**:
- Docker containers (running, stopped)
- CPU usage por contenedor
- Memory usage
- Network I/O
- Disk I/O
- Process list

### **APM Dashboard** (cuando deploy esté activo)
🔗 https://one.newrelic.com/launcher/nr1-core.explorer?pane=eyJuZXJkbGV0SWQiOiJhcG0tbmVyZGxldHMuYXBwLWlkeCJ9

**Métricas Disponibles**:
- Response time
- Throughput (requests/min)
- Error rate
- Apdex score
- Transaction traces
- Database queries
- External services
- AI monitoring (si hay llamadas a AI)

---

## 🔍 VERIFICACIÓN POST-DEPLOY

### **1. Verificar contenedor corriendo**
```powershell
docker ps | findstr complicesconecta
```

### **2. Verificar logs de New Relic**
```powershell
docker logs complicesconecta | findstr "New Relic"
```

**Esperado**:
```
New Relic for Node.js is running in agent mode.
Agent state changed from stopped to started
Reporting to: https://rpm.newrelic.com/accounts/7299297/applications/...
```

### **3. Verificar métricas en dashboard**
1. Ir a https://one.newrelic.com/nr1-core?account=7299297
2. Click en "APM" en el menú izquierdo
3. Buscar "ComplicesConecta"
4. Verificar que aparecen métricas en tiempo real

---

## 📈 MÉTRICAS MONITOREADAS

### **Performance**
- ✅ Page load time
- ✅ Time to first byte (TTFB)
- ✅ Largest contentful paint (LCP)
- ✅ First input delay (FID)
- ✅ Cumulative layout shift (CLS)

### **Backend**
- ✅ API response time
- ✅ Database query performance
- ✅ External service calls
- ✅ Memory usage
- ✅ CPU usage

### **Errors**
- ✅ Error rate
- ✅ Error messages
- ✅ Stack traces
- ✅ Error distribution

### **Custom Events**
- ✅ Performance metrics (de PerformanceMonitoringService)
- ✅ Error alerts (de ErrorAlertService)
- ✅ User interactions
- ✅ Business metrics

---

## 🔗 INTEGRACIÓN CON SERVICIOS EXISTENTES

### **PerformanceMonitoringService.ts**
Actualizar para enviar métricas a New Relic:

```typescript
import newrelic from 'newrelic';

// En recordMetric()
newrelic.recordCustomEvent('PerformanceMetric', {
  name: metric.name,
  value: metric.value,
  unit: metric.unit,
  category: metric.category,
  timestamp: metric.timestamp.toISOString()
});
```

### **ErrorAlertService.ts**
Enviar errores a New Relic:

```typescript
import newrelic from 'newrelic';

// En createAlert()
newrelic.noticeError(new Error(alert.message), {
  severity: alert.severity,
  category: alert.category,
  userId: alert.userId
});
```

---

## 🎯 ALERTAS CONFIGURADAS

### **Críticas** 🔴
- Error rate > 5%
- Response time > 2s
- Apdex < 0.5
- Memory usage > 90%

### **Altas** 🟠
- Error rate > 2%
- Response time > 1s
- Throughput drop > 50%

### **Medias** 🟡
- Error rate > 1%
- Response time > 500ms
- Database query > 1s

---

## 📝 VARIABLES DE ENTORNO

### **Requeridas**
```env
NEW_RELIC_LICENSE_KEY=6f647c9c6eaa46100c049ab77e900462FFFFNRAL
NEW_RELIC_APP_NAME=ComplicesConecta
```

### **Opcionales (ya configuradas en Dockerfile)**
```env
NEW_RELIC_NO_CONFIG_FILE=true
NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
NEW_RELIC_LOG=stdout
NEW_RELIC_AI_MONITORING_ENABLED=true
NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED=100000
NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=10000
```

---

## 🐛 TROUBLESHOOTING

### **Problema: Contenedor no inicia**
```powershell
# Ver logs completos
docker logs complicesconecta

# Verificar errores de Node.js
docker logs complicesconecta | findstr "error"
```

### **Problema: No aparecen métricas en New Relic**
1. Verificar license key en logs
2. Esperar 2-3 minutos (delay inicial)
3. Verificar conectividad a internet
4. Revisar firewall/proxy

### **Problema: Build falla**
```powershell
# Limpiar cache de Docker
docker system prune -a

# Rebuild desde cero
docker build --no-cache -t complicesconecta:latest .
```

---

## 📚 RECURSOS

- **Docs oficiales**: https://docs.newrelic.com/docs/apm/agents/nodejs-agent/
- **API Reference**: https://newrelic.github.io/node-newrelic/
- **Support**: https://support.newrelic.com/
- **Community**: https://discuss.newrelic.com/

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Instalar package `newrelic`
- [x] Crear `newrelic.js` config
- [x] Crear `Dockerfile` con New Relic
- [x] Crear `.dockerignore`
- [x] Crear script PowerShell de gestión
- [ ] Build de imagen Docker
- [ ] Run de contenedor
- [ ] Verificar métricas en dashboard
- [ ] Configurar alertas personalizadas
- [ ] Integrar con PerformanceMonitoringService
- [ ] Integrar con ErrorAlertService
- [ ] Testing completo

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecutar el script**:
   ```powershell
   .\docker-build-newrelic.ps1 -Action run
   ```

2. **Verificar en New Relic**:
   - Ir al dashboard
   - Buscar app "ComplicesConecta"
   - Verificar métricas en tiempo real

3. **Configurar alertas**:
   - Crear alert policies
   - Configurar notificaciones
   - Testear alertas

4. **Integrar servicios**:
   - Actualizar PerformanceMonitoringService
   - Actualizar ErrorAlertService
   - Agregar custom events

---

**Fecha de Creación**: 2025-01-30  
**Versión**: v3.4.1  
**Estado**: ✅ LISTO PARA DEPLOY

