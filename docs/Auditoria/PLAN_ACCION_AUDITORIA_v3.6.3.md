# 📋 PLAN DE ACCIÓN COMPLETO - AUDITORÍA v3.6.3
**Fecha:** 09 Nov 2025  
**Versión:** 3.6.3  
**Estado:** 🟡 En Progreso

---

## 📊 RESUMEN EJECUTIVO

- **Archivos escaneados:** 1073
- **Directorios:** 209
- **Duración de auditoría:** 02:52
- **Errores críticos:** 0 ✅
- **Problemas identificados:** 310
- **Prioridad alta:** 78
- **Prioridad media:** 142
- **Prioridad baja:** 90

---

## 🎯 PRIORIDADES

### 🔴 PRIORIDAD ALTA (78 problemas)

#### 1. Imports Rotos (5) - ⏱️ 30 min
**Estado:** 🔴 Crítico  
**Impacto:** Errores de compilación y runtime

- [ ] `main.tsx:95` → `'./styles/global.css'`
  - **Acción:** Verificar que existe `src/styles/global.css` o corregir ruta
  - **Archivo:** `src/main.tsx`
  
- [ ] `Navigation.tsx:5` → `'@/components/navigation/NavigationEnhanced'`
  - **Acción:** Verificar que existe `src/components/navigation/ResponsiveNavigation.tsx` o crear componente
  - **Archivo:** `src/components/Navigation.tsx`
  
- [ ] `index.ts:23` → `'@/entities/profile'`
  - **Acción:** Verificar que existe `src/entities/user.ts` o crear `profile.ts`
  - **Archivo:** `src/entities/index.ts`
  
- [ ] `Index.tsx:17` → `'@/styles/animations.css'`
  - **Acción:** Verificar que existe `src/styles/animations.css` o corregir ruta
  - **Archivo:** `src/pages/Index.tsx`
  
- [ ] `system-integration.test.ts:4` → `'@/lib/ml-matching'`
  - **Acción:** Verificar que existe `src/lib/ai/smartMatching.ts` o corregir ruta
  - **Archivo:** `src/tests/integration/system-integration.test.ts`

#### 2. Archivos Corruptos (2) - ⏱️ 15 min
**Estado:** 🔴 Crítico  
**Impacto:** Errores de codificación de caracteres

- [ ] `src/components/accessibility/ContrastFixer.tsx`
  - **Acción:** Ejecutar `scripts/fix-character-encoding.ps1 -Path "src/components/accessibility"`
  - **Verificación:** Verificar que el archivo se lee correctamente
  
- [ ] `src/services/ConsentVerificationService.ts`
  - **Acción:** Ejecutar `scripts/fix-character-encoding.ps1 -Path "src/services"`
  - **Verificación:** Verificar que el archivo se lee correctamente

#### 3. Uso de 'as any' con Tablas (4) - ⏱️ 45 min
**Estado:** 🔴 Crítico  
**Impacto:** Pérdida de type safety, posibles errores en runtime

- [ ] `backup-system.ts:251` → `.from(table as any)`
  - **Acción:** Crear tipos específicos para las tablas o usar tipos de Supabase
  - **Archivo:** `src/lib/backup-system.ts`
  - **Solución:** Usar `Database['public']['Tables'][tableName]` o crear tipos específicos
  
- [ ] `backup-system.ts:301` → `.from(tableName as any)`
  - **Acción:** Mismo que anterior
  - **Archivo:** `src/lib/backup-system.ts`
  
- [ ] `VirtualEventsService.ts:140` → `.from('event_participations' as any)`
  - **Acción:** Verificar que existe tabla `event_participations` en Supabase
  - **Archivo:** `src/services/events/VirtualEventsService.ts`
  - **Solución:** Crear migración si no existe o usar tipo correcto
  
- [ ] `VirtualEventsService.ts:164` → `.from('event_participations' as any)`
  - **Acción:** Mismo que anterior
  - **Archivo:** `src/services/events/VirtualEventsService.ts`

#### 4. Vulnerabilidades de Seguridad (66) - ⏱️ 4 horas
**Estado:** 🔴 Crítico  
**Impacto:** Riesgos de seguridad (XSS, SQL Injection, localStorage sin validación)

##### 4.1. SQL Injection (2)
- [ ] `vite-plugin-react-order.ts` → Posible SQL Injection
  - **Acción:** Revisar código y usar prepared statements o parámetros
  - **Archivo:** `vite-plugin-react-order.ts`
  
- [ ] `src/components/HCaptchaWidget.tsx` → Posible SQL Injection
  - **Acción:** Revisar código y usar prepared statements o parámetros
  - **Archivo:** `src/components/HCaptchaWidget.tsx`

