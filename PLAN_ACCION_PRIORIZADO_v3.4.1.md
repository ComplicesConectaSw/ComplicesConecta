# 🎯 Plan de Acción Priorizado - ComplicesConecta v3.4.1
**Fecha**: 2025-01-30  
**Progreso Actual**: 68%  
**Meta**: 100%

---

## 📋 ÍNDICE DE PRIORIDADES

- **🔴 ALTA PRIORIDAD**: Tareas críticas que desbloquean funcionalidades core (30-90 min cada una)
- **🟡 MEDIA PRIORIDAD**: Mejoras importantes pero no bloqueantes (2-6 horas cada una)
- **🟢 BAJA PRIORIDAD**: Optimizaciones y features avanzados (10-20 días cada uno)

---

# 🔴 ALTA PRIORIDAD (Completar Primero)

## **TAREA 1: Corregir Build de Docker** ⚠️
**Estado**: 🔴 BLOQUEADO  
**Tiempo estimado**: 15-20 minutos  
**Dependencias**: Ninguna  
**Prioridad**: CRÍTICA

### **Problema Actual**
```
ERROR: npm ci --only=production failed
ERESOLVE could not resolve @types/react-dom@19.2.2
Conflicting peer dependency: @types/react@19.2.2
```

### **Solución Aplicada**
✅ Dockerfile actualizado con `--legacy-peer-deps --omit=dev`

### **Pasos de Verificación**
```powershell
# 1. Limpiar cache de Docker
docker system prune -a --volumes

# 2. Build desde cero
docker build --no-cache -t complicesconecta:latest .

# 3. Verificar éxito
# Esperado: "Successfully tagged complicesconecta:latest"
```

### **Si Persiste el Error**
```powershell
# Opción A: Actualizar dependencias localmente
npm install --legacy-peer-deps

# Opción B: Usar npm install en vez de npm ci
# Modificar Dockerfile línea 18:
# RUN npm install --legacy-peer-deps --omit=dev
```

### **Resultado Esperado**
✅ Imagen Docker construida exitosamente  
✅ Sin errores de dependencias  
✅ Build completo en ~3-5 minutos

---

## **TAREA 2: Deploy Contenedor Docker con New Relic** 🚀
**Estado**: ⏳ PENDIENTE (bloqueado por Tarea 1)  
**Tiempo estimado**: 10-15 minutos  
**Dependencias**: Tarea 1 completada  
**Prioridad**: ALTA

### **Comandos**
```powershell
# Opción 1: Script automatizado
.\docker-build-newrelic.ps1 -Action run

# Opción 2: Manual
docker run -d \
  --name complicesconecta \
  -p 3000:3000 \
  -e NEW_RELIC_LICENSE_KEY=6f647c9c6eaa46100c049ab77e900462FFFFNRAL \
  -e NEW_RELIC_APP_NAME="ComplicesConecta" \
  complicesconecta:latest

# Ver logs en tiempo real
docker logs -f complicesconecta
```

### **Verificación**
```powershell
# 1. Verificar contenedor corriendo
docker ps | findstr complicesconecta

# 2. Verificar health check
curl http://localhost:3000/health

# 3. Verificar New Relic en logs
docker logs complicesconecta | findstr "New Relic"
```

### **Logs Esperados**
```
================================================
  ComplicesConecta Server
================================================
✅ Server running on http://localhost:3000
✅ Environment: production
✅ New Relic: ComplicesConecta
New Relic for Node.js is running in agent mode.
Agent state changed from stopped to started
Reporting to: https://rpm.newrelic.com/accounts/7299297/applications/...
```

### **Resultado Esperado**
✅ Contenedor corriendo en puerto 3000  
✅ New Relic agent activo  
✅ Health check respondiendo  
✅ App accesible en http://localhost:3000

---

## **TAREA 3: Verificar Métricas en New Relic Dashboard** 📊
**Estado**: ⏳ PENDIENTE (bloqueado por Tarea 2)  
**Tiempo estimado**: 10-15 minutos  
**Dependencias**: Tarea 2 completada  
**Prioridad**: ALTA

