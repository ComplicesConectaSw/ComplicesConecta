# 📱 Guía de Testing Mobile - ComplicesConecta v2.9.x

## 🚀 Inicio Rápido

### 1. Levantar Servidor de Desarrollo
```bash
cd c:\Users\conej\Documents\conecta-social-comunidad-main
npm run dev
```
**URL:** http://localhost:5173

### 2. Acceso desde Dispositivos Móviles
- **Red local:** Usar IP de tu PC (ej: http://192.168.1.100:5173)
- **Túnel ngrok:** `npx ngrok http 5173` (si necesitas HTTPS)

## 📋 Testing Sistemático

### Paso 1: Verificar Header/Auth Buttons
1. Abrir en móvil: http://localhost:5173
2. **Verificar botón "Iniciar sesión":**
   - ✅ Visible en header superior
   - ✅ No cortado en pantallas pequeñas
   - ✅ Touch target mínimo 44px
3. **Hacer login demo:**
   - Email: `demo@complicesconecta.com`
   - Password: `demo123`
4. **Verificar botón "Cerrar sesión":**
   - ✅ Aparece después del login
   - ✅ Visible en dropdown o header
   - ✅ Funcional al hacer tap

### Paso 2: Navegación Bottom (NavigationEnhanced)
Verificar en cada página que la navegación inferior:
- ✅ Todos los iconos visibles
- ✅ Animaciones suaves
- ✅ Active state correcto
- ✅ Touch feedback

**Páginas a probar:**
1. **Inicio** (`/`) → Tap "Inicio" en nav
2. **Descubrir** (`/discover`) → Tap "Descubrir"
3. **Chat** (`/chat`) → Tap "Chat"
4. **Solicitudes** (`/requests`) → Tap "Solicitudes"
5. **Matches** (`/matches`) → Tap "Matches"
6. **Tokens** (`/tokens`) → Tap "Tokens"
7. **Perfil** → Tap "Perfil"
8. **Configuración** → Tap "Configuración"

### Paso 3: Perfiles Demo
1. **Perfil Single:** http://localhost:5173/profile-single
   - ✅ NavigationEnhanced presente
   - ✅ Botón "Cerrar sesión" visible (si hay sesión)
   - ✅ Layout responsive
   - ✅ Imágenes cargan correctamente

2. **Perfil Pareja:** http://localhost:5173/profile-couple
   - ✅ NavigationEnhanced presente
   - ✅ Botón "Cerrar sesión" visible (si hay sesión)
   - ✅ Layout responsive
   - ✅ Temas visuales aplicados

### Paso 4: Resoluciones Críticas
Probar en DevTools o dispositivos reales:

**Mobile Portrait:**
- 320x568 (iPhone SE)
- 375x667 (iPhone 6/7/8)
- 414x896 (iPhone XR/11)
- 360x640 (Android común)

**Mobile Landscape:**
- 568x320 (iPhone SE horizontal)
- 896x414 (iPhone XR horizontal)

## 🔧 DevTools Testing

### Chrome DevTools
1. F12 → Toggle device toolbar
2. Seleccionar dispositivo o custom size
3. **Network throttling:** 3G para simular conexión lenta
4. **Performance tab:** Verificar 60fps en animaciones

### Firefox DevTools
1. F12 → Responsive Design Mode
2. Probar diferentes resoluciones
3. **Network tab:** Verificar tiempos de carga

## 📊 Checklist de Verificación Rápida

### ✅ Funcionalidad Básica
- [x] App carga sin errores
- [x] Login/logout funciona
- [x] Navegación entre páginas fluida
- [x] Botones auth siempre visibles
- [x] NavigationEnhanced en todas las páginas

### ✅ Botones de Perfiles Activados
- [x] **ProfileSingle** - Botones de acción completamente funcionales
- [x] **ProfileCouple** - Botones de match y chat activados
- [x] **Discover** - Botones de like/dislike operativos
- [x] **Matches** - Botones de chat y perfil funcionando
- [x] **Requests** - Botones de aceptar/rechazar activos

### ✅ Responsividad
- [x] Sin scroll horizontal no deseado
- [x] Botones no cortados
- [x] Texto legible (min 16px)
- [x] Touch targets ≥ 44px
- [x] Imágenes responsive

### ✅ Performance
- [x] Carga inicial < 3s
- [x] Navegación < 1s
- [x] Animaciones fluidas
- [x] Sin memory leaks

### ✅ Visual
- [ ] Contraste AA/AAA
- [ ] Temas aplicados correctamente
- [ ] Fallbacks de imágenes
- [ ] Iconos centrados y claros

## 🚨 Issues Comunes a Verificar

### Corregidos ✅
- Botón "Iniciar sesión" cortado
- Falta botón "Cerrar sesión" en perfiles
- Navegación inconsistente
- Contraste insuficiente

### Posibles Regresiones ⚠️
- Lógica auth rota
- Separación Demo/Real alterada
- Performance degradada
- Funcionalidades no funcionan

## 📱 Testing APK Android

### Generar APK (si necesario)
```bash
npm run build
npx cap sync android
npx cap open android
# En Android Studio: Build → Generate Signed Bundle/APK
```

### Instalar y Probar
1. Instalar APK en dispositivo
2. Verificar mismo checklist que web
3. **Adicional APK:**
   - ✅ Scroll sin bounce
   - ✅ Back button Android
   - ✅ Orientación portrait/landscape
   - ✅ Teclado virtual no rompe layout

## 📈 Métricas de Éxito

**Funcionalidad:** 100% navegación funcional  
**Responsividad:** 0 elementos cortados  
**Performance:** < 3s carga, 60fps animaciones  
**Accesibilidad:** Contraste AA, touch targets 44px+

---

**Servidor activo:** http://localhost:5173  
**Proxy browser:** http://127.0.0.1:23142  
**Estado:** ✅ Listo para testing
