# ✅ CHECKLIST DE TAREAS PENDIENTES

**Fecha:** 30 de Octubre, 2025  
**Tiempo Total Estimado:** 45 minutos  
**Estado:** ⏳ Por ejecutar

---

## 📋 ORDEN DE EJECUCIÓN RECOMENDADO

### ⭐ PRIORIDAD 1: Verificar UI/Login (10 minutos)

**Por qué primero:**
- Verifica que el código funcione localmente
- No requiere credenciales externas
- Base para todo lo demás

**Guía:** `VERIFICACION_UI_LOGIN_v3.4.1.md`

---

### 🔴 TAREA 1: VERIFICAR UI/LOGIN (10 minutos)

#### Paso 1: Iniciar Servidor
```powershell
# Terminal 1 - Mantener abierta
npm run dev
```

**Esperar mensaje:**
```
VITE v7.1.11  ready in XXX ms
➜  Local:   http://localhost:5173/
```

#### Paso 2: Abrir en Navegador
1. Abrir Chrome/Edge: http://localhost:5173
2. Presionar: `Ctrl + Shift + R` (hard refresh)
3. Abrir DevTools: `F12`

#### Paso 3: Verificar Console (DevTools)
**✅ Debe mostrar:**
```javascript
📊 Datadog RUM initialized
✨ Sentry initialized
[vite] connected
```

**❌ NO debe mostrar:**
```javascript
TypeError: Cannot redefine property: solana
Cannot assign to read only property 'ethereum'
```

#### Paso 4: Verificar UI Visual
**✅ Checklist:**
- [ ] Hero section con gradiente morado/rosa
- [ ] Texto "Encuentra tu Cómplice Perfecto"
- [ ] Navegación en header
- [ ] Botones "Comenzar Ahora" / "Ver Eventos"
- [ ] Footer completo
- [ ] Sin errores visibles

#### Paso 5: Probar Login Admin Principal (REAL)
1. Click en "Iniciar Sesión"
2. Ingresar:
   - Email: `complicesconectasw@outlook.es`
   - Password: `[tu password de .env]`
3. Click "Entrar"

**✅ Verificar:**
- [ ] Login exitoso
- [ ] Nombre visible en header
- [ ] Datos REALES (no mock)
- [ ] `/admin` accesible
- [ ] Console muestra: `setUser called`

#### Paso 6: Probar Login Admin Secundario (DEMO)
1. Logout (click en avatar → Cerrar Sesión)
2. Login nuevamente:
   - Email: `djwacko28@gmail.com`
   - Password: `[tu password de .env]`

**✅ Verificar:**
- [ ] Login exitoso
- [ ] Datos DEMO (mock)
- [ ] Console muestra: `Demo mode activated`

#### Resultado Esperado:
```
✅ UI carga correctamente
✅ Console limpia (sin wallet errors)
✅ Admin principal funciona (REAL)
✅ Admin secundario funciona (DEMO)
```

**Si algo falla:** Ver `VERIFICACION_UI_LOGIN_v3.4.1.md` sección Troubleshooting

---

### 🟠 TAREA 2: CONFIGURAR ALERTAS DATADOG (15 minutos)

**Requisito:** Tarea 1 completada exitosamente

**Guía:** `INSTRUCCIONES_CONFIGURACION_DATADOG.md` - TAREA 1

#### Paso 1: Acceder a Datadog
1. Abrir navegador: https://us5.datadoghq.com
2. Login: `complicesconectasw@outlook.es`
3. Password: [tu password de Outlook]

#### Paso 2: Crear Alerta de CPU
1. Menu → **Monitors** → **New Monitor**
2. Select: **Metric**
3. Detection Method: **Threshold Alert**
4. Configurar:
```
Metric: system.cpu.user
From: service:complicesconecta
Alert threshold: 80
Warning threshold: 60
Evaluation: 5 minutes
```
5. Notification:
```
Name: [ComplicesConecta] CPU Usage Alta
Message: 
🚨 CPU Usage: {{value}}%
Host: {{host.name}}

Notify: @complicesconectasw@outlook.es
```
6. Click **Create**

#### Paso 3: Crear Alerta de RAM
1. Repetir proceso anterior
2. Configurar:
```
Metric: system.mem.pct_usable
From: service:complicesconecta
Alert threshold: 10 (10% libre = 90% usado)
Warning threshold: 25
Evaluation: 5 minutes
```
3. Notification:
```
Name: [ComplicesConecta] Memory Usage Alta
Message:
🚨 Memoria libre: {{value}}%
Host: {{host.name}}

Notify: @complicesconectasw@outlook.es
```
4. Click **Create**

#### Paso 4: Crear Alerta de Error Rate
1. Menu → **Monitors** → **New Monitor**
2. Select: **APM** (NO Metric)
3. Detection Method: **Error Rate**
4. Configurar:
```
Service: complicesconecta
Environment: production
Alert threshold: 5%
Warning threshold: 2%
Evaluation: 10 minutes
```
5. Notification:
```
Name: [ComplicesConecta] Error Rate Alta
Message:
🚨 Error Rate: {{value}}%
Service: {{service.name}}

Notify: @complicesconectasw@outlook.es
```
6. Click **Create**

#### Resultado Esperado:
```
✅ 3 alertas creadas
✅ Email notifications configuradas
✅ Visible en Monitors list
```

---

### 🟡 TAREA 3: CREAR DASHBOARDS DATADOG (15 minutos)

