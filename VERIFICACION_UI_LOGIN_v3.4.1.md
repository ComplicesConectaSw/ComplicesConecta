# ✅ VERIFICACIÓN UI/LOGIN - ComplicesConecta v3.4.1

**Fecha:** 30 de Octubre, 2025  
**Objetivo:** Verificar que UI y Login funcionen correctamente  
**Tiempo Estimado:** 10 minutos

---

## 🚀 PASO 1: INICIAR SERVIDOR DE DESARROLLO

### Comando:
```powershell
# En PowerShell, desde la raíz del proyecto
npm run dev
```

### Salida Esperada:
```
VITE v7.1.11  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Verificación:
- ✅ Servidor inicia sin errores
- ✅ Puerto 5173 disponible
- ✅ URL local accesible
- ✅ No errores de compilación

---

## 🌐 PASO 2: VERIFICAR UI EN NAVEGADOR

### 2.1 Abrir Aplicación

1. **Abrir navegador** (Chrome/Edge/Firefox)
2. **Navegar a:** http://localhost:5173
3. **Hard refresh:** `Ctrl + Shift + R`

### 2.2 Verificar Consola del Navegador

**Abrir DevTools**: `F12` o `Ctrl + Shift + I`

**Verificar en Console:**
```javascript
// DEBE MOSTRAR:
✅ 📊 Datadog RUM initialized
✅ ✨ Sentry initialized
✅ [otros logs de inicialización]

// NO DEBE MOSTRAR:
❌ Errores de wallet (solana, ethereum, metamask)
❌ Cannot redefine property: solana
❌ TronWeb is already initiated
```

**Si aparecen errores de wallet:**
- Son normales SOLO la primera carga
- Recargar página: `Ctrl + Shift + R`
- Deben desaparecer en segunda carga

### 2.3 Verificar Diseño Visual

**✅ Debe mostrar:**
- Hero section con gradiente morado/rosa
- Texto "Encuentra tu Cómplice Perfecto" visible
- Navegación completa en header
- Botones "Comenzar Ahora" y "Ver Eventos" funcionando
- Footer completo con links
- Cards de features (Conexiones Auténticas, KYC, etc.)

**❌ NO debe mostrar:**
- Pantalla azul/púrpura sin contenido
- Navegación incompleta
- Estilos rotos o faltantes
- Componentes sin renderizar

---

## 🔐 PASO 3: VERIFICAR LOGIN - ADMIN PRINCIPAL (REAL)

### 3.1 Datos de Login

```
Email: complicesconectasw@outlook.es
Password: [desde .env → VITE_PROD_PASSWORD_COMPLICESCONECTASW]
Tipo: PRODUCCIÓN (datos REALES de Supabase)
```

### 3.2 Proceso de Login

1. **Click en "Iniciar Sesión"** (header o hero section)
2. **Ingresar credenciales:**
   - Email: `complicesconectasw@outlook.es`
   - Password: `[tu contraseña de .env]`
3. **Click en "Entrar"**

### 3.3 Verificaciones Post-Login

**✅ Debe ocurrir:**
- Login exitoso (sin errores)
- Redirección a dashboard o feed
- Nombre de perfil visible en header
- Avatar/foto de perfil cargada
- Navegación de admin accesible (`/admin`)

**📊 Datos Mostrados:**
- **DATOS REALES** (no mock/demo)
- Perfiles reales de Supabase
- Posts reales
- Matches reales
- Estadísticas reales

**🔍 En Console (DevTools):**
```javascript
// Debe aparecer (si Datadog RUM está activo):
setUser called with: {id: "xxx", email: "complicesconectasw@outlook.es", ...}
```

### 3.4 Verificar Panel de Admin

1. **Navegar a:** `/admin` o click en menú admin
2. **Verificar acceso:** Panel debe cargar sin errores
3. **Verificar tabs:**
   - Dashboard
   - Usuarios
   - Reportes
   - Analytics (si está implementado)

---

## 🎭 PASO 4: VERIFICAR LOGIN - ADMIN SECUNDARIO (DEMO)

### 4.1 Logout del Admin Principal

1. **Click en avatar/menú usuario** (esquina superior derecha)
2. **Click en "Cerrar Sesión"**
3. **Confirmar logout:** Redirección a home

**🔍 En Console (DevTools):**
```javascript
// Debe aparecer (si Datadog RUM está activo):
clearUser called
```

### 4.2 Datos de Login Demo

```
Email: djwacko28@gmail.com
Password: [desde .env → VITE_DEMO_PASSWORD_DJWACKO28_GMAIL_COM]
Tipo: DEMO (datos MOCK de localStorage)
```

### 4.3 Proceso de Login Demo

1. **Click en "Iniciar Sesión"**
2. **Ingresar credenciales:**
   - Email: `djwacko28@gmail.com`
   - Password: `[tu contraseña de .env]`
3. **Click en "Entrar"**

### 4.4 Verificaciones Post-Login Demo

**✅ Debe ocurrir:**
- Login exitoso (sin errores)
- Redirección a dashboard o feed
- Nombre "djwacko28" o configurado visible
- Avatar demo cargado

**📊 Datos Mostrados:**
- **DATOS DEMO** (mock/localStorage)
- Perfiles demo generados
- Posts demo
- Matches demo
- Estadísticas simuladas

**⚠️ Restricciones Demo:**
- NO debe ver datos reales de otros usuarios
- Solo puede ver datos demo/simulados
- Puede acceder a panel admin demo (si configurado)

**🔍 En Console (DevTools):**
```javascript
// Debe aparecer:
Demo mode activated
setUser called with: {id: "demo-xxx", email: "djwacko28@gmail.com", ...}
```

---

## 🧪 PASO 5: PRUEBAS ADICIONALES

### 5.1 Navegación

**Probar:**
- ✅ Home → Feed → Profile → Settings
- ✅ Discover → Matches → Messages
- ✅ Events → Stories → Notifications
- ✅ Todas las rutas cargan correctamente

### 5.2 Responsiveness

**Probar DevTools → Toggle Device Toolbar (`Ctrl + Shift + M`):**
- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1920px)
- ✅ Diseño se adapta correctamente

### 5.3 Performance

**En DevTools → Network:**
- ✅ Recursos cargan rápido (< 3s total)
- ✅ No errores 404 o 500
- ✅ CSS y JS cargan correctamente
- ✅ Imágenes cargan (o placeholder visible)

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Servidor y UI
```
□ npm run dev ejecuta sin errores
□ http://localhost:5173 carga correctamente
□ Hard refresh limpia consola
□ No errores de wallet en console
□ Diseño con gradientes morados/rosas visible
□ Navegación completa en header
□ Footer completo con links
□ Botones funcionan correctamente
```

### Login Admin Principal (REAL)
```
□ Login con complicesconectasw@outlook.es exitoso
□ Redirección a dashboard correcto
□ Nombre de perfil visible
□ Datos REALES cargados (no mock)
□ Panel /admin accesible
□ Estadísticas reales visibles
□ Datadog RUM tracking activo (console)
```

### Login Admin Secundario (DEMO)
```
□ Logout del admin principal exitoso
□ Login con djwacko28@gmail.com exitoso
□ Redirección a dashboard correcto
□ Datos DEMO cargados (no reales)
□ No ve datos de usuarios reales
□ Console muestra "Demo mode activated"
□ Datadog RUM tracking activo (console)
```

### Performance y Responsiveness
```
□ Navegación entre páginas fluida
□ Responsive funciona en mobile/tablet/desktop
□ Recursos cargan rápido (< 3s)
□ No errores 404 o 500
□ CSS aplicado correctamente
□ Imágenes cargan o placeholder visible
```

---

## 🐛 TROUBLESHOOTING

### Problema 1: npm run dev falla

**Error común:**
```
Error: Cannot find module 'vite'
```

**Solución:**
```powershell
# Reinstalar dependencias
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
npm run dev
```

### Problema 2: Estilos no cargan

**Síntomas:**
- Página sin colores
- Sin gradientes
- Navegación desorganizada

**Solución:**
```powershell
# Limpiar caché de Vite
Remove-Item node_modules/.vite -Recurse -Force
Remove-Item dist -Recurse -Force

