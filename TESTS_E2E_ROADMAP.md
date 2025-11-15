# 🗺️ **ROADMAP COMPLETO DE TESTS E2E - COMPLICESCONECTA**

**Fecha:** 15 Noviembre 2025  
**Versión Actual:** 3.6.4  
**Tests Actuales:** 68 tests (solo 15% del sistema)  
**Tests Necesarios:** ~450 tests para cobertura completa  

---

## 📊 **ESTADO ACTUAL vs NECESARIO**

| Categoría | Tests Actuales | Tests Necesarios | Cobertura |
|-----------|----------------|------------------|-----------|
| **Registro** | 24 | 30 | 80% ✅ |
| **Navegación** | 9 | 15 | 60% ⚠️ |
| **UI Básica** | 13 | 20 | 65% ⚠️ |
| **Demo** | 14 | 20 | 70% ⚠️ |
| **Teléfono** | 8 | 10 | 80% ✅ |
| **TOTAL BÁSICO** | **68** | **95** | **72%** |
| | | | |
| **Tokens CMPX/GTK** | 0 | 35 | 0% ❌ |
| **Chat Real-time** | 0 | 40 | 0% ❌ |
| **Matches** | 0 | 25 | 0% ❌ |
| **Galerías** | 0 | 30 | 0% ❌ |
| **Clubs** | 0 | 35 | 0% ❌ |
| **Geolocalización** | 0 | 20 | 0% ❌ |
| **Historias** | 0 | 25 | 0% ❌ |
| **Comentarios** | 0 | 15 | 0% ❌ |
| **Invitaciones** | 0 | 20 | 0% ❌ |
| **Moderación** | 0 | 30 | 0% ❌ |
| **Staking** | 0 | 25 | 0% ❌ |
| **NFTs** | 0 | 20 | 0% ❌ |
| **Chatbot IA** | 0 | 15 | 0% ❌ |
| **Verificación** | 0 | 10 | 0% ❌ |
| **Permisos** | 0 | 15 | 0% ❌ |
| **TOTAL AVANZADO** | **0** | **360** | **0%** |
| | | | |
| **GRAN TOTAL** | **68** | **455** | **15%** 🚨 |

---

## 🎯 **FUNCIONALIDADES SIN TESTEAR (CRÍTICAS)**

### **1. SISTEMA DE TOKENS (0/35 tests)** ❌

```typescript
❌ Comprar tokens CMPX (1000 CMPX = $300 MXN)
❌ Verificar balance de tokens
❌ Gastar tokens en galería privada
❌ Recibir tokens como creador (90% comisión)
❌ Transacciones de tokens
❌ Historial de tokens
❌ Staking de tokens (10% APY)
❌ Unstaking de tokens
❌ Recompensas de staking
❌ Tokens GTK (inversión)
❌ Conversión CMPX ↔ GTK
❌ Dashboard de tokens
❌ Notificaciones de tokens
❌ Validar saldo insuficiente
❌ Stripe payment flow
... +20 tests más
```

### **2. CHAT EN TIEMPO REAL (0/40 tests)** ❌

```typescript
❌ Crear chat entre usuarios
❌ Enviar mensaje de texto
❌ Recibir mensaje en tiempo real
❌ Enviar imagen en chat
❌ Enviar video en chat
❌ Enviar audio en chat
❌ Emojis en mensajes
❌ Indicador "escribiendo..."
❌ Mensaje leído (✓✓)
❌ Mensaje entregado (✓)
❌ Eliminar mensaje
❌ Editar mensaje
❌ Responder mensaje (quote)
❌ Chatbot IA responde automáticamente
❌ Moderación automática de mensajes
❌ Bloquear usuario en chat
❌ Reportar mensaje
❌ Notificaciones de mensajes nuevos
❌ Contador de mensajes no leídos
❌ Búsqueda en chat
❌ Chat grupal
❌ Agregar miembro a grupo
❌ Eliminar miembro de grupo
❌ Salir de grupo
❌ Archivos adjuntos
❌ Límite de caracteres
❌ Texto visible (contraste)
❌ Chat persist después de refresh
❌ Desconexión/reconexión automática
❌ Histórico de mensajes (scroll infinito)
... +10 tests más
```

### **3. SISTEMA DE MATCHES (0/25 tests)** ❌