##### 4.2. XSS (innerHTML) (2)
- [ ] `src/main.tsx` → Posible XSS (innerHTML)
  - **Acción:** Revisar uso de `innerHTML` y usar `textContent` o sanitizar
  - **Archivo:** `src/main.tsx`
  
- [ ] `src/components/security/ProtectedMedia.tsx` → Posible XSS (innerHTML)
  - **Acción:** Revisar uso de `innerHTML` y usar `textContent` o sanitizar
  - **Archivo:** `src/components/security/ProtectedMedia.tsx`

##### 4.3. localStorage sin validación (62)
- [ ] `src/app/(admin)/Admin.tsx`
- [ ] `src/app/(admin)/AdminProduction.tsx`
- [ ] `src/app/(auth)/Auth.tsx`
- [ ] `src/app/(discover)/Discover.tsx`
- [ ] `src/components/DismissibleBanner.tsx`
- [ ] `src/components/accessibility/AccessibilityProvider.tsx`
- [ ] `src/components/admin/AlertConfigPanel.tsx`
- [ ] `src/components/animations/AnimationProvider.tsx`
- [ ] `src/components/invitations/InvitationDialog.tsx`
- [ ] `src/components/premium/PremiumFeatures.tsx`
- [ ] `src/components/premium/PrivateMatches.tsx`
- [ ] `src/components/premium/VIPEvents.tsx`
- [ ] `src/components/premium/VirtualGifts.tsx`
- [ ] `src/components/profile/EnhancedGallery.tsx`
- [ ] `src/components/profile/ImageUpload.tsx`
- [ ] `src/components/security/BiometricAuth.tsx`
- [ ] ... (y 46 más)
  
  **Acción general:**
  - Crear función de validación para localStorage
  - Implementar sanitización de datos antes de guardar
  - Agregar validación de esquema (Zod) para datos de localStorage
  - Crear utilidad centralizada: `src/utils/safeLocalStorage.ts`

#### 5. Posibles Secretos (9) - ⏱️ 30 min
**Estado:** 🔴 Crítico  
**Impacto:** Exposición de credenciales y secretos

- [ ] `src/app/(auth)/Auth.tsx`
- [ ] `src/examples/hcaptcha-example.tsx`
- [ ] `src/tests/e2e/auth.e2e.test.ts`
- [ ] `src/tests/integration/send-email.test.ts`
- [ ] `src/tests/unit/emailService.test.ts`
- [ ] `src/tests/unit/PushNotificationService.test.ts`
- [ ] `tests/e2e-playwright/auth-flows/auth-flows-improved.spec.ts`
- [ ] `tests/e2e-playwright/fixtures/auth-fixtures.ts`
- [ ] `tests/e2e-playwright/helpers/EnhancedAuthHelper.ts`

**Acción:**
- Verificar que no hay API keys, tokens o secretos hardcodeados
- Mover a variables de entorno si es necesario
- Usar `.env.example` para documentar variables necesarias
- Agregar a `.gitignore` si es necesario

---

### 🟡 PRIORIDAD MEDIA (142 problemas)

#### 6. Archivos Huérfanos (142) - ⏱️ 2 horas
**Estado:** 🟡 Media  
**Impacto:** Código muerto, confusión, mantenimiento

**Acción:**
- Revisar cada archivo huérfano
- Decidir: eliminar, mover o crear imports
- Crear lista de archivos a eliminar vs. archivos a mantener
- Documentar decisiones en `docs/Auditoria/ARCHIVOS_HUERFANOS_v3.6.3.md`

#### 7. Archivos Obsoletos (7) - ⏱️ 30 min
**Estado:** 🟡 Media  
**Impacto:** Confusión, código duplicado

- [ ] `.gitignore.backup` → Eliminar (ya no necesario)
- [ ] `docs-unified/legacy-docs-unified/email/SUPABASE_EMAIL_SETUP_OLD.md` → Mover a `docs/legacy/` o eliminar
- [ ] `scripts/consolidar-backup-migraciones.ps1` → Eliminar si no se usa
- [ ] `scripts/crear-backup-migraciones.ps1` → Eliminar si no se usa
- [ ] `src/lib/backup-system.ts` → Revisar si se usa, eliminar si no
- [ ] `src/profiles/shared/ProfileImagePlaceholder.tsx` → Revisar si se usa, eliminar si no
- [ ] `supabase/backup_info.txt` → Mover a `docs/` o eliminar

#### 8. Archivos Mal Ubicados (1) - ⏱️ 15 min
**Estado:** 🟡 Media  
**Impacto:** Organización del código

- [ ] `src/styles/components.css` → Mover a `src/styles/components/components.css` o consolidar

#### 9. Archivos Duplicados (1) - ⏱️ 15 min
**Estado:** 🟡 Media  
**Impacto:** Confusión, mantenimiento duplicado

