# 📊 GUÍA DE CONFIGURACIÓN DATADOG - ComplicesConecta v3.4.1

**Fecha:** 30 de Octubre, 2025  
**Versión:** v3.4.1  
**Estado:** ✅ Agent Desplegado | ⏳ Configuración Pendiente  
**Tiempo Estimado:** 30-45 minutos

---

## 🎯 ESTADO ACTUAL

### ✅ Completado

1. **Datadog Agent Desplegado**
   - Container ID: `0ce95e41cc48`
   - Status: Up and Running
   - Ports: 8126/tcp (APM), 8125/udp (StatsD)
   - Dashboard: https://us5.datadoghq.com

2. **Datadog RUM Integrado**
   - Archivo: `src/config/datadog-rum.config.ts`
   - Integrado en: `src/main.tsx`
   - User tracking en: `src/hooks/useAuth.ts`

3. **Features Habilitadas**
   - Infrastructure Monitoring ✅
   - APM (Application Performance Monitoring) ✅
   - Security (AppSec + IAST + SCA + Runtime) ✅
   - Profiling automático ✅
   - Logs con multi-line detection ✅
   - DogStatsD ✅

### ⏳ Pendiente

1. **Configurar Alertas de CPU/RAM/Errors**
2. **Crear Dashboards Personalizados**
3. **Configurar Logs en Tiempo Real**
4. **Verificar Métricas en Dashboard**

---

## 🚀 PASO 1: Configurar Alertas en Datadog (15 min)

### 1.1 Acceder a Datadog

```
1. Ir a: https://us5.datadoghq.com
2. Login con: complicesconectasw@outlook.es
3. Navegar a: Monitors → New Monitor
```

### 1.2 Crear Alerta de CPU

**Monitor Type:** Metric  
**Detection Method:** Threshold Alert

**Configuración:**
```
Metric: system.cpu.user
From: docker_name:dd-agent
Service: complicesconecta
Environment: production
```

**Condiciones:**
```
Alert threshold: > 80%
Warning threshold: > 60%
Evaluation window: 5 minutes
```

**Mensaje:**
```
{{#is_alert}}
🚨 CPU Alta en ComplicesConecta
CPU Usage: {{value}}%
Host: {{host.name}}
Container: {{docker_name.name}}
{{/is_alert}}

{{#is_warning}}
⚠️ CPU Moderada en ComplicesConecta
CPU Usage: {{value}}%
{{/is_warning}}
```

**Notificaciones:**
```
@complicesconectasw@outlook.es
@slack-complicesconecta (si configurado)
@pagerduty (si configurado)
```

### 1.3 Crear Alerta de RAM

**Monitor Type:** Metric  
**Detection Method:** Threshold Alert

**Configuración:**
```
Metric: system.mem.used
From: docker_name:dd-agent
Service: complicesconecta
```

**Condiciones:**
```
Alert threshold: > 90%
Warning threshold: > 75%
Evaluation window: 5 minutes
```

### 1.4 Crear Alerta de Errors

**Monitor Type:** APM  
**Detection Method:** Error Rate

**Configuración:**
```
Service: complicesconecta
Environment: production
Resource: All
Error Rate: > 5%
```

**Condiciones:**
```
Alert threshold: > 5%
Warning threshold: > 2%
Evaluation window: 10 minutes
```

### 1.5 Crear Alerta de Availability

**Monitor Type:** APM  
**Detection Method:** Trace Latency

**Configuración:**
```
Service: complicesconecta
Metric: trace.express.request
p99 latency: > 3000ms
```

---

## 📊 PASO 2: Crear Dashboards Personalizados (15 min)

### 2.1 Dashboard Principal - ComplicesConecta Overview

**Navegar a:** Dashboards → New Dashboard

**Nombre:** `ComplicesConecta - Production Overview`

**Widgets a Agregar:**

#### Widget 1: CPU Usage (Timeseries)
```
Type: Timeseries
Metric: system.cpu.user
Filters: service:complicesconecta
Display: Area chart
```

#### Widget 2: Memory Usage (Timeseries)
```
Type: Timeseries
Metric: system.mem.used
Filters: service:complicesconecta
Display: Area chart
```

#### Widget 3: Request Rate (Timeseries)
```
Type: Timeseries
Metric: trace.express.request.hits
Filters: service:complicesconecta, env:production
Display: Bars
```

#### Widget 4: Error Rate (Timeseries)
```
Type: Timeseries
Metric: trace.express.request.errors
Filters: service:complicesconecta, env:production
Display: Line + Area
```

#### Widget 5: Response Time (Timeseries)
```
Type: Timeseries
Metric: trace.express.request
Aggregation: p99
Filters: service:complicesconecta
Display: Line
```

#### Widget 6: Top Endpoints (Top List)
```
Type: Top List
Metric: trace.express.request.hits
Group by: resource_name
Filters: service:complicesconecta
Limit: 10
```

#### Widget 7: Error Types (Pie Chart)
```
Type: Pie Chart
Metric: trace.express.request.errors
Group by: error.type
Filters: service:complicesconecta
```