```typescript
❌ Ver perfil de usuario
❌ Dar "Me gusta" a perfil
❌ Rechazar perfil (X)
❌ Super like (estrella)
❌ Match creado cuando ambos dan like
❌ Notificación de match
❌ Ver lista de matches
❌ Abrir chat desde match
❌ Deshacer match
❌ Reportar perfil
❌ Bloquear perfil
❌ Algoritmo de compatibilidad (ML scoring)
❌ Filtros de búsqueda (edad, género, distancia)
❌ Límite de likes diarios (freemium)
❌ Likes ilimitados con tokens
❌ Boost de perfil con tokens
❌ Ver quién te dio like (premium)
❌ Verificación de perfil (badge)
❌ Geolocalización en matches (distancia)
❌ Preferencias de búsqueda
... +5 tests más
```

### **4. GALERÍAS PRIVADAS/PÚBLICAS (0/30 tests)** ❌

```typescript
❌ Upload foto a galería pública
❌ Upload foto a galería privada
❌ Establecer precio en tokens (90 CMPX)
❌ Usuario paga tokens para ver galería
❌ Creador recibe 90% (81 CMPX)
❌ Plataforma recibe 10% (9 CMPX)
❌ Watermark IA automático
❌ Blur de caras/tatuajes
❌ Validar formato de imagen (jpg, png, webp)
❌ Límite de tamaño (5MB)
❌ Límite de cantidad (50 fotos)
❌ Eliminar foto de galería
❌ Ver galería pública gratis
❌ Galería privada bloqueada sin pago
❌ Historial de compras de galerías
❌ Reporte de contenido inapropiado
❌ Moderación de galerías (Ley Olimpia)
❌ Verificación de consentimiento
❌ NFT de galería (preparado blockchain)
❌ Comentarios en fotos
... +10 tests más
```

### **5. CLUBS VERIFICADOS (0/35 tests)** ❌

```typescript
❌ Ver lista de clubs
❌ Filtrar clubs por ciudad
❌ Ver perfil de club
❌ Ver eventos de club
❌ Check-in geolocalizado (radio 50m)
❌ Validar distancia con GPS
❌ Badge de check-in verificado
❌ Subir reseña 24h después de check-in
❌ Valoración de club (1-5 estrellas)
❌ Foto de reseña con watermark
❌ Moderación de reseñas
❌ Reportar club
❌ Flyer de evento subido por partner
❌ Validación de flyer por SuperAdmin
❌ Badge "Verificado" en club
❌ Sistema de comisiones (25-35%)
❌ Reserva de mesa con tokens
❌ Descuentos con staking
❌ Notificación de eventos cercanos
❌ Compartir evento
❌ Invitar amigos a evento
... +14 tests más
```

### **6. GEOLOCALIZACIÓN (0/20 tests)** ❌

```typescript
❌ Solicitar permiso de ubicación
❌ Obtener coordenadas GPS
❌ Calcular distancia a club (50m radio)
❌ Bloquear check-in si >50m
❌ Permitir check-in si ≤50m
❌ Ver usuarios cercanos (5km, 10km, 20km)
❌ Filtro de distancia en búsqueda
❌ Actualizar ubicación en tiempo real
❌ Privacy: ocultar ubicación exacta
❌ Mostrar solo ciudad/colonia
❌ Geofencing para eventos
❌ Notificación "Match cercano (2km)"
❌ Mapa de clubs cercanos
❌ Navegación a club (integración Google Maps)
❌ Validar permisos de ubicación
❌ Fallback si GPS deshabilitado
❌ Ubicación manual si GPS no disponible
... +3 tests más
```

### **7. HISTORIAS (0/25 tests)** ❌

```typescript
❌ Crear historia con texto
❌ Crear historia con imagen
❌ Crear historia con video
❌ Duración 24 horas
❌ Ver historia de otro usuario
❌ Indicador "visto" en historia
❌ Lista de quién vio tu historia
❌ Eliminar historia antes de 24h
❌ Historia expira automáticamente
❌ Responder a historia por chat
❌ Compartir historia
❌ Reportar historia
❌ Moderación automática IA
❌ Stickers en historia
❌ Filtros en historia
❌ Música en historia
❌ Encuestas en historia
❌ Preguntas en historia
❌ Historias de clubs (eventos)
❌ Destacar historia (permanente con tokens)
... +5 tests más
```

### **8. SISTEMA DE INVITACIONES (0/20 tests)** ❌

