# 🎯 Plan de Acción - Próxima Sesión
**ComplicesConecta v3.4.1**  
**Fecha**: 2025-01-30  
**Progreso Actual**: 68%

---

## ✅ ESTADO ACTUAL

### **Completado en Sesión Anterior**
- ✅ Migración de tablas de monitoreo aplicada
- ✅ New Relic Infrastructure Agent activo
- ✅ New Relic APM configurado
- ✅ Dockerfile creado y optimizado
- ✅ Script PowerShell de gestión
- ✅ Exportación de reportes (CSV/JSON/Excel)
- ✅ Notificaciones de escritorio
- ✅ Recharts instalado
- ✅ Documentación completa

### **Pendiente de Deploy**
- ⏳ Contenedor Docker con New Relic APM
- ⏳ Verificación de métricas en dashboard
- ⏳ Integración con servicios existentes

---

## 🚀 OPCIÓN 1: DEPLOY NEW RELIC APM (RECOMENDADO)
**Prioridad**: 🔴 ALTA  
**Tiempo estimado**: 30-45 minutos  
**Dependencias**: Docker Desktop (✅ activo)

### **Pasos**

#### **1. Build y Deploy del Contenedor** (10 min)
```powershell
# Opción A: Build y run automático
.\docker-build-newrelic.ps1 -Action run

# Opción B: Build manual
docker build -t complicesconecta:latest .
docker run -d \
  --name complicesconecta \
  -p 3000:3000 \
  -e NEW_RELIC_LICENSE_KEY=6f647c9c6eaa46100c049ab77e900462FFFFNRAL \
  -e NEW_RELIC_APP_NAME="ComplicesConecta" \
  complicesconecta:latest
```

**Verificación**:
```powershell
# Ver logs
docker logs -f complicesconecta

# Buscar confirmación de New Relic
docker logs complicesconecta | findstr "New Relic"
```

**Esperado**:
```
New Relic for Node.js is running in agent mode.
Agent state changed from stopped to started
Reporting to: https://rpm.newrelic.com/accounts/7299297/applications/...
```

---

#### **2. Verificar Métricas en Dashboard** (5 min)
1. Ir a: https://one.newrelic.com/nr1-core?account=7299297
2. Click en "APM" en menú izquierdo
3. Buscar app "ComplicesConecta"
4. Verificar que aparezcan:
   - Response time
   - Throughput (requests/min)
   - Error rate
   - Apdex score

**Si no aparecen métricas**:
- Esperar 2-3 minutos (delay inicial)
- Verificar logs del contenedor
- Revisar conectividad a internet
- Verificar license key en logs

---

#### **3. Integrar con PerformanceMonitoringService** (15 min)

**Archivo**: `src/services/PerformanceMonitoringService.ts`

```typescript
// Agregar al inicio del archivo
import newrelic from 'newrelic';

// En recordMetric()
recordMetric(metric: PerformanceMetric): void {
  // ... código existente ...
  
  // Enviar a New Relic
  if (typeof newrelic !== 'undefined') {
    newrelic.recordCustomEvent('PerformanceMetric', {
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      category: metric.category,
      timestamp: metric.timestamp.toISOString(),
      metadata: metric.metadata
    });
  }
}

// En generateReport()
generateReport(hours: number): PerformanceReport {
  const report = // ... generación existente ...
  
  // Enviar resumen a New Relic
  if (typeof newrelic !== 'undefined') {
    newrelic.recordCustomEvent('PerformanceReport', {
      period: `${hours}h`,
      totalMetrics: report.metrics.length,
      totalAlerts: report.alerts.length,
      timestamp: new Date().toISOString()
    });
  }
  
  return report;
}
```

---

#### **4. Integrar con ErrorAlertService** (10 min)

**Archivo**: `src/services/ErrorAlertService.ts`

