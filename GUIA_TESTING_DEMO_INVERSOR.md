# 🧪 GUÍA DE TESTING - DEMO INVERSOR

**Fecha:** 19 de Noviembre, 2025  
**Versión:** v3.6.6  
**Demo:** Viernes (Evento DJ)  
**Tiempo Estimado:** 45-60 minutos

---

## ⚠️ **ANTES DE EMPEZAR**

### **Limpieza de Cache (OBLIGATORIO):**
```
1. Presiona: Ctrl + Shift + Delete
2. Selecciona: "Todo el tiempo"
3. Marca: ✅ Cookies y datos de sitios
           ✅ Imágenes y archivos en caché
           ✅ Datos alojados de aplicaciones
4. Click: "Borrar datos"
5. Cierra COMPLETAMENTE el navegador
6. Abre nuevo navegador limpio
```

### **Verificar Servidor Local:**
```bash
# Terminal 1: Servidor de desarrollo
npm run dev

# Esperar mensaje:
# ➜ Local:   http://localhost:8080/
# ➜ Network: use --host to expose
```

---

## 📋 **CHECKLIST DE TESTING - FEATURES CRÍTICAS**

### **✅ 1. PROTECCIÓN LEY OLIMPIA (CRÍTICO)**

#### **1.1 Anti-Screenshot**
- [ ] Presiona `PrintScreen` → Debe bloquearse
- [ ] Presiona `Ctrl + Shift + S` → Debe bloquearse
- [ ] Intenta `Windows + Shift + S` → Debe bloquearse
- [ ] **Esperado:** Notificación de bloqueo visible

#### **1.2 Anti-DevTools**
- [ ] Presiona `F12` → Debe bloquearse
- [ ] Presiona `Ctrl + Shift + I` → Debe bloquearse
- [ ] Presiona `Ctrl + Shift + C` → Debe bloquearse
- [ ] Clic derecho → "Inspeccionar" → Debe bloquearse
- [ ] **Esperado:** Alerta "DevTools bloqueado por seguridad"

#### **1.3 Anti-Download**
- [ ] Ve a cualquier imagen de perfil
- [ ] Clic derecho → "Guardar imagen como" → Debe bloquearse
- [ ] Intenta arrastrar imagen fuera del navegador → Debe bloquearse
- [ ] **Esperado:** Mensaje "Contenido protegido por Ley Olimpia"

#### **1.4 Watermarks**
- [ ] Abre una imagen en modo fullscreen
- [ ] Verifica que aparezca watermark semi-transparente
- [ ] Debe mostrar: `ID: SNG-00000001 | [FECHA/HORA]`
- [ ] **Esperado:** Watermark visible pero no intrusivo

---

### **✅ 2. IDENTIFICACIÓN ÚNICA (CRÍTICO)**

#### **2.1 IDs de Usuarios Singles**
- [ ] Abre perfil de usuario single
- [ ] Verifica que muestre ID: `SNG-00000001` (formato 8 dígitos)
- [ ] ID debe ser visible en la parte superior del perfil
- [ ] **Esperado:** ID único, consistente, formato correcto

#### **2.2 IDs de Usuarios Parejas**
- [ ] Abre perfil de pareja
- [ ] Verifica que muestre ID: `CPL-00000001` (formato 8 dígitos)
- [ ] ID debe ser visible en la parte superior del perfil
- [ ] **Esperado:** ID único, diferente formato que singles

#### **2.3 Búsqueda por ID**
- [ ] En buscador escribe: `SNG-00000001`
- [ ] Debe encontrar el perfil correspondiente
- [ ] **Esperado:** Búsqueda funcional por ID único

---

### **✅ 3. SISTEMA DE REPORTES (CRÍTICO)**