# Reiniciar servidor
npm run dev

# Hard refresh en navegador
Ctrl + Shift + R
```

### Problema 3: Login no funciona

**Error en console:**
```
Error: No se pudo iniciar sesión
```

**Verificar:**
1. **`.env` existe** con credenciales correctas
2. **Supabase** está configurado (URL + ANON_KEY en `.env`)
3. **Internet** conectado (para Supabase)
4. **Credenciales** son correctas

**Solución:**
```powershell
# Verificar .env
Get-Content .env | Select-String "VITE_PROD_PASSWORD"
Get-Content .env | Select-String "VITE_DEMO_PASSWORD"
Get-Content .env | Select-String "VITE_SUPABASE"

# Si falta, copiar de .env.example
Copy-Item .env.example .env
# Editar .env con credenciales reales
```

### Problema 4: Errores de wallet siguen apareciendo

**Si después de hard refresh siguen apareciendo:**

**Solución:**
```powershell
# 1. Verificar que src/main.tsx tiene el código de protección
Get-Content src/main.tsx | Select-String "walletProtection"

# 2. Si falta, el código fue modificado
# Restaurar desde git o verificar commit

# 3. Abrir en modo incógnito
# Ctrl + Shift + N (Chrome)
# Ctrl + Shift + P (Firefox)
```

---

## 📸 CAPTURAS RECOMENDADAS

### Para Documentación:
1. UI Home page cargada correctamente
2. Console limpia (sin errores de wallet)
3. Admin Principal logueado (datos reales)
4. Admin Secundario logueado (datos demo)
5. Panel /admin accesible

### Guardar en:
```
docs-unified/screenshots/ui-login/
├── home-page.png
├── console-clean.png
├── admin-principal-logged.png
├── admin-secundario-logged.png
└── admin-panel.png
```

---

## 🎯 RESULTADO ESPERADO

Al completar todas las verificaciones:

```
✅ Servidor Dev: Running en http://localhost:5173
✅ UI: Cargada correctamente con diseño completo
✅ Consola: Limpia (sin errores de wallet)
✅ Login Admin Principal: Exitoso (datos REALES)
✅ Login Admin Secundario: Exitoso (datos DEMO)
✅ Navegación: Fluida y responsiva
✅ Performance: Óptimo (< 3s load)
✅ Datadog RUM: Tracking activo
✅ Estado: UI/LOGIN 100% FUNCIONAL
```

---

## 📞 SOPORTE

**Si encuentras problemas persistentes:**
1. Revisar logs de consola (F12)
2. Verificar Network tab (recursos que fallan)
3. Verificar .env tiene todas las variables
4. Reinstalar dependencias (npm install)
5. Contacto: complicesconectasw@outlook.es

---

**Tiempo Total Estimado:** 10 minutos  
**Última Actualización:** 30 de Octubre, 2025  
**Versión:** v3.4.1

---

*Guía de verificación UI/Login para ComplicesConecta*