```typescript
// Agregar al inicio del archivo
import newrelic from 'newrelic';

// En createAlert()
createAlert(alert: Omit<ErrorAlert, 'id' | 'timestamp' | 'resolved'>): void {
  // ... código existente ...
  
  // Enviar a New Relic
  if (typeof newrelic !== 'undefined') {
    newrelic.noticeError(new Error(alert.message), {
      severity: alert.severity,
      category: alert.category,
      component: alert.component,
      userId: alert.userId,
      stack: alert.stack
    });
    
    // También como custom event
    newrelic.recordCustomEvent('ErrorAlert', {
      severity: alert.severity,
      category: alert.category,
      message: alert.message,
      component: alert.component,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

#### **5. Configurar Alertas en New Relic** (5-10 min)

**En el dashboard de New Relic**:

1. **Alert Policy Crítica** 🔴
   - Error rate > 5%
   - Response time > 2000ms
   - Apdex < 0.5
   - Memory usage > 90%
   - Notification: Email + Slack

2. **Alert Policy Alta** 🟠
   - Error rate > 2%
   - Response time > 1000ms
   - Throughput drop > 50%
   - Notification: Email

3. **Alert Policy Media** 🟡
   - Error rate > 1%
   - Response time > 500ms
   - Database query > 1000ms
   - Notification: Dashboard only

---

#### **6. Testing Completo** (5 min)

```powershell
# 1. Generar tráfico de prueba
# Navegar a http://localhost:3000 y usar la app

# 2. Generar errores intencionales
# En consola del navegador:
throw new Error('Test error para New Relic');

# 3. Verificar en New Relic
# - Ir a dashboard
# - Buscar errores recientes
# - Verificar custom events
# - Ver transaction traces
```

---

## 📊 OPCIÓN 2: GRÁFICOS HISTÓRICOS CON RECHARTS
**Prioridad**: 🟡 MEDIA  
**Tiempo estimado**: 4-6 horas  
**Dependencias**: Recharts (✅ instalado), Tablas de monitoreo (✅ creadas)

### **Componentes a Crear**

#### **1. HistoricalCharts.tsx** (2 horas)

```typescript
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';

interface ChartData {
  timestamp: string;
  value: number;
  category: string;
}