#### **3.1 Crear Reporte**
- [ ] Ve a un perfil cualquiera
- [ ] Click en "Reportar"
- [ ] Selecciona tipo: `content_violation`
- [ ] Agrega descripción: "Contenido inapropiado de prueba"
- [ ] Sube evidencia (opcional)
- [ ] Click "Enviar Reporte"
- [ ] **Esperado:** Reporte creado con ID `RPT-00000001`

#### **3.2 Verificar Estado del Reporte**
- [ ] Abre panel de moderación (si tienes acceso)
- [ ] Busca reporte con ID: `RPT-00000001`
- [ ] Verifica estado: `open`
- [ ] Verifica prioridad asignada automáticamente
- [ ] **Esperado:** Reporte listado con toda la información

#### **3.3 Documentación Legal**
- [ ] Abre detalle del reporte
- [ ] Verifica que muestre referencias legales:
   - Ley Olimpia (Art. 259 Ter)
   - Código Penal Federal
   - Fecha y hora del reporte
- [ ] **Esperado:** Documentación legal completa

---

### **✅ 4. CHAT MEJORADO**

#### **4.1 Emoji Picker**
- [ ] Abre un chat
- [ ] Click en botón emoji 😊
- [ ] Busca "corazón" en el buscador
- [ ] Selecciona emoji ❤️
- [ ] Verifica que se agregue al mensaje
- [ ] **Esperado:** Emoji insertado correctamente

#### **4.2 Enviar Archivo**
- [ ] Click en botón clip 📎
- [ ] Selecciona una imagen (.jpg, .png)
- [ ] Verifica preview antes de enviar
- [ ] Click "Enviar"
- [ ] **Esperado:** Archivo enviado con thumbnail

#### **4.3 Drag & Drop**
- [ ] Arrastra un archivo (imagen) al área de chat
- [ ] Suelta el archivo
- [ ] Verifica preview
- [ ] Click "Enviar"
- [ ] **Esperado:** Archivo subido correctamente

#### **4.4 Reacciones a Mensajes**
- [ ] Hover sobre un mensaje
- [ ] Click en "👍" (o cualquier reacción)
- [ ] Verifica que el contador aumenta
- [ ] Verifica animación de la reacción
- [ ] **Esperado:** Reacción agregada con animación

#### **4.5 Mensajes de Voz**
- [ ] Click en botón micrófono 🎤
- [ ] Permite acceso al micrófono
- [ ] Graba 5 segundos de audio
- [ ] Verifica onda visual durante grabación
- [ ] Click "Enviar"
- [ ] **Esperado:** Mensaje de voz enviado con duración

---

### **✅ 5. EDITOR DE PERFIL AVANZADO**

#### **5.1 Vista Previa Live**
- [ ] Abre "Editar Perfil"
- [ ] Cambia nombre: "Demo User Test"
- [ ] Observa preview en tiempo real a la derecha
- [ ] Cambia biografía: "Testing **bold** y *italic*"
- [ ] Verifica que preview muestre Markdown renderizado
- [ ] **Esperado:** Preview actualizado en tiempo real

#### **5.2 Sistema de Intereses**
- [ ] Click en tab "Intereses"
- [ ] Selecciona "🎵 Música"
- [ ] Selecciona "✈️ Viajes"
- [ ] Intenta seleccionar más de 10 intereses
- [ ] **Esperado:** Límite de 10 respetado con mensaje

#### **5.3 Configuración de Privacidad**
- [ ] Click en tab "Privacidad"
- [ ] Cambia "Visibilidad de perfil" a "Privado"
- [ ] Cambia "Quién puede enviar mensajes" a "Solo matches"
- [ ] Desactiva "Mostrar estado en línea"
- [ ] Guarda cambios
- [ ] **Esperado:** Configuración guardada correctamente

---

### **✅ 6. GALERÍA CON LIGHTBOX**

#### **6.1 Abrir Lightbox**
- [ ] Ve a un perfil con galería
- [ ] Click en una imagen
- [ ] Verifica que abra en modo fullscreen
- [ ] Overlay negro debe cubrir toda la pantalla
- [ ] **Esperado:** Lightbox abierto correctamente