- [ ] `RESUMEN_CORRECCIONES_v3.6.3.md` (duplicado en raíz y `docs/`)
  - **Acción:** Mantener solo en `docs/` y eliminar de raíz
  - **Verificación:** Verificar que no hay referencias al archivo en raíz

---

### 🟢 PRIORIDAD BAJA (90 problemas)

#### 10. Dependencias Faltantes (77) - ⏱️ 1 hora
**Estado:** 🟢 Baja  
**Impacto:** Posibles errores en runtime si se usan

**Nota:** Estas dependencias están en `package.json` pero no en `node_modules`. Probablemente necesitan `npm install`.

**Acción:**
- Ejecutar `npm install` para instalar todas las dependencias
- Verificar que todas las dependencias se instalan correctamente
- Si alguna falla, revisar si es necesaria o puede eliminarse de `package.json`

**Dependencias principales:**
- Capacitor (móvil)
- Radix UI (componentes)
- Testing libraries
- TypeScript types
- Otras librerías de UI y utilidades

---

## 📅 CRONOGRAMA ESTIMADO

| Tarea | Prioridad | Tiempo | Estado |
|-------|-----------|--------|--------|
| Corregir imports rotos | 🔴 Alta | 30 min | ⏳ Pendiente |
| Corregir archivos corruptos | 🔴 Alta | 15 min | ⏳ Pendiente |
| Corregir uso de 'as any' con tablas | 🔴 Alta | 45 min | ⏳ Pendiente |
| Revisar vulnerabilidades SQL Injection | 🔴 Alta | 30 min | ⏳ Pendiente |
| Revisar vulnerabilidades XSS | 🔴 Alta | 30 min | ⏳ Pendiente |
| Crear utilidad safeLocalStorage | 🔴 Alta | 1 hora | ⏳ Pendiente |
| Aplicar safeLocalStorage a 62 archivos | 🔴 Alta | 2 horas | ⏳ Pendiente |
| Verificar posibles secretos | 🔴 Alta | 30 min | ⏳ Pendiente |
| Revisar archivos huérfanos | 🟡 Media | 2 horas | ⏳ Pendiente |
| Eliminar archivos obsoletos | 🟡 Media | 30 min | ⏳ Pendiente |
| Reubicar archivos mal ubicados | 🟡 Media | 15 min | ⏳ Pendiente |
| Eliminar archivos duplicados | 🟡 Media | 15 min | ⏳ Pendiente |
| Instalar dependencias faltantes | 🟢 Baja | 1 hora | ⏳ Pendiente |

**Tiempo total estimado:** ~9 horas

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Fase 1: Correcciones Críticas (Prioridad Alta)
- [ ] Todos los imports rotos corregidos
- [ ] Todos los archivos corruptos corregidos
- [ ] Todos los usos de 'as any' con tablas corregidos
- [ ] Todas las vulnerabilidades SQL Injection corregidas
- [ ] Todas las vulnerabilidades XSS corregidas
- [ ] Utilidad safeLocalStorage creada e implementada
- [ ] Todos los posibles secretos verificados y movidos a .env

### Fase 2: Limpieza y Organización (Prioridad Media)
- [ ] Archivos huérfanos revisados y documentados
- [ ] Archivos obsoletos eliminados o movidos
- [ ] Archivos mal ubicados reubicados
- [ ] Archivos duplicados eliminados

### Fase 3: Dependencias y Mantenimiento (Prioridad Baja)
- [ ] Todas las dependencias instaladas correctamente
- [ ] Verificación de que no hay dependencias innecesarias

---

## 📝 NOTAS IMPORTANTES

1. **Archivos Corruptos:** Usar `scripts/fix-character-encoding.ps1` para corregir
2. **Tablas Supabase:** Verificar que todas las tablas existen antes de corregir tipos
3. **localStorage:** Crear utilidad centralizada para evitar duplicación de código
4. **Secretos:** Nunca commitear secretos, siempre usar variables de entorno
5. **Archivos Huérfanos:** Revisar cuidadosamente antes de eliminar, algunos pueden ser necesarios

---

## 🔄 PRÓXIMOS PASOS

1. ✅ Corregir error en `Auditoria-analisis.ps1` (completado)
2. ⏳ Ejecutar correcciones de prioridad alta
3. ⏳ Ejecutar correcciones de prioridad media
4. ⏳ Ejecutar correcciones de prioridad baja
5. ⏳ Ejecutar auditoría nuevamente para verificar correcciones
6. ⏳ Actualizar este plan con resultados

---

**Última actualización:** 09 Nov 2025  
**Responsable:** Equipo de Desarrollo  
**Estado general:** 🟡 En Progreso