**Requisito:** Alertas configuradas

**Guía:** `INSTRUCCIONES_CONFIGURACION_DATADOG.md` - TAREA 2

#### Dashboard 1: Production Overview (10 min)

1. Menu → **Dashboards** → **New Dashboard**
2. Name: `ComplicesConecta - Production Overview`
3. Click **Add Widgets**

**Agregar 5 widgets:**

##### Widget 1: CPU Usage
```
Type: Timeseries
Title: CPU Usage
Metric: system.cpu.user
From: service:complicesconecta
Display: Area chart (Blue)
```

##### Widget 2: Memory Usage
```
Type: Timeseries
Title: Memory Usage
Metric: system.mem.used
From: service:complicesconecta
Display: Area chart (Green)
```

##### Widget 3: Request Rate
```
Type: Query Value
Title: Requests/min
Metric: trace.express.request.hits
From: service:complicesconecta
Timeframe: Past 5 minutes
```

##### Widget 4: Error Count
```
Type: Query Value
Title: Errors (Last 1h)
Metric: trace.express.request.errors
From: service:complicesconecta
Timeframe: Past 1 hour
Color: Red if > 10
```

##### Widget 5: Response Time
```
Type: Timeseries
Title: Response Time (p99)
Metric: trace.express.request
Aggregation: p99
Display: Line chart (Orange)
```

4. Drag & drop para organizar
5. Click **Save**

#### Dashboard 2: User Experience (5 min)

1. **New Dashboard** → `ComplicesConecta - User Experience`
2. Agregar widgets:

```
Widget 1 (Group): Web Vitals
- LCP, FCP, FID, CLS, TTFB
- From: browser.rum.* metrics

Widget 2: Active Sessions
- Metric: browser.rum.session.count
- Timeframe: Past 5 min

Widget 3: Page Views
- Metric: browser.rum.view.count
- Group by: view.url_path
```

3. Click **Save**

#### Resultado Esperado:
```
✅ Dashboard "Production Overview" creado
✅ Dashboard "User Experience" creado
✅ Widgets mostrando datos
✅ Visible en Dashboards list
```

---

### 🟢 TAREA 4: CONFIGURAR LOGS (5 minutos)

**Requisito:** Dashboards creados

**Guía:** `INSTRUCCIONES_CONFIGURACION_DATADOG.md` - TAREA 3

#### Paso 1: Acceder a Live Tail
1. Menu → **Logs** → **Live Tail**
2. Query: `service:complicesconecta`
3. Click **Play** (botón verde)

**Verificar:**
- [ ] Logs aparecen en tiempo real
- [ ] Filtros funcionan
- [ ] Timestamp visible

#### Paso 2: Crear Index
1. Logs → **Configuration** → **Indexes**
2. Click **New Index**
3. Configurar:
```
Name: complicesconecta-production
Filter: service:complicesconecta AND env:production
Retention: 15 days
```
4. Click **Create**

#### Paso 3: Probar Filtros
Probar queries:
```
service:complicesconecta status:error
service:complicesconecta @http.status_code:[500 TO 599]
service:complicesconecta @message:*performance*
```

#### Resultado Esperado:
```
✅ Live Tail funcionando
✅ Index creado
✅ Filtros funcionan
✅ Logs visibles
```

---

## ✅ VERIFICACIÓN FINAL

### Checklist Completo

#### UI/Login ✅
- [ ] Servidor dev corriendo
- [ ] UI carga sin errores
- [ ] Console limpia
- [ ] Admin principal funciona
- [ ] Admin secundario funciona

#### Datadog Alertas ✅
- [ ] Alerta CPU creada
- [ ] Alerta RAM creada
- [ ] Alerta Error Rate creada
- [ ] Email configurado
- [ ] Test enviado

#### Datadog Dashboards ✅
- [ ] Dashboard Overview creado
- [ ] Dashboard RUM creado
- [ ] Widgets funcionando
- [ ] Auto-refresh activo

#### Datadog Logs ✅
- [ ] Live Tail funcionando
- [ ] Index creado
- [ ] Filtros funcionan

---

## 🎯 AL COMPLETAR TODO

### Estado Final:
```
✅ UI/Login: 100% funcional
✅ Datadog Alertas: 3 alertas activas
✅ Datadog Dashboards: 2 dashboards creados
✅ Datadog Logs: Live Tail configurado
✅ Estado: MONITORING COMPLETO - ENTERPRISE GRADE
```

### Puntuación:
```
Antes:  98.5/100
Después: 99.5/100 (+1.0)
```

### Próximos Pasos Opcionales:
1. Tomar screenshots de dashboards
2. Guardar en `docs-unified/screenshots/`
3. Verificar métricas después de 1 hora
4. Ajustar umbrales de alertas si necesario

---

## 📞 SOPORTE

**Si encuentras problemas:**

1. **UI no carga:**
   - Ver: `VERIFICACION_UI_LOGIN_v3.4.1.md` → Troubleshooting

2. **Datadog no muestra métricas:**
   - Verificar: `docker logs dd-agent`
   - Esperar: 2-3 minutos para que aparezcan

3. **Login falla:**
   - Verificar: `.env` tiene credenciales
   - Verificar: Supabase está conectado

---

**Tiempo Total:** 45 minutos  
**Última Actualización:** 30 de Octubre, 2025  
**Estado:** ⏳ Listo para ejecutar

---

*Checklist de tareas pendientes - ComplicesConecta v3.4.1*