export const HistoricalCharts: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [metricType, setMetricType] = useState<'performance' | 'errors' | 'webVitals'>('performance');

  useEffect(() => {
    loadChartData();
  }, [timeRange, metricType]);

  const loadChartData = async () => {
    const hoursAgo = timeRange === 'day' ? 24 : timeRange === 'week' ? 168 : 720;
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    let query;
    if (metricType === 'performance') {
      query = supabase
        .from('performance_metrics')
        .select('timestamp, value, category')
        .gte('timestamp', since)
        .order('timestamp', { ascending: true });
    } else if (metricType === 'errors') {
      query = supabase
        .from('error_alerts')
        .select('timestamp, severity, category')
        .gte('timestamp', since)
        .order('timestamp', { ascending: true });
    } else {
      query = supabase
        .from('web_vitals_history')
        .select('timestamp, metric_name, value')
        .gte('timestamp', since)
        .order('timestamp', { ascending: true });
    }

    const { data, error } = await query;
    if (!error && data) {
      setData(data as ChartData[]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex space-x-4">
        <select value={timeRange} onChange={e => setTimeRange(e.target.value as any)}>
          <option value="day">Último día</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
        </select>
        
        <select value={metricType} onChange={e => setMetricType(e.target.value as any)}>
          <option value="performance">Performance</option>
          <option value="errors">Errores</option>
          <option value="webVitals">Web Vitals</option>
        </select>
      </div>

      {/* Line Chart - Tendencias */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Tendencia en el Tiempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Area Chart - Comparaciones */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Distribución por Categoría</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stackId="1" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Resumen */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Resumen por Período</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

---

#### **2. Integrar en AnalyticsDashboard** (1 hora)

```typescript
// En src/components/admin/AnalyticsDashboard.tsx
import { HistoricalCharts } from './HistoricalCharts';

// Agregar nuevo tab
const tabs = [
  { id: 'overview', label: 'Resumen', icon: Activity },
  { id: 'historical', label: 'Histórico', icon: TrendingUp }, // NUEVO
  { id: 'config', label: 'Configuración', icon: Settings }
];

// En el render
{activeTab === 'historical' && (
  <div className="mt-6">
    <HistoricalCharts />
  </div>
)}
```

---

#### **3. Optimizaciones** (1-2 horas)
- Agregación de datos por hora/día
- Cache de consultas pesadas
- Lazy loading de gráficos
- Export de gráficos como imagen
- Zoom y pan interactivo

---

## 🔗 OPCIÓN 3: SISTEMA DE WEBHOOKS
**Prioridad**: 🟡 MEDIA  
**Tiempo estimado**: 2-3 horas  
**Dependencias**: Ninguna

### **Componentes a Crear**

#### **1. WebhookService.ts** (1 hora)

```typescript
import { logger } from '@/utils/logger';

interface WebhookConfig {
  url: string;
  enabled: boolean;
  events: string[];
  retryAttempts: number;
  timeout: number;
}

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

class WebhookService {
  private configs: Map<string, WebhookConfig> = new Map();

  async send(event: string, data: any): Promise<boolean> {
    const configs = Array.from(this.configs.values()).filter(
      c => c.enabled && c.events.includes(event)
    );

    const results = await Promise.allSettled(
      configs.map(config => this.sendToWebhook(config, event, data))
    );

    return results.every(r => r.status === 'fulfilled');
  }

  private async sendToWebhook(
    config: WebhookConfig,
    event: string,
    data: any
  ): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    for (let attempt = 0; attempt < config.retryAttempts; attempt++) {
      try {
        const response = await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(config.timeout)
        });

        if (response.ok) {
          logger.info('Webhook sent successfully', { url: config.url, event });
          return;
        }
      } catch (error) {
        logger.error('Webhook failed', { attempt, error: String(error) });
        if (attempt < config.retryAttempts - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw new Error(`Webhook failed after ${config.retryAttempts} attempts`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const webhookService = new WebhookService();
```

---

#### **2. WebhookConfigPanel.tsx** (1 hora)

UI para configurar webhooks en el dashboard.

---

#### **3. Integración** (30 min)

Conectar WebhookService con ErrorAlertService y PerformanceMonitoringService.

---

## 🎯 RECOMENDACIÓN FINAL

### **Para Esta Sesión**: OPCIÓN 1 (Deploy New Relic APM)
**Razones**:
1. ✅ Ya está todo configurado
2. ✅ Solo requiere ejecutar comandos
3. ✅ Impacto inmediato en monitoreo
4. ✅ Tiempo corto (30-45 min)
5. ✅ Completa todas las tareas de alta prioridad

### **Para Próximas Sesiones**:
1. **Sesión 2**: Gráficos históricos con Recharts
2. **Sesión 3**: Sistema de webhooks
3. **Sesión 4**: Machine Learning para detección de anomalías

---

## ✅ CHECKLIST PRE-EJECUCIÓN

Antes de empezar, verificar:
- [x] Docker Desktop está corriendo
- [x] New Relic Infrastructure Agent activo
- [x] Supabase local corriendo
- [x] Package `newrelic` instalado
- [x] Dockerfile creado
- [x] Script PowerShell disponible
- [x] Documentación revisada

---

## 📞 SOPORTE

### **Si algo falla**:
1. Revisar: `NEW_RELIC_SETUP_COMPLETO.md`
2. Ver logs: `docker logs complicesconecta`
3. Troubleshooting en sección de documentación
4. Verificar conectividad New Relic

### **Links Útiles**:
- Dashboard: https://one.newrelic.com/nr1-core?account=7299297
- Docs: https://docs.newrelic.com/docs/apm/agents/nodejs-agent/
- API: https://newrelic.github.io/node-newrelic/

---

**Preparado**: 2025-01-30  
**Versión**: v3.4.1  
**Estado**: ✅ LISTO PARA EJECUTAR

