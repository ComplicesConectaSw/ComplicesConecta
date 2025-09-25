# ✅ Checklist de Corrección de Archivos Temporales

**Fecha:** 24 de Septiembre 2025  
**Objetivo:** Corregir y alinear todos los archivos recuperados del temporal con la base de datos  
**Estado:** En progreso

---

## 🗄️ **FASE 1: Base de Datos - Tablas Avanzadas**

### ❌ **Error Crítico Detectado:**
```
ERROR: 42P01: relation "public.profiles" does not exist
```

**Causa:** La migración intenta crear tablas que referencian `profiles` pero esta tabla base no existe  
**Solución:** Necesitamos obtener el esquema completo de la BD remota primero

### 📋 **Tareas de Base de Datos:**

- [x] **1.1** ~~Corregir error de columna "metric_name" en system_metrics~~ - Error diferente identificado
- [x] **1.2** Verificar esquema actual de Supabase vs migración - Error: tabla profiles no existe
- [ ] **1.3** Obtener esquema completo de BD remota con `supabase db pull`
- [ ] **1.4** Validar creación de las 7 tablas:
  - [ ] `system_metrics`
  - [ ] `user_notification_preferences`
  - [ ] `user_device_tokens`
  - [ ] `notification_history`
  - [ ] `moderation_logs`
  - [ ] `token_analytics`
  - [ ] `user_2fa_settings`
- [ ] **1.5** Verificar índices creados correctamente
- [ ] **1.6** Validar políticas RLS aplicadas
- [ ] **1.7** Probar funciones auxiliares (record_system_metric, record_token_event)
- [ ] **1.8** Regenerar tipos TypeScript de Supabase
- [ ] **1.9** Ejecutar type-check para validar alineación

---

## 🔧 **FASE 2: Correcciones TypeScript**

### 📊 **Paneles Administrativos:**
- [ ] **2.1** `src/components/admin/AnalyticsPanel.tsx` - Columnas faltantes
- [ ] **2.2** `src/components/admin/SecurityPanel.tsx` - Variables duplicadas y JSX
- [ ] **2.3** `src/components/admin/UserManagementPanel.tsx` - Props variant
- [ ] **2.4** `src/components/admin/PerformancePanel.tsx` - Verificar tipos
- [ ] **2.5** `src/components/admin/TokenSystemPanel.tsx` - Verificar tipos

### 🤖 **Modales de IA:**
- [ ] **2.6** `src/components/modals/ContentModerationModal.tsx` - Tipos y props
- [ ] **2.7** `src/components/modals/SmartMatchingModal.tsx` - Imports y tipos

### 🔐 **Servicios Backend:**
- [ ] **2.8** `src/services/SecurityService.ts` - Tipos Supabase
- [ ] **2.9** `src/services/ContentModerationService.ts` - Verificar tipos
- [ ] **2.10** `src/services/SmartMatchingService.ts` - Verificar tipos

### 🎨 **Componentes UI:**
- [ ] **2.11** `src/components/ui/UnifiedCard.tsx` - Imports y tipos
- [ ] **2.12** `src/components/auth/TermsModal.tsx` - Framer-motion y props variant
- [ ] **2.13** `src/components/Header.tsx` - Props variant en múltiples botones
- [ ] **2.14** `src/components/StoriesContainer.tsx` - Props variant en Badge

### 📄 **Páginas:**
- [ ] **2.15** `src/pages/Index.tsx` - Errores TypeScript
- [ ] **2.16** `src/pages/Matches.tsx` - Errores TypeScript
- [ ] **2.17** `src/pages/Tokens.tsx` - Errores TypeScript
- [ ] **2.18** `src/pages/Donations.tsx` - Errores TypeScript
- [ ] **2.19** `src/pages/Guidelines.tsx` - Errores TypeScript

---

## 📱 **FASE 3: Optimización Android**

### 🔧 **Componentes Android:**
- [ ] **3.1** Verificar `src/components/android/AndroidOptimizedApp.tsx`
- [ ] **3.2** Verificar `src/components/android/AndroidThemeProvider.tsx`
- [ ] **3.3** Verificar `src/components/android/LazyImageLoader.tsx`
- [ ] **3.4** Integrar componentes Android al proyecto principal
- [ ] **3.5** Crear CSS específico para Android
- [ ] **3.6** Probar en dispositivos Android

---

## 🧪 **FASE 4: Testing**

### 📝 **Tests Específicos:**
- [ ] **4.1** Verificar `tests/unit/PushNotificationService.test.ts`
- [ ] **4.2** Verificar `tests/integration/send-email.test.ts`
- [ ] **4.3** Verificar `tests/unit/emailService.test.ts`
- [ ] **4.4** Crear tests para servicios de IA
- [ ] **4.5** Crear tests para sistema de notificaciones
- [ ] **4.6** Crear tests para analytics avanzados
- [ ] **4.7** Ejecutar suite completa de tests

---

## 🎯 **FASE 5: Integración Final**

### 🔗 **Integración de Componentes:**
- [ ] **5.1** Integrar nuevos paneles al `AdminDashboard.tsx`
- [ ] **5.2** Actualizar rutas y navegación
- [ ] **5.3** Verificar imports y exports
- [ ] **5.4** Probar funcionalidades end-to-end

### ✅ **Validación Final:**
- [ ] **5.5** Ejecutar `npm run type-check` sin errores
- [ ] **5.6** Ejecutar `npm run build` exitosamente
- [ ] **5.7** Probar en desarrollo local
- [ ] **5.8** Validar funcionalidades críticas
- [ ] **5.9** Crear commit con todos los cambios

---

## 🚨 **Errores Críticos Identificados**

### **Error Actual:**
```bash
ERROR: 42703: column "metric_name" does not exist
```

**Causa:** La tabla `system_metrics` no existe o tiene un esquema diferente  
**Solución:** Verificar esquema actual y corregir migración

### **Otros Errores Conocidos:**
- Props `variant` no soportados en componentes UI
- Imports de framer-motion faltantes
- Tipos Supabase desactualizados
- Variables duplicadas en componentes

---

## 📊 **Progreso General**

| Fase | Tareas Totales | Completadas | Pendientes | Progreso |
|------|---------------|-------------|------------|----------|
| **Fase 1: BD** | 9 | 0 | 9 | 0% |
| **Fase 2: TS** | 19 | 0 | 19 | 0% |
| **Fase 3: Android** | 6 | 0 | 6 | 0% |
| **Fase 4: Testing** | 7 | 0 | 7 | 0% |
| **Fase 5: Integración** | 9 | 0 | 9 | 0% |
| **TOTAL** | **50** | **0** | **50** | **0%** |

---

## 🔄 **Próximos Pasos Inmediatos**

1. **🚨 URGENTE:** Corregir error de `column "metric_name" does not exist`
2. Verificar esquema actual de Supabase
3. Corregir migración SQL
4. Ejecutar migración correctamente
5. Regenerar tipos TypeScript
6. Continuar con correcciones TypeScript

---

*Última actualización: 24/09/2025 21:18*  
*Estado: Iniciando Fase 1 - Corrección de Base de Datos*