#### **6.2 Navegación**
- [ ] Presiona flecha derecha `→` o click en botón
- [ ] Verifica que cambie a siguiente imagen
- [ ] Presiona flecha izquierda `←`
- [ ] Verifica que regrese a imagen anterior
- [ ] **Esperado:** Navegación fluida entre imágenes

#### **6.3 Zoom**
- [ ] Presiona `+` o scroll hacia arriba
- [ ] Verifica zoom hasta 300%
- [ ] Arrastra imagen cuando está zoomed (pan)
- [ ] Presiona `-` para zoom out
- [ ] **Esperado:** Zoom funcional con pan

#### **6.4 Thumbnails**
- [ ] Verifica thumbnails en la parte inferior
- [ ] Click en cualquier thumbnail
- [ ] Debe saltar a esa imagen
- [ ] Thumbnail activo debe estar resaltado
- [ ] **Esperado:** Navegación por thumbnails funcional

---

### **✅ 7. DASHBOARD ANALYTICS**

#### **7.1 Métricas Principales**
- [ ] Abre "Dashboard" o "Estadísticas"
- [ ] Verifica cards de métricas:
   - Visitas al perfil (con tendencia ↑↓)
   - Likes recibidos
   - Mensajes enviados/recibidos
   - Matches totales
- [ ] **Esperado:** Métricas visibles con números demo

#### **7.2 Gráfico de Visitas**
- [ ] Verifica gráfico de barras (últimos 7 días)
- [ ] Barras deben tener gradiente purple-pink
- [ ] Hover sobre una barra debe mostrar tooltip con número exacto
- [ ] **Esperado:** Gráfico animado y responsivo

#### **7.3 Engagement Score**
- [ ] Verifica barra de progreso de engagement
- [ ] Debe mostrar porcentaje (ej: 75%)
- [ ] Debe mostrar nivel: "Alto" / "Medio" / "Bajo"
- [ ] Barra debe estar animada con gradiente
- [ ] **Esperado:** Score calculado correctamente

---

### **✅ 8. SISTEMA DE GAMIFICACIÓN**

#### **8.1 Nivel de Usuario**
- [ ] Abre "Recompensas" o "Logros"
- [ ] Verifica nivel actual (ej: "Nivel 3: Sociable")
- [ ] Verifica puntos: `490 / 600 pts`
- [ ] Barra de progreso debe mostrar 65% aproximadamente
- [ ] **Esperado:** Sistema de niveles funcional

#### **8.2 Achievements**
- [ ] Verifica lista de logros
- [ ] Logros desbloqueados deben tener:
   - ✅ Icono de check verde
   - Fecha de desbloqueo
   - Borde dorado o destacado
- [ ] Logros bloqueados deben tener:
   - 🔒 Icono de candado
   - Requisito mostrado (ej: "50 likes (25/50)")
   - Barra de progreso
- [ ] **Esperado:** 10 logros visibles con estado correcto

#### **8.3 Filtros**
- [ ] Click en "Desbloqueados"
- [ ] Solo deben mostrarse logros con ✅
- [ ] Click en "Bloqueados"
- [ ] Solo deben mostrarse logros con 🔒
- [ ] Click en "Todos"
- [ ] Deben mostrarse todos los logros
- [ ] **Esperado:** Filtros funcionando correctamente

---

### **✅ 9. BÚSQUEDA AVANZADA**

#### **9.1 Panel de Filtros**
- [ ] Abre página de búsqueda
- [ ] Click en botón "Filtros"
- [ ] Panel debe expandirse con animación
- [ ] Verifica todos los filtros visibles
- [ ] **Esperado:** Panel colapsable funcional

#### **9.2 Filtros de Edad**
- [ ] Mueve slider de edad mínima a 25
- [ ] Mueve slider de edad máxima a 40
- [ ] Verifica que texto actualice: "25 - 40 años"
- [ ] **Esperado:** Sliders funcionando sincronizados