### **Pasos**
1. **Acceder al Dashboard**
   - URL: https://one.newrelic.com/nr1-core?account=7299297
   - Login con cuenta New Relic
   - Click en "APM" (menú izquierdo)

2. **Buscar Aplicación**
   - Buscar "ComplicesConecta"
   - Debe aparecer en la lista de aplicaciones

3. **Generar Tráfico de Prueba**
   ```powershell
   # Terminal 1: Abrir navegador
   Start-Process http://localhost:3000
   
   # Terminal 2: Generar requests
   for ($i=1; $i -le 20; $i++) {
     curl http://localhost:3000
     curl http://localhost:3000/health
     curl http://localhost:3000/api/status
     Start-Sleep -Seconds 1
   }
   ```

4. **Verificar Métricas**
   - Response time (debe aparecer en gráfico)
   - Throughput (requests/min)
   - Error rate (debe ser 0%)
   - Apdex score

### **Tiempo de Espera**
⏱️ Esperar 2-3 minutos para que aparezcan las primeras métricas

### **Si No Aparecen Métricas**
- Verificar logs: `docker logs complicesconecta | findstr "New Relic"`
- Verificar license key es correcta
- Verificar conectividad a internet
- Reiniciar contenedor: `docker restart complicesconecta`

### **Resultado Esperado**
✅ App "ComplicesConecta" visible en dashboard  
✅ Métricas en tiempo real  
✅ Transaction traces disponibles  
✅ Sin errores reportados

---

## **TAREA 4: Integrar PerformanceMonitoringService con New Relic** 🔗
**Estado**: ⏳ PENDIENTE  
**Tiempo estimado**: 20-30 minutos  
**Dependencias**: Tarea 3 completada  
**Prioridad**: ALTA

### **Archivo 1: PerformanceMonitoringService.ts**

**Ubicación**: `src/services/PerformanceMonitoringService.ts`

**Cambios**:
```typescript
// 1. Agregar import al inicio del archivo
import newrelic from 'newrelic';

// 2. Modificar método recordMetric (agregar al final del método)
recordMetric(metric: PerformanceMetric): void {
  // ... código existente ...
  
  // Persistir en DB
  this.persistMetricToDB(metric);
  
  // NUEVO: Enviar a New Relic
  try {
    if (typeof newrelic !== 'undefined' && newrelic.recordCustomEvent) {
      newrelic.recordCustomEvent('PerformanceMetric', {
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        category: metric.category,
        timestamp: metric.timestamp.toISOString(),
        ...metric.metadata
      });
    }
  } catch (error) {
    console.error('Failed to send metric to New Relic:', error);
  }
}

// 3. Modificar método generateReport (agregar al final del método)
generateReport(hours: number): PerformanceReport {
  // ... código existente ...
  const report = // ... generación del reporte ...
  
  // NUEVO: Enviar resumen a New Relic
  try {
    if (typeof newrelic !== 'undefined' && newrelic.recordCustomEvent) {
      newrelic.recordCustomEvent('PerformanceReport', {
        period: `${hours}h`,
        totalMetrics: report.metrics.length,
        totalAlerts: report.alerts.length,
        averageLoad: report.summary.averageLoad || 0,
        averageInteraction: report.summary.averageInteraction || 0,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Failed to send report to New Relic:', error);
  }
  
  return report;
}
```

### **Archivo 2: ErrorAlertService.ts**

**Ubicación**: `src/services/ErrorAlertService.ts`

**Cambios**:
```typescript
// 1. Agregar import al inicio del archivo
import newrelic from 'newrelic';

// 2. Modificar método createAlert (agregar antes de guardar en DB)
createAlert(alert: Omit<ErrorAlert, 'id' | 'timestamp' | 'resolved'>): void {
  // ... código existente ...
  
  // NUEVO: Enviar a New Relic
  try {
    if (typeof newrelic !== 'undefined') {
      // Registrar como error
      if (newrelic.noticeError) {
        newrelic.noticeError(new Error(alert.message), {
          severity: alert.severity,
          category: alert.category,
          component: alert.component,
          userId: alert.userId,
          stack: alert.stack || 'No stack trace available'
        });
      }
      
      // Registrar como custom event
      if (newrelic.recordCustomEvent) {
        newrelic.recordCustomEvent('ErrorAlert', {
          severity: alert.severity,
          category: alert.category,
          message: alert.message,
          component: alert.component,
          userId: alert.userId,
          timestamp: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Failed to send alert to New Relic:', error);
  }
  
  // ... continuar con código existente (guardar en DB, etc)
}
```