```typescript
❌ Enviar solicitud de amistad
❌ Recibir solicitud de amistad
❌ Aceptar solicitud
❌ Rechazar solicitud
❌ Cancelar solicitud enviada
❌ Ver solicitudes pendientes
❌ Contador de solicitudes nuevas
❌ Notificación de solicitud nueva
❌ Eliminar amigo
❌ Ver lista de amigos
❌ Invitar a evento de club
❌ Aceptar invitación a evento
❌ Rechazar invitación a evento
❌ Invitar a chat grupal
❌ Validar límite de invitaciones
❌ Bloquear invitaciones de usuario
❌ Privacidad: solo amigos pueden invitar
... +3 tests más
```

### **9. COMENTARIOS (0/15 tests)** ❌

```typescript
❌ Comentar en foto de galería
❌ Comentar en historia
❌ Comentar en post
❌ Responder a comentario (thread)
❌ Like en comentario
❌ Eliminar comentario propio
❌ Reportar comentario
❌ Moderación automática de comentarios
❌ Límite de caracteres (500)
❌ Emojis en comentarios
❌ Notificación de comentario nuevo
❌ Editar comentario
❌ Ver histórico de ediciones
... +2 tests más
```

### **10. MODERACIÓN (0/30 tests)** ❌

```typescript
❌ Reportar usuario
❌ Reportar contenido
❌ IA clasifica reporte (Urgente/Normal/Bajo)
❌ SuperAdmin ve reportes urgentes
❌ Elite moderator ve reportes normales
❌ Moderador asigna reporte
❌ Moderador revisa contenido
❌ Bannear usuario temporalmente
❌ Bannear usuario permanentemente
❌ Huella digital (Canvas + WorldID)
❌ Usuario baneado no puede crear cuenta nueva
❌ Apelar ban
❌ Moderador responde apelación
❌ Sistema de pagos automáticos (lunes 00:00)
❌ SuperAdmin gana 30% comisión
❌ Elite gana 8%
❌ Senior gana 5%
❌ Junior gana 3%
❌ Trainee gana fijo
❌ Dashboard de moderación
❌ Estadísticas de reportes
❌ Ley Olimpia: detección automática
❌ Contenido sexual sin consentimiento → Ban inmediato
... +7 tests más
```

### **11. VERIFICACIÓN (0/10 tests)** ❌

```typescript
❌ Upload selfie para verificación
❌ IA detecta rostro
❌ IA compara con foto de perfil
❌ Aprobar verificación
❌ Rechazar verificación
❌ Badge "Verificado" en perfil
❌ WorldID integration
❌ Verificación instantánea con WorldID
❌ Re-verificación cada 6 meses
❌ Notificación de verificación expirada
```

### **12. TEMA/DARK MODE (0/5 tests)** ❌

```typescript
❌ Cambiar a tema oscuro
❌ Cambiar a tema claro
❌ Persistir preferencia de tema
❌ Tema automático según sistema
❌ Contraste accesible en ambos temas
```

### **13. DESLOGUEOS/SESIÓN (0/10 tests)** ❌

```typescript
❌ Login persiste después de refresh
❌ Token se renueva automáticamente
❌ Logout manual funciona
❌ Sesión expira después de 7 días
❌ No hay deslogueos inesperados
❌ Sesión demo persiste
❌ Multi-device: logout en un device → logout en todos
❌ Recuperar sesión después de cerrar navegador
❌ Remember me checkbox
❌ Session timeout warning (5 min antes)
```

### **14. VALIDACIONES GENERALES (0/15 tests)** ❌

```typescript
❌ Caracteres permitidos en username
❌ Caracteres permitidos en bio
❌ Límite de caracteres en bio (500)
❌ Emojis permitidos
❌ HTML/Scripts no permitidos (XSS prevention)
❌ SQL injection prevention
❌ CSRF tokens en forms
❌ Rate limiting (100 requests/min)
❌ Validar edad real con documento (opcional)
❌ 2FA con código SMS
❌ 2FA con app (Google Authenticator)
❌ Recovery codes para 2FA
❌ Validar email con código de verificación
❌ Validar teléfono con código SMS
❌ Prevención de bots (hCaptcha)
```

### **15. TODOS LOS BOTONES/COMPONENTES (0/50 tests)** ❌