#### Widget 8: Active Users (Query Value)
```
Type: Query Value
Metric: browser.rum.session.count
Filters: service:complicesconecta
```

### 2.2 Dashboard de RUM - User Experience

**Nombre:** `ComplicesConecta - User Experience (RUM)`

**Widgets:**

#### Widget 1: Web Vitals Overview (Group)
```
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)
```

#### Widget 2: Session Count (Timeseries)
```
Metric: browser.rum.session.count
Filters: service:complicesconecta
```

#### Widget 3: Page Views (Timeseries)
```
Metric: browser.rum.view.count
Filters: service:complicesconecta
Group by: view.url_path
```

#### Widget 4: JavaScript Errors (Timeseries)
```
Metric: browser.rum.error.count
Filters: service:complicesconecta, error.origin:source
```

#### Widget 5: Top Pages (Top List)
```
Metric: browser.rum.view.count
Group by: view.url_path
Limit: 10
```

### 2.3 Dashboard de Logs - Application Logs

**Nombre:** `ComplicesConecta - Application Logs`

**Widgets:**

#### Widget 1: Log Stream (Log Stream)
```
Query: service:complicesconecta
Columns: timestamp, host, message
Live Tail: Enabled
```

#### Widget 2: Error Logs (Timeseries)
```
Query: service:complicesconecta status:error
Display: Bars
```

#### Widget 3: Log Patterns (Pattern List)
```
Query: service:complicesconecta
Group by: message
```

---

## 📝 PASO 3: Configurar Logs en Tiempo Real (5 min)

### 3.1 Acceder a Live Tail

```
1. Navegar a: Logs → Live Tail
2. Query: service:complicesconecta
3. Click en: Start
```

### 3.2 Filtros Útiles

**Ver solo errores:**
```
service:complicesconecta status:error
```

**Ver logs de autenticación:**
```
service:complicesconecta @message:*auth* OR @message:*login*
```

**Ver logs de API:**
```
service:complicesconecta @http.url_details.path:*/api/*
```

**Ver logs de performance:**
```
service:complicesconecta @message:*performance* OR @message:*metrics*
```

### 3.3 Configurar Indexes

```
1. Navegar a: Logs → Configuration → Indexes
2. Click en: New Index
3. Name: complicesconecta-production
4. Filter: service:complicesconecta env:production
5. Retention: 15 days
6. Save
```

---

## ✅ PASO 4: Verificar Métricas en Dashboard (5 min)

### 4.1 Verificar Agent Status

```bash
# Ver logs del agent
docker logs -f dd-agent

# Buscar confirmaciones
[INFO] Datadog Agent is running
[INFO] API Keys status: OK
[INFO] Hostname: [hostname]
```

### 4.2 Verificar Métricas en UI

```
1. Ir a: Infrastructure → Host Map
2. Buscar: service:complicesconecta
3. Verificar que aparece el host
4. Click en el host para ver detalles
```

**Debe mostrar:**
- ✅ CPU metrics
- ✅ Memory metrics
- ✅ Disk metrics
- ✅ Network metrics
- ✅ Docker containers

### 4.3 Verificar APM Traces

```
1. Ir a: APM → Services
2. Buscar: complicesconecta
3. Verificar que aparece el servicio
4. Click para ver traces
```

**Debe mostrar:**
- ✅ Request rate
- ✅ Error rate
- ✅ Latency (p50, p75, p95, p99)
- ✅ Endpoints list

### 4.4 Verificar RUM Sessions

```
1. Ir a: RUM → Sessions
2. Filter: service:complicesconecta
3. Verificar que aparecen sesiones
```

**Debe mostrar:**
- ✅ Session count
- ✅ Page views
- ✅ User actions
- ✅ Web Vitals

---

## 🔧 COMANDOS ÚTILES

### Docker Commands

```bash
# Ver status del agent
docker ps | grep dd-agent

# Ver logs en tiempo real
docker logs -f dd-agent

# Ver status interno
docker exec -it dd-agent agent status

# Ver configuración
docker exec -it dd-agent agent config

# Restart agent
docker restart dd-agent

# Stop agent
docker stop dd-agent

# Start agent
docker start dd-agent
```

### Agent Status Commands

```bash
# Ver status completo
docker exec -it dd-agent agent status

# Ver solo API keys
docker exec -it dd-agent agent status | grep "API Keys"

# Ver solo checks
docker exec -it dd-agent agent status | grep "Check"

# Ver logs internos
docker exec -it dd-agent agent logs
```

---

## 📊 GUÍA DE DASHBOARDS RECOMENDADOS

### Dashboard 1: Executive Summary
```
- Total Users (Last 24h)
- Total Requests (Last 24h)
- Error Rate (Last 24h)
- Average Response Time
- Top 5 Endpoints
- Top 5 Errors
```

### Dashboard 2: Performance Monitoring
```
- CPU Usage (Timeseries)
- Memory Usage (Timeseries)
- Disk I/O (Timeseries)
- Network I/O (Timeseries)
- Request Throughput (Timeseries)
- Response Time Distribution (Heatmap)
```