#### **9.3 Filtros de Distancia**
- [ ] Mueve slider de distancia a 100 km
- [ ] Verifica texto: "Distancia máxima: 100 km"
- [ ] **Esperado:** Slider de distancia funcional

#### **9.4 Selección Múltiple**
- [ ] Selecciona género: "Hombre" y "Mujer"
- [ ] Selecciona intereses: "🎵 Música", "✈️ Viajes", "🎬 Cine"
- [ ] Verifica que se agreguen como badges
- [ ] **Esperado:** Selección múltiple con visual feedback

#### **9.5 Aplicar Filtros**
- [ ] Click "Aplicar Filtros"
- [ ] Verifica resumen de filtros activos en la parte superior
- [ ] Debe mostrar badges con opción de remover (X)
- [ ] Contador de filtros activos debe actualizarse
- [ ] **Esperado:** Filtros aplicados y visibles

---

### **✅ 10. ONBOARDING**

#### **10.1 Flujo Completo**
- [ ] Simula nuevo usuario (o usa modo incógnito)
- [ ] Debe aparecer modal de onboarding automáticamente
- [ ] Verifica 4 pasos:
   1. Bienvenida con estadísticas
   2. Crea tu perfil (tips)
   3. Conecta con personas (features)
   4. Privacidad y seguridad (Ley Olimpia)
- [ ] **Esperado:** 4 pasos visibles con contenido correcto

#### **10.2 Navegación**
- [ ] Click "Siguiente" en cada paso
- [ ] Barra de progreso debe avanzar (25%, 50%, 75%, 100%)
- [ ] Click "Anterior" debe retroceder
- [ ] Verifica animaciones de transición (fade + slide)
- [ ] **Esperado:** Navegación fluida con animaciones

#### **10.3 Indicadores de Paso**
- [ ] Verifica círculos indicadores en el footer
- [ ] Paso actual debe ser más grande y purple
- [ ] Pasos completados deben ser verdes
- [ ] Pasos pendientes deben ser grises
- [ ] Click en indicador debe saltar a ese paso
- [ ] **Esperado:** Indicadores interactivos

#### **10.4 Saltar Onboarding**
- [ ] Click en "X" (cerrar) en la esquina superior derecha
- [ ] O click en "Saltar" si existe
- [ ] Modal debe cerrarse con animación
- [ ] **Esperado:** Opción de saltar funcional

---

### **✅ 11. MICRO-INTERACCIONES UI/UX**

#### **11.1 Animated Buttons**
- [ ] Hover sobre cualquier botón principal
- [ ] Debe escalar ligeramente (scale 1.02)
- [ ] Click en botón
- [ ] Debe haber efecto ripple desde el punto de click
- [ ] **Esperado:** Botones interactivos con feedback visual

#### **11.2 Like Button**
- [ ] Click en botón de like (corazón)
- [ ] Corazón debe llenar con color rojo
- [ ] Animación de "bounce" (scale 1 → 1.3 → 1)
- [ ] Contador debe incrementar
- [ ] **Esperado:** Animación suave y satisfactoria

#### **11.3 Tooltips**
- [ ] Hover sobre iconos con tooltip
- [ ] Debe aparecer tooltip con texto explicativo
- [ ] Tooltip debe posicionarse correctamente (top/bottom)
- [ ] Animación de fade in/out
- [ ] **Esperado:** Tooltips informativos visibles

#### **11.4 Toggle Switch**
- [ ] Click en cualquier toggle (ej: "Mostrar en línea")
- [ ] Switch debe deslizarse con animación suave
- [ ] Color debe cambiar (gris → purple)
- [ ] **Esperado:** Toggle animado con spring physics

#### **11.5 Toast Notifications**
- [ ] Realiza cualquier acción exitosa (ej: guardar perfil)
- [ ] Debe aparecer toast en la parte inferior central
- [ ] Toast con icono ✅ y mensaje de éxito
- [ ] Debe desaparecer automáticamente después de 3s
- [ ] **Esperado:** Notificaciones no intrusivas