```typescript
❌ Cada botón ejecuta su función
❌ Estados disabled cuando corresponde
❌ Loading states en botones
❌ Tooltips en iconos
❌ Modals se abren/cierran correctamente
❌ Dropdowns funcionan
❌ Accordions se expanden
❌ Tabs cambian de vista
❌ Carousels avanzan/retroceden
❌ Infinite scroll carga más contenido
❌ Lazy loading de imágenes
❌ Skeleton loaders mientras carga
❌ Error boundaries capturan errores
❌ Fallback UI cuando hay error
❌ Retry button funciona
❌ Links externos abren en nueva tab
❌ Links internos navegan correctamente
❌ Breadcrumbs navegables
❌ Pagination funciona
❌ Filtros se aplican correctamente
... +30 componentes más
```

---

## 🎯 **PRIORIZACIÓN REALISTA**

### **FASE 1: CRÍTICO (Ya tenemos 72%)** ✅

- [x] Registro Single/Pareja - 24 tests
- [x] Navegación básica - 9 tests  
- [x] UI componentes - 13 tests
- [x] Demo flow - 14 tests
- [x] Teléfono MX - 8 tests

### **FASE 2: ALTA PRIORIDAD (0%)** 🔥

```
Pendiente: ~150 tests
Tiempo estimado: 3-4 semanas
```

- [ ] Chat en tiempo real - 40 tests
- [ ] Matches y likes - 25 tests
- [ ] Galerías privadas - 30 tests
- [ ] Tokens básicos - 20 tests
- [ ] Sesión/Deslogueos - 10 tests
- [ ] Validaciones generales - 15 tests
- [ ] Componentes críticos - 10 tests

### **FASE 3: MEDIA PRIORIDAD (0%)** ⚠️

```
Pendiente: ~120 tests
Tiempo estimado: 2-3 semanas
```

- [ ] Clubs - 35 tests
- [ ] Geolocalización - 20 tests
- [ ] Historias - 25 tests
- [ ] Invitaciones - 20 tests
- [ ] Comentarios - 15 tests
- [ ] Tema/Dark mode - 5 tests

### **FASE 4: BAJA PRIORIDAD (0%)** 💤

```
Pendiente: ~90 tests
Tiempo estimado: 2 semanas
```

- [ ] Moderación - 30 tests
- [ ] Staking - 25 tests
- [ ] NFTs - 20 tests
- [ ] Verificación - 10 tests
- [ ] Chatbot IA - 15 tests

---

## ⏱️ **ESTIMACIÓN DE TIEMPO**

| Fase | Tests | Tiempo Desarrollo | Tiempo Testing |
|------|-------|-------------------|----------------|
| Fase 1 (hecho) | 68 | ✅ Completado | ✅ Completado |
| Fase 2 | 150 | 3-4 semanas | 1 semana |
| Fase 3 | 120 | 2-3 semanas | 1 semana |
| Fase 4 | 90 | 2 semanas | 1 semana |
| **TOTAL** | **428** | **7-9 semanas** | **3 semanas** |

**Gran Total:** ~10-12 semanas (2.5-3 meses) para cobertura 100%

---

## 💡 **RECOMENDACIÓN**

### **Opción A: Tests Exhaustivos (100%)** 
```
✅ Cobertura completa
✅ Confianza total
❌ 2-3 meses de desarrollo
❌ Muy costoso en tiempo
```

### **Opción B: Tests Críticos (40%)** ⭐ RECOMENDADO
```
✅ Cubre funcionalidades principales
✅ 3-4 semanas
✅ Balance costo/beneficio
⚠️ No cubre features secundarias
```

### **Opción C: Tests Mínimos (15%)** 
```
✅ Tenemos esto ahora
⚠️ Solo registro básico
❌ No cubre funcionalidades reales
```

---

## 🚀 **PRÓXIMOS PASOS SUGERIDOS**

1. **Decidir nivel de cobertura** (A, B o C)
2. **Si eligen B:** Implementar Fase 2 (chat, matches, galerías, tokens)
3. **Si eligen A:** Plan de 3 meses
4. **Si eligen C:** Dejar como está

---

**¿Qué nivel de cobertura quieres implementar?**

- 🔥 **Fase 2 (Chat + Matches + Galerías)** - Lo más crítico
- 🏆 **Todo (455 tests)** - Cobertura completa  
- ✅ **Dejar así (68 tests)** - Solo básicos