### **Testing**
```typescript
// En el navegador (console):

// Test 1: Métrica de performance
performanceMonitoring.recordMetric({
  name: 'test_metric_newrelic',
  value: 123,
  unit: 'ms',
  category: 'custom',
  timestamp: new Date()
});

// Test 2: Error alert
errorAlertService.createAlert({
  message: 'Test error para New Relic',
  severity: 'high',
  category: 'test',
  component: 'Console'
});

// Test 3: Generar reporte
const report = performanceMonitoring.generateReport(1);
console.log('Report generated:', report);
```

### **Verificación en New Relic**
1. Ir a dashboard
2. Click en "Query your data"
3. Ejecutar query:
   ```sql
   SELECT * FROM PerformanceMetric 
   WHERE name = 'test_metric_newrelic' 
   SINCE 10 minutes ago
   ```
4. Verificar aparece el evento

### **Resultado Esperado**
✅ Métricas enviándose a New Relic  
✅ Errores reportándose correctamente  
✅ Custom events visibles en dashboard  
✅ Query de prueba devuelve resultados

---

## **TAREA 5: Corregir Test realtime-chat.test.ts** 🧪
**Estado**: ⏳ PENDIENTE  
**Tiempo estimado**: 5-10 minutos  
**Dependencias**: Ninguna  
**Prioridad**: ALTA

### **Problema**
Test `should handle realtime subscriptions` no está usando correctamente el mock.

### **Solución Aplicada**
✅ Variable `channel` declarada correctamente  
✅ Mock de `subscribe` agregado al objeto `mockChannel`

### **Verificación**
```powershell
# Ejecutar solo este test
npm test -- realtime-chat.test.ts

# Ejecutar todos los tests
npm test
```

### **Resultado Esperado**
✅ Test `realtime-chat.test.ts` pasando al 100%  
✅ 0 tests fallidos

---

# 🟡 MEDIA PRIORIDAD (Después de Alta)

## **TAREA 6: Gráficos Históricos con Recharts** 📈
**Estado**: 🟡 READY  
**Tiempo estimado**: 4-6 horas  
**Dependencias**: Recharts ya instalado  
**Prioridad**: MEDIA

### **Objetivo**
Crear componentes de visualización avanzada con datos históricos de performance y errores.

### **Componentes a Crear**

#### **1. HistoricalCharts.tsx** (2 horas)
**Ubicación**: `src/components/admin/HistoricalCharts.tsx`

**Features**:
- Line Chart (tendencias en el tiempo)
- Area Chart (distribución por categoría)
- Bar Chart (resumen por período)
- Filtros de tiempo (día, semana, mes)
- Filtros de tipo (performance, errors, webVitals)
- Responsive design
- Loading states
- Empty states

**Gráficos**:
```typescript
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
```

#### **2. Integración en AnalyticsDashboard** (1 hora)
**Ubicación**: `src/components/admin/AnalyticsDashboard.tsx`

**Cambios**:
- Agregar nuevo tab "Histórico"
- Importar `HistoricalCharts`
- Renderizar en tab condicional

#### **3. Optimizaciones** (1-2 horas)
- Agregación de datos por hora/día (reduce queries)
- Cache de consultas pesadas
- Lazy loading de gráficos
- Export de gráficos como imagen (PNG)
- Zoom y pan interactivo
- Tooltips personalizados

#### **4. Testing** (30 min)
- Test de renderizado
- Test de filtros
- Test de loading states
- Test de interacciones

