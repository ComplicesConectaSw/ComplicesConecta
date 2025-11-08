# 📊 ANÁLISIS DE TABLAS Y ALINEACIÓN v3.6.3

**Fecha:** 08 Nov 2025  
**Versión:** 3.6.3  
**Estado:** ✅ Migraciones Creadas, Pendiente Aplicar en Remoto

---

## 📋 RESUMEN EJECUTIVO

### Estado Actual
- **Tablas en LOCAL:** 67
- **Tablas usadas en código:** 79
- **Tablas usadas pero NO en LOCAL:** 26
- **Tablas en LOCAL pero NO usadas:** 13

### Migraciones Creadas
1. ✅ `20251108000001_create_user_device_tokens.sql` - Tabla para tokens de dispositivos
2. ✅ `20251108000002_create_user_tokens.sql` - Tabla para balances de tokens (CMPX, GTK)
3. ✅ `20251108000003_add_chat_rooms_columns.sql` - Columnas `description`, `is_public`, `is_active` (CORREGIDA: `room_type` → `type`)
4. ✅ `20251108000004_add_full_name_to_profiles.sql` - Columna `full_name` calculada con trigger automático

---

## ⚠️ TABLAS USADAS PERO NO EN LOCAL (26)

### Tablas que Necesitan Migraciones
1. **`user_tokens`** - Usada en `useTokens.ts`
   - ✅ Migración creada: `20251108000002_create_user_tokens.sql`
   - ⏳ Pendiente aplicar en remoto

2. **`user_device_tokens`** - Usada en `OneSignalService.ts`
   - ✅ Migración creada: `20251108000001_create_user_device_tokens.sql`
   - ⏳ Pendiente aplicar en remoto

3. **`clubs`** - Usada en `AdminPartners.tsx`, `Clubs.tsx`
   - ✅ Migración existente: `20251106_05_create_club_system.sql`
   - ⏳ Pendiente aplicar en remoto

4. **`club_verifications`** - Usada en `AdminPartners.tsx`
   - ✅ Migración existente: `20251106_05_create_club_system.sql`
   - ⏳ Pendiente aplicar en remoto

5. **`club_flyers`** - Usada en `AdminPartners.tsx`
   - ✅ Migración existente: `20251106_05_create_club_system.sql`
   - ⏳ Pendiente aplicar en remoto

6. **`club_checkins`** - Usada en `Clubs.tsx`
   - ✅ Migración existente: `20251106_05_create_club_system.sql`
   - ⏳ Pendiente aplicar en remoto

7. **`investments`** - Usada en `Invest.tsx`
   - ✅ Migración existente: `20251106_06_create_investment_system.sql`
   - ⏳ Pendiente aplicar en remoto

8. **`investment_tiers`** - Usada en `Invest.tsx`
   - ✅ Migración existente: `20251106_06_create_investment_system.sql`
   - ⏳ Pendiente aplicar en remoto

9. **`cmpx_shop_packages`** - Usada en `Shop.tsx`
   - ✅ Migración existente: `20251106_09_create_cmpx_shop_system.sql`
   - ⏳ Pendiente aplicar en remoto

10. **`cmpx_purchases`** - Usada en `Shop.tsx`
    - ✅ Migración existente: `20251106_09_create_cmpx_shop_system.sql`
    - ⏳ Pendiente aplicar en remoto

11. **`gallery_commissions`** - Usada en `galleryCommission.ts`
    - ✅ Migración existente: `20251106_09_create_cmpx_shop_system.sql`
    - ⏳ Pendiente aplicar en remoto

12. **`moderator_sessions`** - Usada en `moderatorTimer.ts`
    - ✅ Migración existente: `20251106_07_create_moderation_v2_system.sql`
    - ⏳ Pendiente aplicar en remoto

13. **`nft_verifications`** - Usada en `NFTVerificationService.ts`
    - ✅ Migración existente: `20251106_02_nft_staking.sql`
    - ⏳ Pendiente aplicar en remoto

14. **`digital_fingerprints`** - Usada en `digitalFingerprint.ts`, `permanentBan.ts`
    - ✅ Migración existente: `20251106_08_create_permanent_ban_system.sql`
    - ⏳ Pendiente aplicar en remoto

15. **`permanent_bans`** - Usada en `permanentBan.ts`
    - ✅ Migración existente: `20251106_08_create_permanent_ban_system.sql`
    - ⏳ Pendiente aplicar en remoto

16. **`report_ai_classification`** - Usada en `reportAIClassification.ts`
    - ✅ Migración existente: `20251106_07_create_moderation_v2_system.sql`
    - ⏳ Pendiente aplicar en remoto

