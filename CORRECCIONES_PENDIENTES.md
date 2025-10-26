# Correcciones Pendientes - ComplicesConecta v3.4.1

## Estado Actual
- ✅ InvitationsService.ts - CORREGIDO
- ✅ ReferralTokensService.ts - CORREGIDO  
- ✅ SecurityAuditService.ts - CORREGIDO
- ✅ ProfileReportService.ts - CORREGIDO
- ✅ requests.ts - CORREGIDO
- ✅ invitations.ts - CORREGIDO

## Pendientes (75 errores en 3 archivos)

### 1. CoupleProfilesService.ts (16 errores)
**Problema**: Campos inexistentes en tabla `couple_profiles`
- Falta: `couple_interests`, `location`, `latitude`, `longitude`
- Falta: `age_range_min`, `age_range_max`, `looking_for`
- Falta: `experience_level`, `relationship_duration`, `is_active`
- Falta: `preferences`, `statistics`, `compatibility_factors`

**Solución**: Usar solo campos base + campos de migración confirmados

### 2. AdvancedCoupleService.ts (43 errores)
**Problema**: Múltiples campos inexistentes + tipos incompatibles
- Mismo problema que CoupleProfilesService
- Errores de tipo: `relationship_type` incompatible
- RPC inexistentes: `find_couples_by_proximity`, `find_couples_by_compatibility`
- Campos JSON mal mapeados

**Solución**: Simplificar a campos base + corregir tipos

### 3. notifications.ts (4 errores)
**Problema**: Incompatibilidades de tipos
- `id` es `number` pero se espera `string`
- Campo `metadata` no existe en tabla

**Solución**: Ajustar tipos de `notification_id` y eliminar uso de metadata inexistente

### 4. invitations.ts (continuación - 12 errores restantes)
**Problema**: Los errores anteriores se refieren a campos que ya no existen
**Status**: PARCIALMENTE CORREGIDO - quedan ajustes menores

## Plan de Acción
1. ✅ Corregir imports simples (requests.ts, invitations.ts)
2. ✅ Corregir notifications.ts (tipos de ID)
3. ✅ Corregir EditProfileSingle.tsx (imports)
4. ✅ Corregir CoupleProfilesService.ts (parcial - necesita migración)
5. ✅ Corregir AdvancedCoupleService.ts (parcial - necesita migración)
6. 🔄 **SIGUIENTE: Aplicar migración de BD**
7. ⏳ Verificar errores post-migración
8. ⏳ Push final a GitHub

## Notas
- La tabla `couple_profiles` tiene campos adicionales en migraciones pero no todos están disponibles
- Los servicios asumen estructura que no coincide con esquema real de Supabase
- Necesario verificar qué migraciones se aplicaron realmente