### **Queries Necesarias**
```typescript
// Performance metrics
const { data } = await supabase
  .from('performance_metrics')
  .select('timestamp, value, category, name')
  .gte('timestamp', since)
  .order('timestamp', { ascending: true });

// Error alerts
const { data } = await supabase
  .from('error_alerts')
  .select('timestamp, severity, category, message')
  .gte('timestamp', since)
  .order('timestamp', { ascending: true });

// Web vitals
const { data } = await supabase
  .from('web_vitals_history')
  .select('timestamp, metric_name, value')
  .gte('timestamp', since)
  .order('timestamp', { ascending: true });
```

### **Resultado Esperado**
✅ 3 tipos de gráficos funcionando  
✅ Filtros de tiempo operativos  
✅ Carga de datos desde Supabase  
✅ Responsive y performante  
✅ Integrado en dashboard

---

## **TAREA 7: Sistema de Webhooks** 🔗
**Estado**: 🟡 READY  
**Tiempo estimado**: 2-3 horas  
**Dependencias**: Ninguna  
**Prioridad**: MEDIA

### **Objetivo**
Crear sistema de notificaciones vía webhooks para Slack/Discord cuando ocurran eventos importantes.

### **Componentes a Crear**

#### **1. WebhookService.ts** (1 hora)
**Ubicación**: `src/services/WebhookService.ts`

**Features**:
- Configuración múltiple de webhooks
- Retry logic con exponential backoff
- Timeout configurable
- Filtrado por tipo de evento
- Logging de intentos
- Queue de mensajes pendientes

**Eventos Soportados**:
- `error.critical` - Error crítico ocurrió
- `error.high` - Error alto ocurrió
- `performance.degradation` - Performance degradada >50%
- `performance.restored` - Performance restaurada
- `alert.created` - Nueva alerta creada
- `alert.resolved` - Alerta resuelta
- `metric.threshold` - Métrica superó umbral

**Integraciones**:
- Slack (via Incoming Webhooks)
- Discord (via Webhooks)
- Generic HTTP endpoints

#### **2. WebhookConfigPanel.tsx** (1 hora)
**Ubicación**: `src/components/admin/WebhookConfigPanel.tsx`

**Features**:
- Agregar/Editar/Eliminar webhooks
- Habilitar/Deshabilitar individualmente
- Seleccionar eventos a escuchar
- Configurar retry attempts
- Configurar timeout
- Test webhook (enviar mensaje de prueba)
- Ver histórico de envíos

#### **3. Integración con Servicios** (30 min)
**Archivos**:
- `ErrorAlertService.ts` - Llamar webhook en `createAlert()`
- `PerformanceMonitoringService.ts` - Llamar webhook en degradación

#### **4. Persistencia** (30 min)
**Tabla**: `webhook_configs`
```sql
CREATE TABLE webhook_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  events TEXT[] NOT NULL,
  retry_attempts INTEGER DEFAULT 3,
  timeout INTEGER DEFAULT 5000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhook_configs(id),
  event TEXT NOT NULL,
  payload JSONB,
  status TEXT, -- 'success', 'failed', 'pending'
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Payload Format (Slack)**
```json
{
  "text": "🔴 Error Crítico",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Error Crítico en ComplicesConecta"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Severidad:* Crítica"
        },
        {
          "type": "mrkdwn",
          "text": "*Componente:* UserService"
        },
        {
          "type": "mrkdwn",
          "text": "*Mensaje:* Failed to fetch user data"
        },
        {
          "type": "mrkdwn",
          "text": "*Timestamp:* 2025-01-30 10:30:00"
        }
      ]
    }
  ]
}
```

### **Testing**
```typescript
// Test manual en consola
const webhook = new WebhookService();
webhook.addConfig({
  name: 'Slack Test',
  url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  enabled: true,
  events: ['error.critical', 'error.high'],
  retryAttempts: 3,
  timeout: 5000
});