---

## 🎯 **FLUJOS CRÍTICOS COMPLETOS**

### **FLUJO 1: Registro Nuevo Usuario**
```
1. [ ] Abre página principal
2. [ ] Click "Registrarse"
3. [ ] Completa formulario:
   - Email: test@demo.com
   - Password: Test123!@#
   - Confirma password
   - Acepta términos
4. [ ] Click "Crear Cuenta"
5. [ ] Verifica redirección a onboarding
6. [ ] Completa onboarding (4 pasos)
7. [ ] Verifica asignación de ID único (SNG-XXXXXXXX)
8. [ ] Verifica acceso al dashboard

✅ Esperado: Usuario creado con ID único, onboarding completado
```

### **FLUJO 2: Editar Perfil Completo**
```
1. [ ] Login con usuario de prueba
2. [ ] Ve a "Editar Perfil"
3. [ ] Tab "Básico":
   - Cambia nombre
   - Cambia biografía (usa Markdown)
   - Sube foto de perfil
4. [ ] Tab "Intereses":
   - Selecciona 5 intereses
   - Agrega interés personalizado
5. [ ] Tab "Privacidad":
   - Configura visibilidad
   - Configura mensajes
6. [ ] Click "Guardar Cambios"
7. [ ] Verifica que perfil se actualice
8. [ ] Verifica preview live durante edición

✅ Esperado: Perfil actualizado con preview en tiempo real
```

### **FLUJO 3: Chat Completo con Multimedia**
```
1. [ ] Abre chat con usuario demo
2. [ ] Envía mensaje de texto: "Hola, probando chat"
3. [ ] Envía emoji desde picker: 😊
4. [ ] Envía archivo (imagen):
   - Click clip 📎
   - Selecciona imagen.jpg
   - Verifica preview
   - Envía
5. [ ] Graba mensaje de voz:
   - Click micrófono 🎤
   - Graba 5s
   - Reproduce preview
   - Envía
6. [ ] Reacciona a mensaje anterior: 👍
7. [ ] Verifica que todo aparezca en el historial

✅ Esperado: Chat completo con texto, emojis, archivos, voz, reacciones
```

### **FLUJO 4: Reportar Contenido Inapropiado**
```
1. [ ] Ve a perfil de usuario demo
2. [ ] Click "⚠️ Reportar"
3. [ ] Selecciona tipo: "Contenido Inapropiado"
4. [ ] Prioridad: Auto-detectada como "High"
5. [ ] Descripción: "Foto de perfil viola política de contenido"
6. [ ] Sube evidencia (screenshot)
7. [ ] Click "Enviar Reporte"
8. [ ] Verifica confirmación con ID: RPT-XXXXXXXX
9. [ ] (Si eres moderador) Ve a panel de moderación
10. [ ] Busca reporte por ID
11. [ ] Verifica estado: "open"
12. [ ] Verifica documentación legal presente
13. [ ] Cambia estado a "in_review"
14. [ ] Agrega notas del moderador
15. [ ] Toma acción: "content_removal"
16. [ ] Cierra reporte con resolución

✅ Esperado: Reporte creado, procesado y cerrado con documentación legal
```

### **FLUJO 5: Búsqueda y Match**
```
1. [ ] Ve a página de búsqueda
2. [ ] Click "Filtros"
3. [ ] Configura:
   - Edad: 25-35 años
   - Distancia: 50 km
   - Género: Mujer
   - Intereses: Música, Viajes
   - Solo verificados: ✅
4. [ ] Click "Aplicar Filtros"
5. [ ] Verifica resultados filtrados
6. [ ] Click en un perfil
7. [ ] Verifica ID único visible
8. [ ] Click "Me Gusta" ❤️
9. [ ] Si es match mutuo, debe notificar
10. [ ] Abre chat con el match

✅ Esperado: Búsqueda filtrada, match creado, chat iniciado
```