### Vistas o Datos de Prueba (No Requieren Migraciones)
17. **`couple_profiles_with_partners`** - Vista (no requiere migración)
18. **`career-files`** - Datos de prueba
19. **`fake-image-data`** - Datos de prueba
20. **`fake-pdf-data`** - Datos de prueba
21. **`fake-private-image`** - Datos de prueba
22. **`fake-high-res-image`** - Datos de prueba
23. **`gallery-images`** - Datos de prueba
24. **`profile-images`** - Datos de prueba
25. **`security_logs`** - Tabla de prueba (tests)
26. **`chat_rooms`** - Ya existe, solo necesita columnas adicionales (✅ migración creada)

---

## ℹ️ TABLAS EN LOCAL PERO NO USADAS (13)

### Tablas Preparadas para Futuras Funcionalidades
1. **`ai_model_metrics`** - Métricas de modelos de IA (preparada para monitoreo)
2. **`ai_prediction_logs`** - Logs de predicciones de IA (preparada para análisis)
3. **`analytics_events`** - Eventos de analytics (preparada para tracking)
4. **`cache_statistics`** - Estadísticas de caché (preparada para optimización)
5. **`couple_profile_reports`** - Reportes de perfiles de parejas (preparada para moderación)
6. **`couple_profile_views`** - Vistas de perfiles de parejas (preparada para analytics)
7. **`invitation_statistics`** - Estadísticas de invitaciones (preparada para analytics)
8. **`monitoring_sessions`** - Sesiones de monitoreo (preparada para seguridad)
9. **`spatial_ref_sys`** - Tabla del sistema PostGIS (no requiere acción)
10. **`story_shares`** - Compartidos de historias (preparada para funcionalidad futura)
11. **`summary_feedback`** - Feedback de resúmenes (preparada para mejora de IA)
12. **`worldid_rewards`** - Recompensas de WorldID (preparada para verificación)
13. **`worldid_statistics`** - Estadísticas de WorldID (preparada para analytics)

**Nota:** Estas tablas están preparadas para futuras funcionalidades y no deben eliminarse.

---

## 🔧 ACCIONES REQUERIDAS

### Prioridad Alta (Aplicar en Remoto)
1. **Aplicar migraciones nuevas:**
   - `20251108000001_create_user_device_tokens.sql`
   - `20251108000002_create_user_tokens.sql`
   - `20251108000003_add_chat_rooms_columns.sql` (CORREGIDA)
   - `20251108000004_add_full_name_to_profiles.sql`

2. **Aplicar migraciones existentes pendientes:**
   - `20251106_05_create_club_system.sql`
   - `20251106_06_create_investment_system.sql`
   - `20251106_07_create_moderation_v2_system.sql`
   - `20251106_08_create_permanent_ban_system.sql`
   - `20251106_09_create_cmpx_shop_system.sql`
   - `20251106_02_nft_staking.sql`

### Prioridad Media
3. **Regenerar tipos desde remoto:**
   ```bash
   npx supabase gen types typescript --project-id <project-id> > src/types/supabase-generated.ts
   ```

4. **Verificar que todas las tablas estén operativas:**
   - Ejecutar `.\scripts\alinear-y-verificar-todo.ps1 -RemoteOnly`
   - Verificar que no haya errores de tipo

### Prioridad Baja
5. **Documentar tablas no usadas:**
   - Mantener tablas preparadas para futuras funcionalidades
   - Considerar eliminar solo si se confirma que no se usarán

---

## 📝 NOTAS IMPORTANTES

### Migración Corregida
- **`20251108000003_add_chat_rooms_columns.sql`**: Corregido error `room_type` → `type`
  - La columna correcta en `chat_rooms` es `type`, no `room_type`
  - La migración ahora usa `type` para actualizar valores de `is_public`

### Alineación Local vs Remoto
- **LOCAL:** 67 tablas (incluye tablas del sistema PostGIS)
- **REMOTO:** Debe tener todas las tablas usadas en código (79+)
- **Recomendación:** Aplicar todas las migraciones en remoto primero, luego sincronizar local

### Uso de Tablas
- **79 tablas usadas en código:** Incluye tablas reales, vistas, y datos de prueba
- **26 tablas usadas pero no en LOCAL:** Mayoría requiere migraciones pendientes
- **13 tablas en LOCAL pero no usadas:** Preparadas para futuras funcionalidades

---

## 🚀 PRÓXIMOS PASOS

1. **Aplicar migraciones en remoto:**
   - Abrir Supabase Dashboard → SQL Editor
   - Ejecutar migraciones en orden (ver lista arriba)
   - Verificar que no haya errores

2. **Regenerar tipos desde remoto:**
   ```bash
   npx supabase gen types typescript --project-id <project-id> > src/types/supabase-generated.ts
   ```

3. **Verificar alineación:**
   ```powershell
   .\scripts\alinear-y-verificar-todo.ps1 -RemoteOnly
   ```

4. **Verificar errores de tipo:**
   ```bash
   pnpm run type-check
   ```

---

**Última actualización:** 08 Nov 2025  
**Versión:** 3.6.3  
**Estado:** ✅ Migraciones Creadas y Corregidas, Pendiente Aplicar en Remoto