await webhook.send('error.critical', {
  message: 'Test error',
  severity: 'critical',
  component: 'Test'
});
```

### **Resultado Esperado**
✅ WebhookService funcional  
✅ UI de configuración operativa  
✅ Integración con Slack/Discord  
✅ Retry logic funcionando  
✅ Logs de webhooks guardados

---

## **TAREA 8: Configurar Alertas en New Relic** 🚨
**Estado**: 🟡 READY  
**Tiempo estimado**: 30-45 minutos  
**Dependencias**: Tarea 3 completada  
**Prioridad**: MEDIA

### **Objetivo**
Configurar alertas automáticas en New Relic para notificar sobre problemas críticos.

### **Alert Policies a Crear**

#### **1. Policy Crítica** 🔴
**Condiciones**:
- Error rate > 5% durante 5 minutos
- Response time > 2000ms durante 5 minutos
- Apdex score < 0.5 durante 5 minutos
- Memory usage > 90% durante 2 minutos

**Notificaciones**:
- Email inmediato
- Slack (webhook)
- PagerDuty (opcional)

#### **2. Policy Alta** 🟠
**Condiciones**:
- Error rate > 2% durante 10 minutos
- Response time > 1000ms durante 10 minutos
- Throughput drop > 50% durante 5 minutos
- CPU usage > 80% durante 5 minutos

**Notificaciones**:
- Email
- Slack

#### **3. Policy Media** 🟡
**Condiciones**:
- Error rate > 1% durante 15 minutos
- Response time > 500ms durante 15 minutos
- Database query > 1000ms
- Custom event count anomaly

**Notificaciones**:
- Dashboard notification
- Email daily digest

### **Pasos en New Relic**
1. Ir a "Alerts & AI" → "Alert policies"
2. Click "Create alert policy"
3. Nombre: "ComplicesConecta - Critical"
4. Incident preference: "By condition"
5. Agregar condiciones
6. Configurar notification channels
7. Guardar

### **Notification Channels**
```
Email: tu-email@ejemplo.com
Slack: #complices-alerts
```

### **Resultado Esperado**
✅ 3 alert policies creadas  
✅ Condiciones configuradas  
✅ Notificaciones habilitadas  
✅ Test de alertas exitoso

---

## **TAREA 9: Refinar Dashboard de Analytics** 🎨
**Estado**: 🟡 READY  
**Tiempo estimado**: 3-4 horas  
**Dependencias**: Ninguna  
**Prioridad**: MEDIA

### **Mejoras UI/UX**

#### **1. Organización de Tabs** (1 hora)
**Tabs Actuales**:
- Overview
- Configuración

**Tabs Propuestos**:
- 📊 Overview (resumen general)
- 📈 Performance (métricas de performance)
- 🐛 Errors (alertas y errores)
- 📉 Histórico (gráficos avanzados) - NUEVO
- ⚙️ Configuración (alertas + webhooks + notificaciones)

#### **2. Cards Mejorados** (1 hora)
- Agregar sparklines (mini gráficos en cards)
- Indicadores de tendencia (↑↓)
- Comparación con período anterior
- Color coding por severidad
- Tooltips informativos

#### **3. Filtros Globales** (30 min)
- Date range picker
- Filtro por categoría
- Filtro por severidad
- Búsqueda de errores

#### **4. Export/Share** (30 min)
- Compartir dashboard via link
- Generar PDF del dashboard
- Schedule de reportes automáticos

#### **5. Dark Mode Refinement** (1 hora)
- Mejorar contraste
- Ajustar colores de gráficos
- Iconos consistentes
- Transiciones suaves

### **Resultado Esperado**
✅ Dashboard más intuitivo  
✅ Mejor organización visual  
✅ Filtros funcionando  
✅ Export operativo  
✅ Dark mode perfecto

---

# 🟢 BAJA PRIORIDAD (Largo Plazo)

## **TAREA 10: Machine Learning para Detección de Anomalías** 🤖
**Estado**: 🟢 PLANIFICADO  
**Tiempo estimado**: 15-20 días  
**Dependencias**: Datos históricos (>1 mes)  
**Prioridad**: BAJA

### **Objetivo**
Implementar sistema de ML para predecir y detectar anomalías en performance y uso.

### **Features**
- Detección automática de patrones anormales
- Predicción de degradación de performance
- Clasificación automática de errores
- Alertas proactivas antes de problemas
- Recomendaciones de optimización

### **Tecnologías**
- TensorFlow.js
- Anomaly Detection algorithms
- Time series forecasting

### **Fases**
1. Recolección de datos (1-2 meses)
2. Feature engineering (1 semana)
3. Entrenamiento de modelos (2 semanas)
4. Integración (1 semana)
5. Testing y ajuste (1 semana)

---

## **TAREA 11: Dashboard Móvil Nativo** 📱
**Estado**: 🟢 PLANIFICADO  
**Tiempo estimado**: 10-15 días  
**Dependencias**: Ninguna  
**Prioridad**: BAJA

### **Objetivo**
Crear app móvil para monitoreo desde dispositivos móviles.

### **Features**
- Dashboard adaptado a móvil
- Push notifications nativas
- Offline mode
- Touch gestures
- Shortcuts

### **Tecnologías**
- PWA + Capacitor
- React Native (alternativa)
- Firebase Cloud Messaging

---

## **TAREA 12: Integración con Más APMs** 🔗
**Estado**: 🟢 PLANIFICADO  
**Tiempo estimado**: 2-3 días cada uno  
**Dependencias**: Ninguna  
**Prioridad**: BAJA

### **APMs a Integrar**
- Sentry (error tracking)
- Datadog (infraestructura + APM)
- AppDynamics (APM empresarial)
- Elastic APM (open source)

---

# 📊 RESUMEN Y ORDEN DE EJECUCIÓN

## **Fase 1: Alta Prioridad (Completar en 1-2 horas)** 🔴
```
1. ✅ Corregir Build de Docker (15-20 min)
   └─> Docker build exitoso

