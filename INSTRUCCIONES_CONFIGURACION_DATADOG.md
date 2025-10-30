# 🎯 INSTRUCCIONES PASO A PASO - Configuración Datadog

**Fecha:** 30 de Octubre, 2025  
**Usuario:** complicesconectasw@outlook.es  
**Dashboard:** https://us5.datadoghq.com  
**Tiempo Estimado:** 30-45 minutos

---

## ✅ VERIFICACIÓN PREVIA

### Estado Actual:
- ✅ Datadog Agent: Desplegado (Container ID: 0ce95e41cc48)
- ✅ Datadog RUM: Integrado en código
- ✅ API Key: 316e57de13f5435f8d49c484a61c6757
- ✅ Service: complicesconecta
- ✅ Environment: production

### Verificar Agent:
```powershell
# Ver status del contenedor
docker ps | grep dd-agent

# Ver logs
docker logs -f dd-agent | Select-Object -First 50

# Buscar confirmación
# Debe mostrar: "Datadog Agent is running"
```

---

## 🚨 TAREA 1: CONFIGURAR ALERTAS (15 minutos)

### Paso 1.1: Acceder a Datadog

1. **Abrir navegador**: https://us5.datadoghq.com
2. **Login**: `complicesconectasw@outlook.es` (usar contraseña de Outlook)
3. **Esperar**: Página principal de Datadog se carga

### Paso 1.2: Crear Monitor de CPU

1. **Navegar**: 
   - Click en menú lateral izquierdo → **"Monitors"**
   - Click en botón **"+ New Monitor"** (esquina superior derecha)

2. **Seleccionar tipo**:
   - Click en **"Metric"**

3. **Configurar Detection Method**:
   - Select: **"Threshold Alert"**

4. **Define the metric** (Sección A):
   ```
   Metric: system.cpu.user
   from: docker_name:dd-agent
   
   O alternativamente:
   Metric: system.cpu.user
   from: service:complicesconecta
   ```

5. **Set alert conditions** (Sección B):
   ```
   Alert threshold: 80
   Warning threshold: 60
   
   Evaluate the query over the last: 5 minutes
   ```

6. **Configure notifications** (Sección C):
   ```
   Monitor name: [ComplicesConecta] CPU Usage Alta
   
   Message:
   {{#is_alert}}
   🚨 **ALERTA CRÍTICA**: CPU Usage muy alta en ComplicesConecta
   
   **Valor actual**: {{value}}%
   **Umbral**: 80%
   **Host**: {{host.name}}
   **Service**: {{service.name}}
   
   **Acción requerida**: Revisar procesos consumiendo CPU
   {{/is_alert}}
   
   {{#is_warning}}
   ⚠️ **ADVERTENCIA**: CPU Usage moderada en ComplicesConecta
   
   **Valor actual**: {{value}}%
   **Umbral**: 60%
   
   **Monitorear**: Puede escalar a crítico
   {{/is_warning}}
   
   Notify: @complicesconectasw@outlook.es
   ```

7. **Save**: Click en **"Create"** (esquina inferior derecha)

### Paso 1.3: Crear Monitor de RAM

1. **Repetir pasos anteriores** pero con:
   ```
   Monitor Type: Metric → Threshold Alert
   
   Metric: system.mem.pct_usable
   from: service:complicesconecta
   
   Alert threshold: 10  (10% libre = 90% usado)
   Warning threshold: 25 (25% libre = 75% usado)
   
   Evaluate: 5 minutes
   
   Monitor name: [ComplicesConecta] Memory Usage Alta
   
   Message:
   {{#is_alert}}
   🚨 **ALERTA CRÍTICA**: Memoria casi agotada en ComplicesConecta
   
   **Memoria libre**: {{value}}%
   **Umbral crítico**: 10% libre
   **Host**: {{host.name}}
   
   **Acción INMEDIATA**: Revisar memory leaks o aumentar recursos
   {{/is_alert}}
   
   Notify: @complicesconectasw@outlook.es
   ```

### Paso 1.4: Crear Monitor de Error Rate

1. **Navegar**: Monitors → + New Monitor
2. **Seleccionar**: **"APM"** (NO Metric)
3. **Configurar**:
   ```
   Monitor Type: APM
   Detection Method: Error Rate
   
   Service: complicesconecta
   Environment: production
   Resource: All
   
   Alert threshold: 5%
   Warning threshold: 2%
   
   Evaluate: 10 minutes
   
   Monitor name: [ComplicesConecta] Error Rate Alta
   
   Message:
   {{#is_alert}}
   🚨 **ALERTA**: Tasa de errores muy alta en ComplicesConecta
   
   **Error Rate**: {{value}}%
   **Umbral**: 5%
   **Service**: {{service.name}}
   **Environment**: {{env.name}}
   
   **Revisar**: Dashboard de errores y logs inmediatamente
   {{/is_alert}}
   
   Notify: @complicesconectasw@outlook.es
   ```