---

## ⚡ **TESTING RÁPIDO (15 MINUTOS)**

Si tienes poco tiempo, verifica solo estas features críticas:

1. **Ley Olimpia (5 min):**
   - [ ] Bloqueo de screenshot
   - [ ] Bloqueo de DevTools
   - [ ] Watermarks visibles

2. **IDs Únicos (2 min):**
   - [ ] Ver ID en perfil single: SNG-XXXXXXXX
   - [ ] Ver ID en perfil pareja: CPL-XXXXXXXX

3. **Reportes (3 min):**
   - [ ] Crear reporte rápido
   - [ ] Verificar ID: RPT-XXXXXXXX

4. **Chat (3 min):**
   - [ ] Enviar emoji
   - [ ] Enviar archivo

5. **UI/UX (2 min):**
   - [ ] Verificar animaciones de botones
   - [ ] Verificar tooltips

---

## 🐛 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Problema 1: Features no se ven**
**Causa:** Cache del navegador  
**Solución:**
```
1. Ctrl + Shift + Delete
2. Borrar TODO
3. Cerrar navegador COMPLETAMENTE
4. Abrir nuevo navegador
5. Ir a http://localhost:8080
```

### **Problema 2: Build falla**
**Solución:**
```bash
npm run clean
npm install
npm run build
```

### **Problema 3: Protección Ley Olimpia no funciona**
**Causa:** Necesita estar en servidor HTTPS o localhost  
**Solución:**
```
Verificar que estés en:
- http://localhost:8080 ✅
- https://complicesconecta.vercel.app ✅
NO en:
- http://192.168.x.x ❌
```

### **Problema 4: IDs no aparecen**
**Causa:** Servicio no inicializado  
**Solución:**
```typescript
// Verificar en consola:
import { UserIdentificationService } from '@/services/UserIdentificationService';
const service = UserIdentificationService.getInstance();
console.log(service.generateUniqueId('single'));
```

### **Problema 5: Imágenes no cargan**
**Causa:** Ruta incorrecta o servicio Supabase  
**Solución:**
```
1. Verificar variables de entorno
2. Verificar conexión a Supabase
3. Usar imágenes demo locales
```

---

## 📊 **MÉTRICAS DE ÉXITO**

Para considerar el testing exitoso, debes tener:

- ✅ **100%** - Features de Ley Olimpia funcionando
- ✅ **100%** - IDs únicos asignados
- ✅ **100%** - Sistema de reportes operativo
- ✅ **90%+** - Chat con multimedia funcional
- ✅ **90%+** - Editor de perfil con preview
- ✅ **80%+** - Dashboard analytics visible
- ✅ **80%+** - Gamificación funcional
- ✅ **80%+** - Búsqueda avanzada operativa
- ✅ **100%** - Onboarding completo
- ✅ **90%+** - Micro-interacciones UI/UX

---

## ✅ **CHECKLIST FINAL ANTES DEL DEMO**

```
[ ] Cache limpiado completamente
[ ] Servidor local funcionando (npm run dev)
[ ] Build exitoso (npm run build)
[ ] Todas las features críticas verificadas
[ ] Flujos completos probados
[ ] Screenshots de demostración preparados
[ ] Variables de entorno verificadas
[ ] Backup de base de datos
[ ] Script de demo revisado
[ ] Modo presentación activado (sin notificaciones)
```

---

## 🎯 **PRÓXIMO PASO: DEPLOY A VERCEL**

Una vez que el testing local sea exitoso, procede con el deploy:
```bash
# Ver siguiente documento:
GUIA_DEPLOY_VERCEL.md
```

---

**Tiempo Total Estimado:** 45-60 minutos  
**Prioridad:** 🔴 CRÍTICO  
**Fecha Límite:** Antes del viernes (demo con inversor)

---

**Fin de Guía de Testing**