2. 🚀 Deploy Contenedor (10-15 min)
   └─> App corriendo en puerto 3000

3. 📊 Verificar Métricas New Relic (10-15 min)
   └─> Dashboard con datos en tiempo real

4. 🔗 Integrar Servicios con New Relic (20-30 min)
   └─> Custom events enviándose

5. 🧪 Corregir Test realtime-chat (5-10 min)
   └─> Tests al 100%

TOTAL FASE 1: ~1-1.5 horas
PROGRESO: 68% → 80%
```

## **Fase 2: Media Prioridad (Completar en 2-3 días)** 🟡
```
6. 📈 Gráficos Históricos con Recharts (4-6 horas)
   └─> Visualización avanzada de datos

7. 🔗 Sistema de Webhooks (2-3 horas)
   └─> Notificaciones Slack/Discord

8. 🚨 Configurar Alertas New Relic (30-45 min)
   └─> Alertas automáticas activas

9. 🎨 Refinar Dashboard (3-4 horas)
   └─> UI/UX mejorado

TOTAL FASE 2: ~10-14 horas
PROGRESO: 80% → 95%
```

## **Fase 3: Baja Prioridad (Completar en 1-2 meses)** 🟢
```
10. 🤖 Machine Learning (15-20 días)
11. 📱 Dashboard Móvil (10-15 días)
12. 🔗 Más APMs (2-3 días cada uno)

PROGRESO: 95% → 100%
```

---

# ✅ CHECKLIST RÁPIDO

## **Hoy (Alta Prioridad)**
- [ ] Corregir Docker build
- [ ] Deploy contenedor
- [ ] Verificar New Relic
- [ ] Integrar servicios
- [ ] Corregir test

## **Esta Semana (Media Prioridad)**
- [ ] Gráficos históricos
- [ ] Sistema webhooks
- [ ] Alertas New Relic
- [ ] Refinar dashboard

## **Este Mes (Baja Prioridad)**
- [ ] Machine Learning (investigación)
- [ ] Dashboard móvil (prototipo)
- [ ] Integrar Sentry

---

**ACCIÓN INMEDIATA RECOMENDADA**: Ejecutar `docker build --no-cache -t complicesconecta:latest .`

**META DEL DÍA**: Completar Fase 1 (Alta Prioridad) → 80% progreso

**Generado**: 2025-01-30  
**Versión**: v3.4.1  
**Estado**: ✅ LISTO PARA EJECUTAR

