# 🧪 GUÍA DE TESTING MANUAL - ComplicesConecta

## 📋 PREPARACIÓN ANTES DE PROBAR

### **1. Limpiar Cache Completamente**
```
1. Cierra TODAS las ventanas del navegador
2. Abre el navegador
3. Presiona: Ctrl + Shift + Delete
4. Selecciona: "All time" / "Todo el tiempo"
5. Marca TODO:
   ☑️ Browsing history
   ☑️ Cookies and site data  
   ☑️ Cached images and files
   ☑️ Download history
   ☑️ Passwords
   ☑️ Autofill
6. Click "Clear data"
7. CIERRA el navegador completamente
8. Espera 5 segundos
9. Abre el navegador de nuevo
10. Ve a: http://localhost:8080
```

### **2. Verificar Servidor Corriendo**
```bash
# En terminal, debería mostrar:
VITE v7.2.2  ready in XXX ms
➜  Local:   http://localhost:8080/
```

---

## ✅ CHECKLIST DE PRUEBAS

### **TEST 1: Página Principal (Index)**
**URL:** `http://localhost:8080`

**✅ Verificar:**
- [ ] Página carga sin errores
- [ ] Se ve el header con logo
- [ ] Botón "Iniciar Sesión" visible
- [ ] Botón "Explorar como Single" visible
- [ ] NO hay pantalla de error (ErrorBoundary)
- [ ] NO hay texto "process is not defined"

**❌ Errores esperados (pueden ignorarse):**
- Console: "OneSignal App ID no configurada" ⚠️ OK
- Console: "PostHog API key no configurada" ⚠️ OK
- Console: "Mumbai testnet error" ⚠️ OK

---

### **TEST 2: Login Demo**
**Pasos:**
1. Click en "Explorar como Single"
2. Debería aparecer modal o navegar

**✅ Verificar:**
- [ ] NO aparece error de autenticación
- [ ] Navega a `/profile-single` o `/feed`
- [ ] Se muestra perfil demo

**❌ Si falla:**
- Revisa consola: ¿error "demo@complicesconecta.com"?
- Debería decir: "✅ Usuario demo inicializado"

---

### **TEST 3: Profile Single**
**URL:** `http://localhost:8080/profile-single`

**✅ Verificar caracteres correctos:**
- [ ] Edad dice: "**28 años**" (NO "28 aos" ❌)
- [ ] Ubicación dice: "**CDMX, México**" (NO "CDMX, Mxico" ❌)
- [ ] Badge "No especificado" se ve bien

**✅ Verificar imágenes:**
- [ ] Avatar tiene imagen (NO solo letra "U" ❌)
- [ ] Galería de fotos muestra imágenes reales
- [ ] NO solo gradientes rosa/púrpura ❌

**Captura esperada:**
```
┌──────────────────────────┐
│  [FOTO PERFIL]           │
│  Usuario Demo            │
│  28 años | Masculino    │  ← DEBE DECIR "años"
│  📍 CDMX, México         │  ← DEBE DECIR "México"
└──────────────────────────┘
```

---

### **TEST 4: Feed / Posts**
**URL:** `http://localhost:8080/feed`

**✅ Verificar emojis correctos:**
Posts deberían mostrar:
- [ ] "¡Explorando nuevas conexiones en la comunidad! 😊" 
  - **NO:** "ðŸ'-" ❌
- [ ] "Una noche increíble con parejas increíbles 💖"
- [ ] "Respeto y comunicación son la clave 🔑"

**✅ Verificar likes funcionan:**
1. Click en ❤️ de un post
2. [ ] Corazón se pone **ROJO** 🔴
3. [ ] Hace animación de **bounce**
4. [ ] Contador **aumenta** (ej: 5 → 6)
5. Click otra vez
6. [ ] Corazón vuelve **blanco** ⚪
7. [ ] Contador **disminuye** (ej: 6 → 5)

**✅ Verificar compartir:**
1. Click en botón compartir 🔄
2. [ ] Botón hace animación **shake**
3. [ ] Aparece **toast** con mensaje

**✅ Verificar comentarios:**
1. Click en botón comentarios 💬
2. [ ] Sección se **expande** suavemente
3. [ ] Se ven comentarios demo
4. [ ] Click otra vez **colapsa**

---

### **TEST 5: Animaciones de Posts**
**URL:** `http://localhost:8080/feed`

**✅ Verificar:**
- [ ] Posts aparecen con **fade-in** al cargar
- [ ] Cada post aparece con **delay** (uno tras otro)
- [ ] NO aparecen todos de golpe

**Cómo probar:**
1. Recarga la página (F5)
2. Observa cómo aparecen los posts
3. Deberían "entrar" de abajo hacia arriba

---

### **TEST 6: Auth Page**
**URL:** `http://localhost:8080/auth`