### Dashboard 3: User Experience (RUM)
```
- Web Vitals Overview
- Page Load Time by Page
- JavaScript Errors by Page
- User Actions Heatmap
- Session Duration Distribution
- Bounce Rate by Page
```

### Dashboard 4: Security & Errors
```
- Error Rate by Endpoint
- 4xx Errors (Client errors)
- 5xx Errors (Server errors)
- Failed Login Attempts
- Security Events
- Anomaly Detection
```

---

## ⚠️ TROUBLESHOOTING

### Problema 1: No aparecen métricas en Dashboard

**Verificar:**
```bash
# 1. Agent está corriendo
docker ps | grep dd-agent

# 2. Agent está conectado
docker exec -it dd-agent agent status | grep "API Keys"

# 3. Métricas se están enviando
docker logs dd-agent | grep "Sent metrics"
```

**Solución:**
```bash
# Restart agent
docker restart dd-agent

# Esperar 2-3 minutos
# Verificar en UI
```

### Problema 2: Logs no aparecen en Live Tail

**Verificar:**
```bash
# Logs están habilitados
docker exec -it dd-agent agent status | grep "Logs Agent"

# Debe mostrar: Running
```

**Solución:**
```bash
# Verificar configuración
docker exec -it dd-agent agent config | grep logs_enabled

# Si es false, actualizar variable de entorno
docker rm dd-agent
./kubernetes/datadog-docker-run.sh
```

### Problema 3: APM Traces no aparecen

**Verificar:**
```bash
# APM está habilitado
docker exec -it dd-agent agent status | grep "APM Agent"

# Puerto 8126 está expuesto
docker ps | grep 8126
```

**Solución:**
```bash
# Verificar que la app envía traces
# En server.js debe tener:
require('newrelic'); // O configuración APM

# Verificar puerto en docker run
-p 8126:8126/tcp
```

---

## 🎯 CHECKLIST FINAL

### Configuración Básica ✅
- [x] Datadog Agent desplegado
- [x] Agent conectado a Datadog
- [x] Métricas visibles en Infrastructure
- [ ] Alertas configuradas (CPU, RAM, Errors)
- [ ] Dashboards creados (3 mínimo)
- [ ] Logs configurados y visibles

### RUM (Real User Monitoring) ✅
- [x] RUM integrado en código
- [x] Sessions tracking habilitado
- [x] User tracking en login/logout
- [ ] Sessions visibles en Dashboard
- [ ] Web Vitals aparecen
- [ ] JavaScript errors capturados

### APM (Application Performance) ⏳
- [x] APM habilitado en agent
- [x] Puerto 8126 expuesto
- [ ] Traces visibles en Dashboard
- [ ] Endpoints listados
- [ ] Latency metrics aparecen
- [ ] Error tracking funciona

### Logs ⏳
- [x] Logs habilitados en agent
- [ ] Logs visibles en Live Tail
- [ ] Indexes configurados
- [ ] Patterns detectados
- [ ] Log queries funcionan

### Alertas ⏳
- [ ] CPU alert creada
- [ ] RAM alert creada
- [ ] Error rate alert creada
- [ ] Latency alert creada
- [ ] Notificaciones configuradas
- [ ] Test de alertas exitoso

### Dashboards ⏳
- [ ] Dashboard principal creado
- [ ] Dashboard RUM creado
- [ ] Dashboard logs creado
- [ ] Widgets funcionando
- [ ] Queries correctas
- [ ] Auto-refresh configurado

---

## 📚 RECURSOS ADICIONALES

### Documentación Datadog

- **Getting Started**: https://docs.datadoghq.com/getting_started/
- **APM Setup**: https://docs.datadoghq.com/tracing/setup_overview/
- **RUM Setup**: https://docs.datadoghq.com/real_user_monitoring/browser/
- **Logs Setup**: https://docs.datadoghq.com/logs/
- **Monitors**: https://docs.datadoghq.com/monitors/
- **Dashboards**: https://docs.datadoghq.com/dashboards/

### Tutoriales en Video

- **Datadog 101**: https://learn.datadoghq.com/
- **Creating Monitors**: https://www.youtube.com/datadoghq
- **Building Dashboards**: https://www.youtube.com/datadoghq

---

## 🎉 CONCLUSIÓN

**Tiempo Estimado Total:** 30-45 minutos

**Pasos Completados:**
- ✅ Datadog Agent desplegado
- ✅ Datadog RUM integrado
- ⏳ Alertas por configurar (15 min)
- ⏳ Dashboards por crear (15 min)
- ⏳ Logs por configurar (5 min)
- ⏳ Verificación final (5 min)

**Resultado Esperado:**
- Dashboard completo con métricas en tiempo real
- Alertas automáticas para CPU/RAM/Errors
- Logs visibles y configurados
- RUM tracking de usuarios
- APM monitoring de aplicación

**Estado al Completar:** ✅ **MONITORING COMPLETO - ENTERPRISE GRADE**

---

**Última Actualización**: 30 de Octubre, 2025  
**Versión**: v3.4.1  
**Autor**: Equipo ComplicesConecta  
**Contacto**: complicesconectasw@outlook.es

---

*Guía de configuración de Datadog para ComplicesConecta v3.4.1*