---

## 📊 TAREA 2: CREAR DASHBOARDS (15 minutos)

### Paso 2.1: Dashboard Principal - Production Overview

1. **Navegar**:
   - Click en menú lateral → **"Dashboards"**
   - Click en **"+ New Dashboard"** (esquina superior derecha)

2. **Configurar Dashboard**:
   ```
   Dashboard Name: ComplicesConecta - Production Overview
   Description: Dashboard principal para monitoreo en tiempo real
   ```

3. **Agregar Widgets** (Click en **"Add Widgets"**):

#### Widget 1: CPU Usage
```
Type: Timeseries
Title: CPU Usage

Query:
- Metric: system.cpu.user
- From: service:complicesconecta
- Display as: Area

Visualization:
- Display: Area chart
- Color: Blue gradient
```

#### Widget 2: Memory Usage
```
Type: Timeseries
Title: Memory Usage

Query:
- Metric: system.mem.used
- From: service:complicesconecta
- Display as: Area

Visualization:
- Display: Area chart
- Color: Green gradient
```

#### Widget 3: Request Rate
```
Type: Query Value
Title: Requests/min (Last 5m)

Query:
- Metric: trace.express.request.hits
- From: service:complicesconecta, env:production
- Function: sum
- Timeframe: Past 5 minutes

Display:
- Show comparison: Previous period
```

#### Widget 4: Error Count
```
Type: Query Value
Title: Errors (Last 1h)

Query:
- Metric: trace.express.request.errors
- From: service:complicesconecta, env:production
- Function: sum
- Timeframe: Past 1 hour

Display:
- Conditional formatting: Red if > 10
```

#### Widget 5: Response Time
```
Type: Timeseries
Title: Response Time (p99)

Query:
- Metric: trace.express.request
- From: service:complicesconecta
- Aggregation: p99
- Display as: Line

Visualization:
- Display: Line chart
- Color: Orange
- Y-axis: Milliseconds
```

4. **Organizar Layout**:
   - Drag & drop widgets para ordenar
   - Resize según preferencia
   - Top row: CPU + Memory
   - Middle row: Requests + Errors
   - Bottom row: Response Time

5. **Guardar**: Click en **"Save"** (esquina superior derecha)

### Paso 2.2: Dashboard de RUM - User Experience

1. **Crear Nuevo Dashboard**:
   ```
   Name: ComplicesConecta - User Experience (RUM)
   Description: Monitoreo de experiencia de usuario
   ```

2. **Agregar Widgets RUM**:

#### Widget 1: Web Vitals
```
Type: Group Widget (contiene 5 sub-widgets)
Title: Web Vitals Overview

Sub-widgets (Query Value cada uno):
1. LCP: browser.rum.long_task.longest_duration
2. FCP: browser.rum.view.first_contentful_paint
3. FID: browser.rum.action.loading_time
4. CLS: browser.rum.view.cumulative_layout_shift
5. TTFB: browser.rum.view.time_to_first_byte

Filters: service:complicesconecta
Aggregation: p75
```

#### Widget 2: Active Sessions
```
Type: Query Value
Title: Active Sessions (Now)

Query:
- Metric: browser.rum.session.count
- From: service:complicesconecta
- Timeframe: Past 5 minutes
```

#### Widget 3: Page Views
```
Type: Timeseries
Title: Page Views by Path

Query:
- Metric: browser.rum.view.count
- From: service:complicesconecta
- Group by: view.url_path
- Display as: Line
```

3. **Guardar Dashboard**

### Paso 2.3: Dashboard de Logs

1. **Crear Nuevo Dashboard**:
   ```
   Name: ComplicesConecta - Application Logs
   Description: Logs en tiempo real y análisis
   ```

2. **Agregar Widgets de Logs**:

#### Widget 1: Log Stream
```
Type: Log Stream
Title: Latest Logs

Query: service:complicesconecta
Columns: timestamp, status, message
Live Tail: Enabled
```

#### Widget 2: Error Logs Timeline
```
Type: Timeseries
Title: Error Logs Over Time

Query: service:complicesconecta status:error
Display: Bars
Color: Red
```

3. **Guardar Dashboard**

---