**✅ Verificar typos corregidos:**
- [ ] Tab dice: "**Iniciar Sesión**" (NO "Iniciar Sesin" ❌)
- [ ] Botón dice: "**Iniciar Sesión**" (NO "Iniciar Sesin" ❌)

**✅ Verificar accesibilidad:**
1. Usa Tab para navegar
2. Todos los select deberían ser accesibles
3. Sin errores de consola sobre aria-label

---

### **TEST 7: Discover Page**
**URL:** `http://localhost:8080/discover`

**✅ Verificar:**
- [ ] Página carga en **menos de 3 segundos**
- [ ] NO se queda congelada
- [ ] Muestra perfiles demo
- [ ] NO hay timeout

**❌ Si tarda más de 5 segundos:**
- Problema: Timeout no funcionó
- Revisa consola: ¿error "Timeout loading profiles"?

---

## 🐛 ERRORES CONOCIDOS (IGNORAR)

### **Console Warnings OK:**
```javascript
⚠️ OneSignal App ID no configurada
⚠️ PostHog API key no configurada  
⚠️ Variables de Supabase usando valores placeholder
⚠️ Module "buffer" has been externalized
```
**Estos son normales en modo demo.**

### **Network Errors OK:**
```
POST https://rpc-mumbai.maticvigil.com/ net::ERR_NAME_NOT_RESOLVED
```
**Mumbai testnet deprecado, no afecta funcionalidad.**

---

## 📊 CHECKLIST RÁPIDO

### **Críticos (DEBEN funcionar):**
- [x] ✅ NO error "process is not defined"
- [ ] ✅ Login demo funciona
- [ ] ✅ "años" y "México" se ven bien
- [ ] ✅ Emojis correctos (😊 💖 🔑)
- [ ] ✅ Likes funcionan (aumentan/disminuyen)

### **Importantes (deberían funcionar):**
- [ ] ✅ Animaciones en likes
- [ ] ✅ Animaciones en posts (fade-in)
- [ ] ✅ Comentarios se expanden
- [ ] ✅ Discover carga rápido (<3s)

### **Menores (pueden fallar por cache):**
- [ ] 🔄 Imágenes cargan (puede requerir más tiempo)
- [ ] 🔄 Avatar muestra foto real

---

## 🔄 SI ALGO NO FUNCIONA

### **1. Emojis siguen corruptos (ðŸ'-)**
```bash
# Solución:
1. Ctrl + Shift + Delete → Clear ALL
2. Cierra navegador COMPLETAMENTE
3. Abre en modo incógnito: Ctrl + Shift + N
4. Ve a http://localhost:8080
```

### **2. Imágenes no cargan (solo gradientes)**
```bash
# Solución:
1. Espera 10-15 segundos (CDN puede tardar)
2. Si no: F12 → Network → Desactiva cache
3. Recarga con Ctrl + F5
```

### **3. Likes no funcionan**
```bash
# Solución:
1. F12 → Console
2. Escribe: localStorage.clear()
3. Enter
4. Recarga: F5
```

### **4. Nada funciona después de limpiar cache**
```bash
# Reiniciar servidor:
# Terminal:
Ctrl + C
rm -rf node_modules/.vite
pnpm run dev

# Navegador:
Ctrl + Shift + N → http://localhost:8080
```

---

## 📝 REPORTE DE BUGS

**Formato para reportar:**
```
URL: [donde ocurrió]
Problema: [qué no funciona]
Esperado: [qué debería pasar]
Captura: [si es posible]
Console: [errores de consola si hay]
```

**Ejemplo:**
```
URL: http://localhost:8080/profile-single
Problema: Dice "28 aos" en lugar de "28 años"
Esperado: Debería decir "28 años"
Console: Sin errores
```

---

## ✨ ESTADO ESPERADO FINAL

### **Index:**
- ✅ Página principal limpia
- ✅ Botones funcionan
- ✅ Sin ErrorBoundary

### **Profile:**
- ✅ "28 años" (NO "aos")
- ✅ "CDMX, México" (NO "Mxico")
- ✅ Imágenes reales

### **Feed:**
- ✅ Emojis: 😊 💖 🔑 (NO "ðŸ'-")
- ✅ Likes: Rojo + bounce + contador
- ✅ Compartir: Shake + toast
- ✅ Comentarios: Expandir/colapsar
- ✅ Posts: Fade-in animado

### **Auth:**
- ✅ "Iniciar Sesión" (NO "Sesin")
- ✅ Tabs correctos
- ✅ Botones accesibles

### **Discover:**
- ✅ Carga <3 segundos
- ✅ Perfiles demo visibles
- ✅ Sin timeout

---

**Última actualización:** 16 Nov 2025, 01:00 AM  
**Servidor:** http://localhost:8080  
**Modo:** Demo activo