## 📝 TAREA 3: CONFIGURAR LOGS EN TIEMPO REAL (5 minutos)

### Paso 3.1: Acceder a Live Tail

1. **Navegar**:
   - Menu lateral → **"Logs"**
   - Click en **"Live Tail"** (tab superior)

2. **Configurar Query**:
   ```
   Query: service:complicesconecta
   
   Opcional - Agregar filtros:
   - status:error (solo errores)
   - @http.status_code:[500 TO 599] (errores 5xx)
   - @message:*performance* (logs de performance)
   ```

3. **Click en "Play"** (botón verde)
   - Los logs empezarán a fluir en tiempo real

### Paso 3.2: Crear Index para Retención

1. **Navegar**: Logs → Configuration → Indexes

2. **Crear Index**:
   ```
   Click: "+ New Index"
   
   Index Name: complicesconecta-production
   Filter Query: service:complicesconecta AND env:production
   Retention: 15 days
   
   Click: "Create"
   ```

### Paso 3.3: Configurar Facets (Opcional)

1. **En Live Tail**, click en campo interesante (ej: `@http.status_code`)
2. **Click**: "Add to facets"
3. **Configure**: 
   ```
   Facet Name: HTTP Status Code
   Path: @http.status_code
   Type: Integer
   ```

---

## ✅ VERIFICACIÓN DE CONFIGURACIÓN

### Checklist de Alertas
```powershell
# En Datadog UI, verificar:
□ Monitor "CPU Usage Alta" - Creado
□ Monitor "Memory Usage Alta" - Creado
□ Monitor "Error Rate Alta" - Creado
□ Email notifications configuradas
□ Test enviado exitosamente
```

### Checklist de Dashboards
```powershell
# En Datadog UI, verificar:
□ Dashboard "Production Overview" - Creado
□ Dashboard "User Experience (RUM)" - Creado
□ Dashboard "Application Logs" - Creado
□ Widgets mostrando datos
□ Auto-refresh habilitado
```

### Checklist de Logs
```powershell
# En Datadog UI, verificar:
□ Live Tail funcionando
□ Logs aparecen en tiempo real
□ Index "complicesconecta-production" creado
□ Filtros funcionando correctamente
```

---

## 🔧 TROUBLESHOOTING

### Problema: No aparecen métricas en Dashboard

**Solución:**
```powershell
# 1. Verificar que Agent está enviando métricas
docker exec -it dd-agent agent status | Select-String "Running Checks"

# 2. Verificar conectividad
docker logs dd-agent | Select-String "metrics sent"

# 3. Esperar 2-3 minutos
# Las métricas pueden tardar en aparecer
```

### Problema: Alertas no se envían

**Verificar:**
1. En Monitor → Settings → Verify email: `complicesconectasw@outlook.es`
2. Check spam folder en Outlook
3. Test alert manually: En monitor → "Test Notifications"

### Problema: Live Tail no muestra logs

**Verificar:**
```powershell
# 1. Logs habilitados en Agent
docker exec -it dd-agent agent status | Select-String "Logs Agent"

# 2. Debe mostrar "Running"
# Si no, verificar variables de entorno:
docker inspect dd-agent | Select-String "DD_LOGS_ENABLED"

# 3. Debe ser "true"
```

---

## 📸 CAPTURAS RECOMENDADAS

### Para Documentación:
1. Dashboard "Production Overview" completo
2. Monitor "CPU Usage" configurado
3. Live Tail mostrando logs
4. Lista de Monitors activos

### Guardar en:
```
docs-unified/screenshots/datadog/
├── dashboard-overview.png
├── monitor-cpu.png
├── live-tail.png
└── monitors-list.png
```

---

## 🎯 RESULTADO ESPERADO

Al completar todas las tareas:

```
✅ Datadog Agent: Running
✅ Alertas Configuradas: 3 (CPU, RAM, Error Rate)
✅ Dashboards Creados: 3 (Overview, RUM, Logs)
✅ Live Tail: Funcionando
✅ Notifications: Email configurado
✅ Métricas: Visibles en tiempo real
✅ Estado: MONITORING COMPLETO
```

---

## 📞 SOPORTE

**Si encuentras problemas:**
1. Revisar logs del Agent: `docker logs dd-agent`
2. Verificar status: `docker exec -it dd-agent agent status`
3. Consultar: https://docs.datadoghq.com/
4. Contacto: support@datadoghq.com

---

**Tiempo Total Estimado:** 35 minutos  
**Última Actualización:** 30 de Octubre, 2025  
**Versión:** v3.4.1

---

*Instrucciones detalladas para configuración de Datadog*

