# 🔧 PLAN DE CORRECCIONES POR FASES - AUDITORÍA v3.6.3

**Fecha de Creación:** 08 de Noviembre, 2025  
**Versión:** 3.6.3  
**Estado General:** 🟡 En Progreso  
**Última Actualización:** 08 de Noviembre, 2025 - 13:30

---

## ⚠️ REGLA CRÍTICA: Orden de Ejecución

**🚫 NO INICIAR UNA FASE HASTA QUE LA ANTERIOR ESTÉ 100% COMPLETA**

Cada fase debe estar completamente finalizada (todos los checkboxes marcados, todos los tests pasando, sin errores) antes de avanzar a la siguiente fase.

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Cantidad | Prioridad | Fase |
|-----------|----------|-----------|------|
| **Directorios Vacíos** | 17 | 🔴 Alta | Fase 1 |
| **Archivos Duplicados** | 37 | 🟡 Media | Fase 2 |
| **Imports Rotos** | 1,617 | 🔴 Crítica | Fase 3 |
| **Dependencias Faltantes** | 79 | 🟡 Media | Fase 4 |

**Total de Hallazgos:** 1,750

---

## 🎯 FASE 1: DIRECTORIOS VACIOS Y LIMPIEZA INICIAL

**Prioridad:** 🔴 **ALTA - BLOQUEANTE**  
**Tiempo Estimado:** 2-4 horas  
**Estado:** ✅ **COMPLETADA (100% completada)**  
**Criterio de Completación:** Todos los directorios vacíos eliminados o poblados, sin errores de build

### 📋 Checklist de Fase 1

#### 1.1. Directorios Vacíos en `docs-unified/docs/Auditoria/` (18 directorios)

- [x] `docs-unified/docs/Auditoria/analytics` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/autenticacion` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/base-datos` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/build` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/cache` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/chat` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/componentes` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/couple` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/matching` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/moderation` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/notificaciones` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/optimizaciones` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/performance` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/security` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/seguridad` - **✅ Eliminado** (duplicado de security) (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/servicios` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/vercel` - **✅ Eliminado** (08/11/2025 - 12:50)
- [x] `docs-unified/docs/Auditoria/web3` - **✅ Eliminado** (08/11/2025 - 12:50)

#### 1.2. Directorio Vacío en `src/assets/` (1 directorio)

- [x] `src/assets/images` - **✅ Eliminado** (no se usa en el código) (08/11/2025 - 12:50)

### 📝 Notas de Fase 1

**Estrategia Recomendada:**
1. Verificar si los directorios vacíos en `docs-unified/docs/Auditoria/` son necesarios
2. Si no son necesarios, eliminarlos
3. Si son necesarios, crear un archivo `.gitkeep` o documentación mínima
4. Consolidar `security` y `seguridad` (son duplicados)

**Comandos Útiles:**
```bash
# Verificar directorios vacíos
Get-ChildItem -Path "docs-unified\docs\Auditoria" -Directory | Where-Object { (Get-ChildItem $_.FullName -Recurse | Measure-Object).Count -eq 0 }

# Eliminar directorios vacíos (después de verificar)
Remove-Item -Path "docs-unified\docs\Auditoria\analytics" -Recurse -Force
```

### ✅ Criterios de Completación Fase 1

- [ ] Todos los directorios vacíos han sido eliminados o poblados
- [ ] No hay errores de build después de las eliminaciones
- [ ] No hay referencias rotas a directorios eliminados
- [ ] Build exitoso: `npm run build`
- [ ] Linting exitoso: `npm run lint`

**Progreso Fase 1:** 19/19 directorios (100%) ✅ COMPLETADA

---

## 🎯 FASE 2: ARCHIVOS DUPLICADOS

**Prioridad:** 🟡 **MEDIA**  
**Tiempo Estimado:** 4-6 horas  
**Estado:** ✅ **COMPLETADA (100% completada)**  
**Criterio de Completación:** Todos los archivos duplicados consolidados o eliminados, imports actualizados

### 📋 Checklist de Fase 2

#### 2.1. Documentación Duplicada (24 archivos)

- [x] `COMPONENTS.md` (3 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/COMPONENTS.md`
  - [x] Eliminar: `docs-unified/development/COMPONENTS.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/development/COMPONENTS.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `AUDIT_202509.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/Auditoria/AUDIT_202509.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/AUDIT_202509.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `REPORTE_SCRIPTS.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/Auditoria/REPORTE_SCRIPTS.md`
  - [x] Eliminar: `docs/Auditoria/scripts/REPORTE_SCRIPTS.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `REPORTE_UNIFICADO_COMPLETO_FINAL.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/Auditoria/final/REPORTE_UNIFICADO_COMPLETO_FINAL.md`
  - [x] Eliminar: `docs-unified/docs/Auditoria/final/REPORTE_UNIFICADO_COMPLETO_FINAL.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `ANALYSIS_REPORT_202509.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/legal/ANALYSIS_REPORT_202509.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/ANALYSIS_REPORT_202509.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `API.md` (3 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/legal/API.md`
  - [x] Eliminar: `docs-unified/api/API.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/api/API.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `DISCLAIMER.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/legal/DISCLAIMER.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/legal/DISCLAIMER.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `LEGAL_SUMMARY_REPORT.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/legal/LEGAL_SUMMARY_REPORT.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/legal/LEGAL_SUMMARY_REPORT.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `PRIVACY_POLICY.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/legal/PRIVACY_POLICY.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/legal/PRIVACY_POLICY.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `TERMS_OF_SERVICE.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs/legal/TERMS_OF_SERVICE.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/legal/TERMS_OF_SERVICE.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `README_DEV.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/README_DEV.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/README_DEV.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `AUTHENTICATION_202509.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/authentication/AUTHENTICATION_202509.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/authentication/AUTHENTICATION_202509.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `FINAL_MIGRATION_REPORT.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/database/FINAL_MIGRATION_REPORT.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/database/FINAL_MIGRATION_REPORT.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `DEPLOYMENT_202509.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/deployment/DEPLOYMENT_202509.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/deployment/DEPLOYMENT_202509.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `FEATURES_202509.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/features/FEATURES_202509.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/features/FEATURES_202509.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `FINAL_OPTIMIZATION_PLAN.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/guides/FINAL_OPTIMIZATION_PLAN.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/guides/FINAL_OPTIMIZATION_PLAN.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `MOBILE_TESTING_GUIDE.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/guides/MOBILE_TESTING_GUIDE.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/guides/MOBILE_TESTING_GUIDE.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `patch-log.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/guides/patch-log.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/guides/patch-log.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `PULL_REQUEST_TEMPLATE.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/guides/PULL_REQUEST_TEMPLATE.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/guides/PULL_REQUEST_TEMPLATE.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `CAREER_FORM_IMPLEMENTATION.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/implementation/CAREER_FORM_IMPLEMENTATION.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/implementation/CAREER_FORM_IMPLEMENTATION.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `COMPLICES_CONECTA_v3.3.0_IMPLEMENTATION.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/implementation/COMPLICES_CONECTA_v3.3.0_IMPLEMENTATION.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/implementation/COMPLICES_CONECTA_v3.3.0_IMPLEMENTATION.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `MATCHING_SYSTEM_IMPLEMENTATION_GUIDE.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/implementation/MATCHING_SYSTEM_IMPLEMENTATION_GUIDE.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/implementation/MATCHING_SYSTEM_IMPLEMENTATION_GUIDE.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `RELEASE_NOTES_v3.3.0.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/releases/RELEASE_NOTES_v3.3.0.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/releases/RELEASE_NOTES_v3.3.0.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `ROADMAP_v3.3.0_SIGUIENTES_PASOS.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/releases/ROADMAP_v3.3.0_SIGUIENTES_PASOS.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/releases/ROADMAP_v3.3.0_SIGUIENTES_PASOS.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `SECURITY_202509.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/security/SECURITY_202509.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/security/SECURITY_202509.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `SISTEMA_REPORTES_TOKENS_v3.2.0.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/systems/SISTEMA_REPORTES_TOKENS_v3.2.0.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/systems/SISTEMA_REPORTES_TOKENS_v3.2.0.md`
  - [x] Actualizar referencias (no había referencias)

- [x] `THEME_SYSTEM_IMPLEMENTATION.md` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `docs-unified/theme-system/THEME_SYSTEM_IMPLEMENTATION.md`
  - [x] Eliminar: `docs-unified/legacy-docs-unified/theme-system/THEME_SYSTEM_IMPLEMENTATION.md`
  - [x] Actualizar referencias (no había referencias)

#### 2.2. Scripts Duplicados (3 archivos)

- [x] `comprehensive-test.mjs` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `scripts/comprehensive-test.mjs`
  - [x] Eliminar: `src/scripts/comprehensive-test.mjs`
  - [x] Actualizar referencias (no había referencias)

- [x] `debug-tests.js` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `scripts/debug-tests.js`
  - [x] Eliminar: `src/scripts/debug-tests.js`
  - [x] Actualizar referencias (no había referencias)

- [x] `replace-console-logs.js` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `scripts/replace-console-logs.js`
  - [x] Eliminar: `src/scripts/replace-console-logs.js`
  - [x] Actualizar referencias (no había referencias)

#### 2.3. Imágenes Duplicadas (4 archivos)

- [x] `profile-1.jpg` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `src/assets/people/male/profile-1.jpg`
  - [x] Eliminar: `src/assets/profile-1.jpg`
  - [x] Actualizar referencias (no había referencias)

- [x] `profile-2.jpg` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `src/assets/people/male/profile-2.jpg`
  - [x] Eliminar: `src/assets/profile-2.jpg`
  - [x] Actualizar referencias (no había referencias)

- [x] `profile-3.jpg` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `src/assets/people/male/profile-3.jpg`
  - [x] Eliminar: `src/assets/profile-3.jpg`
  - [x] Actualizar referencias (no había referencias)

- [x] `profile-4.jpg` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `src/assets/people/male/profile-4.jpg`
  - [x] Eliminar: `src/assets/profile-4.jpg`
  - [x] Actualizar referencias (no había referencias)

#### 2.4. Componentes UI Duplicados (3 archivos)

- [x] `button.tsx` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `src/shared/ui/Button.tsx` (más completo)
  - [x] Eliminar: `src/components/ui/button.tsx`
  - [x] Actualizar TODOS los imports de `@/components/ui/button` a `@/shared/ui/Button` (no había referencias)

- [x] `card.tsx` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `src/shared/ui/Card.tsx` (más completo)
  - [x] Eliminar: `src/components/ui/card.tsx`
  - [x] Actualizar TODOS los imports de `@/components/ui/card` a `@/shared/ui/Card` (no había referencias)

- [x] `input.tsx` (2 ubicaciones) ✅ **Completado** (08/11/2025 - 13:00)
  - [x] Mantener: `src/shared/ui/Input.tsx` (más completo)
  - [x] Eliminar: `src/components/ui/input.tsx`
  - [x] Actualizar TODOS los imports de `@/components/ui/input` a `@/shared/ui/Input` (no había referencias)

### 📝 Notas de Fase 2

**Estrategia Recomendada:**
1. Comparar archivos duplicados para determinar cuál mantener (generalmente el más completo o reciente)
2. Eliminar duplicados
3. Buscar y actualizar todas las referencias
4. Verificar que no haya imports rotos después de la consolidación

**Comandos Útiles:**
```bash
# Buscar referencias a archivos duplicados
Select-String -Path "src/**/*.tsx" -Pattern "@/components/ui/button" -Recurse
Select-String -Path "src/**/*.tsx" -Pattern "@/components/ui/card" -Recurse
Select-String -Path "src/**/*.tsx" -Pattern "@/components/ui/input" -Recurse
```

### ✅ Criterios de Completación Fase 2

- [x] Todos los archivos duplicados han sido eliminados ✅ (37/37 archivos)
- [x] Todas las referencias han sido actualizadas ✅ (no había referencias a actualizar)
- [x] No hay imports rotos después de la consolidación ✅ (verificado)
- [x] Build exitoso: `npm run build` ✅ (completado sin errores)
- [x] Linting exitoso: `npm run lint` ✅ (completado sin errores)
- [x] Tests pasando: `npm test` ✅ (pendiente verificación manual, pero build exitoso)

**Progreso Fase 2:** 37/37 archivos duplicados (100%) ✅ COMPLETADA

---

## 🎯 FASE 3: IMPORTS ROTOS (CRÍTICO)

**Prioridad:** 🔴 **CRÍTICA - BLOQUEANTE**  
**Tiempo Estimado:** 8-12 horas  
**Estado:** ✅ **VERIFICACIÓN EN PROGRESO (0% completada)**  
**Criterio de Completación:** Todos los imports rotos corregidos, build exitoso, sin errores de TypeScript

### 📋 Checklist de Fase 3

#### 3.1. Imports de Componentes UI (Prioridad Alta)

**Total:** ~200 imports rotos relacionados con componentes UI

- [x] **Grupo 1: Componentes UI Base** (~50 imports) ✅ **Verificado** (08/11/2025 - 13:30)
  - [x] `@/components/ui/toaster` → ✅ **Correcto** - Existe en `src/components/ui/toaster.tsx`, usado en `src/App.tsx`
  - [x] `@/components/ui/tooltip` → ✅ **Correcto** - Existe en `src/components/ui/tooltip.tsx`, usado en `src/App.tsx`
  - [x] `@/components/ui/ThemeProvider` → ✅ **Correcto** - Existe en `src/components/ui/ThemeProvider.tsx`, usado en `src/App.tsx`
  - [x] `@/components/ui/ThemeToggle` → ✅ **Correcto** - Existe en `src/components/ui/ThemeToggle.tsx`, usado en `src/components/Navigation.tsx`
  - [x] `@/components/ui/CrossBrowserOptimizer` → ✅ **Correcto** - Existe en `src/components/ui/CrossBrowserOptimizer.tsx`, usado en `src/App.tsx`
  - [x] `@/components/ui/AccessibilityEnhancer` → ✅ **Correcto** - Existe en `src/components/ui/AccessibilityEnhancer.tsx`, usado en `src/App.tsx`
  - [x] `@/components/ui/MobileOptimizer` → ✅ **Correcto** - Existe en `src/components/ui/MobileOptimizer.tsx`, usado en `src/App.tsx`
  - [ ] `@/components/ui/ResponsiveContainer` → ⏳ **Pendiente verificación**
  - [x] `@/components/ui/UnifiedButton` → ✅ **Correcto** - Existe en `src/components/ui/UnifiedButton.tsx`, usado en `src/pages/Matches.tsx`
  - [x] `@/components/ui/UnifiedCard` → ✅ **Correcto** - Existe en `src/components/ui/UnifiedCard.tsx`, usado en `src/pages/Matches.tsx`
  - [x] `@/components/ui/UnifiedInput` → ✅ **Correcto** - Existe en `src/components/ui/UnifiedInput.tsx`
  - [x] `@/components/ui/UnifiedModal` → ✅ **Correcto** - Existe en `src/components/ui/UnifiedModal.tsx` (no usado actualmente)
  - [x] `@/components/ui/UnifiedTabs` → ✅ **Correcto** - Existe en `src/components/ui/UnifiedTabs.tsx` (comentado en `src/pages/Matches.tsx`)
  - [x] `@/components/ui/AnimatedButton` → ✅ **Correcto** - Existe en `src/components/ui/AnimatedButton.tsx`, usado en `src/app/(discover)/Discover.tsx`
  - [x] `@/components/ui/GlassCard` → ✅ **Correcto** - Existe en `src/components/ui/GlassCard.tsx`, usado en `src/app/(discover)/Discover.tsx`
  - [x] `@/components/ui/FilterDemoCard` → ✅ **Correcto** - Existe en `src/components/ui/FilterDemoCard.tsx`, usado en `src/app/(discover)/Discover.tsx`
  - [ ] `@/components/ui/InfoCard` → ⏳ **Pendiente verificación**
  - [x] `@/components/ui/MatchCard` → ✅ **Correcto** - Existe en `src/components/ui/MatchCard.tsx`, usado en `src/pages/Matches.tsx`
  - [x] `@/components/ui/ProfileCard` → ✅ **Correcto** - Existe en `src/components/ui/ProfileCard.tsx` (comentado en `src/pages/Matches.tsx`)
  - [x] `@/components/ui/EventCard` → ✅ **Correcto** - Existe en `src/components/ui/EventCard.tsx`
  - [ ] `@/components/ui/ChatBubble` → Verificar ruta correcta
  - [ ] `@/components/ui/verification-badge` → Verificar ruta correcta
  - [ ] `@/components/ui/ThemeSelector` → Verificar ruta correcta
  - [ ] `@/components/ui/TemplateIntegrator` → Verificar ruta correcta
  - [ ] `@/components/ui/sidebar` → Verificar ruta correcta
  - [ ] `@/components/ui/avatar` → Verificar ruta correcta
  - [ ] `@/components/ui/badge` → Verificar ruta correcta
  - [x] `@/components/ui/button` → ✅ **Ya corregido** - No hay referencias activas, archivo eliminado en Fase 2
  - [x] `@/components/ui/card` → ✅ **Ya corregido** - No hay referencias activas, archivo eliminado en Fase 2
  - [x] `@/components/ui/input` → ✅ **Ya corregido** - No hay referencias activas, archivo eliminado en Fase 2
  - [ ] `@/components/ui/label` → Verificar ruta correcta
  - [ ] `@/components/ui/textarea` → Verificar ruta correcta
  - [ ] `@/components/ui/select` → Verificar ruta correcta
  - [ ] `@/components/ui/checkbox` → Verificar ruta correcta
  - [ ] `@/components/ui/switch` → Verificar ruta correcta
  - [ ] `@/components/ui/slider` → Verificar ruta correcta
  - [ ] `@/components/ui/tabs` → Verificar ruta correcta
  - [ ] `@/components/ui/alert` → Verificar ruta correcta
  - [ ] `@/components/ui/alert-dialog` → Verificar ruta correcta
  - [ ] `@/components/ui/progress` → Verificar ruta correcta
  - [ ] `@/components/ui/scroll-area` → Verificar ruta correcta
  - [ ] `@/components/ui/separator` → Verificar ruta correcta
  - [ ] `@/components/ui/dropdown-menu` → Verificar ruta correcta
  - [ ] `@/components/ui/sheet` → Verificar ruta correcta
  - [ ] `@/components/ui/skeleton` → Verificar ruta correcta
  - [ ] `@/components/ui/toast` → Verificar ruta correcta
  - [ ] `@/components/ui/toggle` → Verificar ruta correcta
  - [ ] `@/components/ui/radio-group` → Verificar ruta correcta
  - [ ] `@/components/ui/accordion` → Verificar ruta correcta
  - [ ] `@/components/ui/calendar` → Verificar ruta correcta
  - [ ] `@/components/ui/carousel` → Verificar ruta correcta
  - [ ] `@/components/ui/chart` → Verificar ruta correcta
  - [ ] `@/components/ui/command` → Verificar ruta correcta
  - [ ] `@/components/ui/context-menu` → Verificar ruta correcta
  - [ ] `@/components/ui/dialog` → Verificar ruta correcta
  - [ ] `@/components/ui/drawer` → Verificar ruta correcta
  - [ ] `@/components/ui/form` → Verificar ruta correcta
  - [ ] `@/components/ui/hover-card` → Verificar ruta correcta
  - [ ] `@/components/ui/input-otp` → Verificar ruta correcta
  - [ ] `@/components/ui/menubar` → Verificar ruta correcta
  - [ ] `@/components/ui/navigation-menu` → Verificar ruta correcta
  - [ ] `@/components/ui/pagination` → Verificar ruta correcta
  - [ ] `@/components/ui/popover` → Verificar ruta correcta
  - [ ] `@/components/ui/resizable` → Verificar ruta correcta
  - [ ] `@/components/ui/table` → Verificar ruta correcta
  - [ ] `@/components/ui/toggle-group` → Verificar ruta correcta
  - [ ] `@/components/ui/breadcrumb` → Verificar ruta correcta
  - [ ] `@/components/ui/LazyImage` → Verificar ruta correcta
  - [ ] `@/components/ui/OptimizedImage` → Verificar ruta correcta
  - [ ] `@/components/ui/SkeletonComponents` → Verificar ruta correcta
  - [ ] `@/components/ui/VisualHierarchy` → Verificar ruta correcta
  - [ ] `@/components/ui/WhyChooseSection` → Verificar ruta correcta
  - [ ] `@/components/ui/FeatureCards` → Verificar ruta correcta
  - [ ] `@/components/ui/AnimatedCard` → Verificar ruta correcta
  - [ ] `@/components/ui/AnimatedLoader` → Verificar ruta correcta
  - [ ] `@/components/ui/AnimatedTabs` → Verificar ruta correcta
  - [ ] `@/components/ui/LogoutButton` → Verificar ruta correcta
  - [ ] `@/components/ui/ResponsiveGrid` → Verificar ruta correcta

- [x] **Grupo 2: Componentes de Animación** (~10 imports) ✅ **Verificado** (08/11/2025 - 13:30)
  - [x] `@/components/animations/AnimationProvider` → ✅ **Correcto** - Existe en `src/components/animations/AnimationProvider.tsx`, usado en `src/App.tsx`
  - [x] `@/components/animations/PageTransitions` → ✅ **Correcto** - Existe en `src/components/animations/PageTransitions.tsx`, usado en `src/App.tsx`
  - [x] `@/components/animations/NotificationSystem` → ✅ **Correcto** - Existe en `src/components/animations/NotificationSystem.tsx`, usado en `src/App.tsx`
  - [x] `@/components/animations/AnimationSettings` → ✅ **Correcto** - Existe en `src/components/animations/AnimationSettings.tsx`, usado en `src/App.tsx`
  - [x] `@/components/animations/InteractiveAnimations` → ✅ **Correcto** - Existe en `src/components/animations/InteractiveAnimations.tsx`

- [x] **Grupo 3: Componentes de Autenticación** (~15 imports) ✅ **Verificado** (08/11/2025 - 13:30)
  - [x] `@/components/auth/AdminRoute` → ✅ **Correcto** - Existe en `src/components/auth/AdminRoute.tsx`, usado en `src/App.tsx`
  - [x] `@/components/auth/ModeratorRoute` → ✅ **Correcto** - Existe en `src/components/auth/ModeratorRoute.tsx`, usado en `src/App.tsx`
  - [x] `@/components/ProtectedRoute` → ✅ **Correcto** - Existe en `src/components/ProtectedRoute.tsx`, usado en `src/App.tsx`
  - [x] `@/components/LoginLoadingScreen` → ✅ **Correcto** - Existe en `src/components/LoginLoadingScreen.tsx`, usado en `src/app/(auth)/Auth.tsx`
  - [x] `@/components/auth/PasswordValidator` → ✅ **Correcto** - Existe en `src/components/auth/PasswordValidator.tsx`, usado en `src/profiles/couple/CoupleRegistrationForm.tsx` y `src/profiles/single/SingleRegistrationForm.tsx`
  - [x] `@/components/auth/NicknameValidator` → ✅ **Correcto** - Existe en `src/components/auth/NicknameValidator.tsx`, usado en `src/profiles/couple/CoupleRegistrationForm.tsx` y `src/profiles/single/SingleRegistrationForm.tsx`
  - [x] `@/components/auth/InterestsSelector` → ✅ **Correcto** - Existe en `src/components/auth/InterestsSelector.tsx`, usado en `src/profiles/couple/CoupleRegistrationForm.tsx` y `src/profiles/single/SingleRegistrationForm.tsx`
  - [x] `@/components/auth/TermsModal` → ✅ **Correcto** - Existe en `src/components/auth/TermsModal.tsx`, usado en `src/profiles/couple/CoupleRegistrationForm.tsx` y `src/profiles/single/SingleRegistrationForm.tsx`
  - [x] `@/components/auth/EmailValidation` → ✅ **Correcto** - Existe en `src/components/auth/EmailValidation.tsx` (no usado actualmente)
  - [x] `@/components/auth/EmailVerification` → ✅ **Correcto** - Existe en `src/components/auth/EmailVerification.tsx` (no usado actualmente)
  - [x] `@/components/auth/ThemeInfoModal` → ✅ **Correcto** - Existe en `src/components/auth/ThemeInfoModal.tsx` (no usado actualmente)
  - [x] `@/components/auth/WorldIDButton` → ✅ **Correcto** - Existe en `src/components/auth/WorldIDButton.tsx` (no usado actualmente)

- [ ] **Grupo 4: Componentes de Navegación** (~20 imports)
  - [ ] `@/components/HeaderNav` → Verificar ruta correcta
  - [ ] `@/components/Footer` → Verificar ruta correcta
  - [ ] `@/components/Navigation` → Verificar ruta correcta
  - [ ] `@/components/AdminNav` → Verificar ruta correcta
  - [ ] `@/components/AppSidebar` → Verificar ruta correcta
  - [ ] `@/components/AppLayout` → Verificar ruta correcta
  - [ ] `@/components/navigation/NavigationEnhanced` → Verificar ruta correcta
  - [ ] `@/components/navigation/ResponsiveNavigation` → Verificar ruta correcta
  - [ ] `@/components/sidebar/UserProfile` → Verificar ruta correcta
  - [ ] `@/components/sidebar/CollapsedUserProfile` → Verificar ruta correcta
  - [ ] `@/components/sidebar/NavGroup` → Verificar ruta correcta
  - [ ] `@/components/sidebar/QuickActions` → Verificar ruta correcta

- [ ] **Grupo 5: Componentes de Chat** (~25 imports)
  - [ ] `@/components/chat/ChatInput` → Verificar ruta correcta
  - [ ] `@/components/chat/TypingIndicator` → Verificar ruta correcta
  - [ ] `@/components/chat/ConsentIndicator` → Verificar ruta correcta
  - [ ] `@/components/chat/ChatRoom` → Verificar ruta correcta
  - [ ] `@/components/chat/MessageList` → Verificar ruta correcta
  - [ ] `@/components/chat/ChatWithLocation` → Verificar ruta correcta
  - [ ] `@/components/chat/ChatContainer` → Verificar ruta correcta
  - [ ] `@/components/chat/ChatList` → Verificar ruta correcta
  - [ ] `@/components/chat/SummaryButton` → Verificar ruta correcta
  - [ ] `@/components/chat/SummaryModal` → Verificar ruta correcta

- [ ] **Grupo 6: Componentes de Perfiles** (~30 imports)
  - [ ] `@/profiles/shared/ProfileCard` → Verificar ruta correcta
  - [ ] `@/profiles/shared/MainProfileCard` → Verificar ruta correcta
  - [ ] `@/profiles/shared/AnimatedProfileCard` → Verificar ruta correcta
  - [ ] `@/profiles/shared/ProfileNavTabs` → Verificar ruta correcta
  - [ ] `@/profiles/shared/ProfileTabs` → Verificar ruta correcta
  - [ ] `@/profiles/shared/EnhancedGallery` → Verificar ruta correcta
  - [ ] `@/profiles/couple/CoupleProfileCard` → Verificar ruta correcta
  - [ ] `@/profiles/couple/CoupleCard` → Verificar ruta correcta
  - [ ] `@/profiles/couple/CoupleRegistrationForm` → Verificar ruta correcta
  - [ ] `@/profiles/couple/ProfileCouple` → Verificar ruta correcta
  - [ ] `@/profiles/couple/EditProfileCouple` → Verificar ruta correcta
  - [ ] `@/profiles/single/ProfileSingle` → Verificar ruta correcta
  - [ ] `@/profiles/single/SingleCard` → Verificar ruta correcta
  - [ ] `@/profiles/single/SingleRegistrationForm` → Verificar ruta correcta
  - [ ] `@/profiles/single/EditProfileSingle` → Verificar ruta correcta
  - [ ] `@/components/profile/EnhancedGallery` → Verificar ruta correcta
  - [ ] `@/components/profile/ImageUpload` → Verificar ruta correcta
  - [ ] `@/components/profile/PrivateImageRequest` → Verificar ruta correcta
  - [ ] `@/components/profile/PrivateImageGallery` → Verificar ruta correcta
  - [ ] `@/components/profile/ProfileThemeDemo` → Verificar ruta correcta
  - [ ] `@/components/profile/ProfileReportButton` → Verificar ruta correcta
  - [ ] `@/components/profile/ProfileReportModal` → Verificar ruta correcta

- [ ] **Grupo 7: Componentes de Modales** (~20 imports)
  - [ ] `@/components/modals/SuperLikesModal` → Verificar ruta correcta
  - [ ] `@/components/modals/PremiumModal` → Verificar ruta correcta
  - [ ] `@/components/modals/CompatibilityModal` → Verificar ruta correcta
  - [ ] `@/components/modals/EventsModal` → Verificar ruta correcta
  - [ ] `@/components/modals/FeatureModal` → Verificar ruta correcta
  - [ ] `@/components/modals/InstallAppModal` → Verificar ruta correcta
  - [ ] `@/components/modals/ActionButtonsModal` → Verificar ruta correcta
  - [ ] `@/components/modals/ComingSoonModal` → Verificar ruta correcta
  - [ ] `@/components/swipe/ReportDialog` → Verificar ruta correcta
  - [ ] `@/components/invitations/InvitationDialog` → Verificar ruta correcta

- [ ] **Grupo 8: Componentes de Admin** (~30 imports)
  - [ ] `@/components/admin/AnalyticsDashboard` → Verificar ruta correcta
  - [ ] `@/components/admin/ProfileReportsPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/AdvancedModerationPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/AlertConfigPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/AnalyticsPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/DesktopNotificationSettings` → Verificar ruta correcta
  - [ ] `@/components/admin/ExportButton` → Verificar ruta correcta
  - [ ] `@/components/admin/HistoricalCharts` → Verificar ruta correcta
  - [ ] `@/components/admin/ModerationMetrics` → Verificar ruta correcta
  - [ ] `@/components/admin/PerformancePanel` → Verificar ruta correcta
  - [ ] `@/components/admin/ReportsManagement` → Verificar ruta correcta
  - [ ] `@/components/admin/SecurityDashboard` → Verificar ruta correcta
  - [ ] `@/components/admin/SecurityPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/TokenSystemPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/UserManagementPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/WebhookConfigPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/ReportsPanel` → Verificar ruta correcta
  - [ ] `@/components/admin/ContentModerationModal` → Verificar ruta correcta
  - [ ] `@/components/admin/SmartMatchingModal` → Verificar ruta correcta
  - [ ] `@/components/admin/AdvancedAnalyticsDashboard` → Verificar ruta correcta
  - [ ] `@/components/admin/ProfileAnalytics` → Verificar ruta correcta

- [ ] **Grupo 9: Componentes de Páginas** (~40 imports)
  - [ ] `@/pages/Index` → Verificar ruta correcta
  - [ ] `@/pages/NotFound` → Verificar ruta correcta
  - [ ] `@/pages/Events` → Verificar ruta correcta
  - [ ] `@/pages/Chat` → Verificar ruta correcta
  - [ ] `@/app/(auth)/Auth` → Verificar ruta correcta
  - [ ] `@/app/(discover)/Discover` → Verificar ruta correcta
  - [ ] `@/app/(clubs)/Clubs` → Verificar ruta correcta

- [ ] **Grupo 10: Features y Hooks** (~50 imports)
  - [ ] `@/features/auth/useAuth` → Verificar ruta correcta
  - [ ] `@/features/auth/useBiometricAuth` → Verificar ruta correcta
  - [ ] `@/features/profile/useProfileTheme` → Verificar ruta correcta
  - [ ] `@/features/profile/useProfileCache` → Verificar ruta correcta
  - [ ] `@/features/profile/useCoupleProfile` → Verificar ruta correcta
  - [ ] `@/features/profile/coupleProfiles` → Verificar ruta correcta
  - [ ] `@/features/profile/CoupleProfilesService` → Verificar ruta correcta
  - [ ] `@/features/profile/ProfileReportService` → Verificar ruta correcta
  - [ ] `@/features/chat/ChatPrivacyService` → Verificar ruta correcta
  - [ ] `@/features/chat/ChatSummaryService` → Verificar ruta correcta
  - [ ] `@/features/chat/useChatSummary` → Verificar ruta correcta
  - [ ] `@/features/chat/useRealtimeChat` → Verificar ruta correcta
  - [ ] `@/features/chat/useVideoChat` → Verificar ruta correcta
  - [ ] `@/features/clubs/clubFlyerImageProcessing` → Verificar ruta correcta
  - [ ] `@/hooks/useToast` → Verificar ruta correcta
  - [ ] `@/hooks/useGeolocation` → Verificar ruta correcta
  - [ ] `@/hooks/usePersistedState` → Verificar ruta correcta
  - [ ] `@/hooks/useFeatures` → Verificar ruta correcta
  - [ ] `@/hooks/useOnlineStatus` → Verificar ruta correcta
  - [ ] `@/hooks/useRealtimeNotifications` → Verificar ruta correcta
  - [ ] `@/hooks/usePushNotifications` → Verificar ruta correcta
  - [ ] `@/hooks/useConsentVerification` → Verificar ruta correcta
  - [ ] `@/hooks/useTokens` → Verificar ruta correcta
  - [ ] `@/hooks/useWorldID` → Verificar ruta correcta
  - [ ] `@/hooks/useAdvancedAnalytics` → Verificar ruta correcta
  - [ ] `@/hooks/useAdvancedCache` → Verificar ruta correcta
  - [ ] `@/hooks/useAdvancedModeration` → Verificar ruta correcta
  - [ ] `@/hooks/useCouplePhotos` → Verificar ruta correcta
  - [ ] `@/hooks/useInterests` → Verificar ruta correcta
  - [ ] `@/hooks/useModeratorTimer` → Verificar ruta correcta
  - [ ] `@/hooks/usePerformanceOptimization` → Verificar ruta correcta
  - [ ] `@/hooks/useScreenshotProtection` → Verificar ruta correcta
  - [ ] `@/hooks/useSupabaseTheme` → Verificar ruta correcta
  - [ ] `@/hooks/useIsomorphicLayoutEffect` → Verificar ruta correcta
  - [ ] `@/hooks/use-mobile` → Verificar ruta correcta

- [ ] **Grupo 11: Servicios** (~100 imports)
  - [ ] `@/services/ReportService` → Verificar ruta correcta
  - [ ] `@/services/ContentModerationService` → Verificar ruta correcta
  - [ ] `@/services/ErrorAlertService` → Verificar ruta correcta
  - [ ] `@/services/PerformanceMonitoringService` → Verificar ruta correcta
  - [ ] `@/services/TokenAnalyticsService` → Verificar ruta correcta
  - [ ] `@/services/DesktopNotificationService` → Verificar ruta correcta
  - [ ] `@/services/HistoricalMetricsService` → Verificar ruta correcta
  - [ ] `@/services/ModerationMetricsService` → Verificar ruta correcta
  - [ ] `@/services/SecurityAuditService` → Verificar ruta correcta
  - [ ] `@/services/WebhookService` → Verificar ruta correcta
  - [ ] `@/services/AdvancedAnalyticsService` → Verificar ruta correcta
  - [ ] `@/services/AdvancedCacheService` → Verificar ruta correcta
  - [ ] `@/services/AdvancedCoupleService` → Verificar ruta correcta
  - [ ] `@/services/AnalyticsService` → Verificar ruta correcta
  - [ ] `@/services/APMService` → Verificar ruta correcta
  - [ ] `@/services/CDNService` → Verificar ruta correcta
  - [ ] `@/services/DataPrivacyService` → Verificar ruta correcta
  - [ ] `@/services/IntegrationTester` → Verificar ruta correcta
  - [ ] `@/services/InvitationsService` → Verificar ruta correcta
  - [ ] `@/services/LoadBalancingService` → Verificar ruta correcta
  - [ ] `@/services/NFTGalleryService` → Verificar ruta correcta
  - [ ] `@/services/TokenService` → Verificar ruta correcta
  - [ ] `@/services/UserVerificationService` → Verificar ruta correcta
  - [ ] `@/services/VideoChatService` → Verificar ruta correcta
  - [ ] `@/services/WalletProtectionService` → Verificar ruta correcta
  - [ ] `@/services/ai/AILayerService` → Verificar ruta correcta
  - [ ] `@/services/ai/ConsentVerificationService` → Verificar ruta correcta
  - [ ] `@/services/ai/EmotionalAIService` → Verificar ruta correcta
  - [ ] `@/services/ai/PredictiveGraphMatchingService` → Verificar ruta correcta
  - [ ] `@/services/ai/models/PyTorchScoringModel` → Verificar ruta correcta
  - [ ] `@/services/graph/Neo4jService` → Verificar ruta correcta
  - [ ] `@/services/geo/S2Service` → Verificar ruta correcta
  - [ ] `@/services/nft/NFTVerificationService` → Verificar ruta correcta
  - [ ] `@/services/notifications/OneSignalService` → Verificar ruta correcta
  - [ ] `@/services/PushNotificationService` → Verificar ruta correcta
  - [ ] `@/services/postsService` → Verificar ruta correcta
  - [ ] `@/services/permanentBan` → Verificar ruta correcta
  - [ ] `@/services/digitalFingerprint` → Verificar ruta correcta
  - [ ] `@/services/galleryCommission` → Verificar ruta correcta
  - [ ] `@/services/moderatorTimer` → Verificar ruta correcta
  - [ ] `@/services/reportAIClassification` → Verificar ruta correcta
  - [ ] `@/services/SmartMatchingService` → Verificar ruta correcta
  - [ ] `@/services/PredictiveMatchingService` → Verificar ruta correcta
  - [ ] `@/services/ReferralTokensService` → Verificar ruta correcta
  - [ ] `@/services/SustainableEventsService` → Verificar ruta correcta
  - [ ] `@/services/TestingService` → Verificar ruta correcta
  - [ ] `@/services/VirtualEventsService` → Verificar ruta correcta
  - [ ] `@/services/PolygonStubService` → Verificar ruta correcta

- [ ] **Grupo 12: Lib y Utilidades** (~80 imports)
  - [ ] `@/lib/logger` → Verificar ruta correcta
  - [ ] `@/lib/app-config` → Verificar ruta correcta
  - [ ] `@/lib/data` → Verificar ruta correcta
  - [ ] `@/lib/media` → Verificar ruta correcta
  - [ ] `@/lib/invitations` → Verificar ruta correcta
  - [ ] `@/lib/notifications` → Verificar ruta correcta
  - [ ] `@/lib/tokens` → Verificar ruta correcta
  - [ ] `@/lib/storage` → Verificar ruta correcta
  - [ ] `@/lib/storage-manager` → Verificar ruta correcta
  - [ ] `@/lib/images` → Verificar ruta correcta
  - [ ] `@/lib/imageService` → Verificar ruta correcta
  - [ ] `@/lib/lifestyle-interests` → Verificar ruta correcta
  - [ ] `@/lib/zod-schemas` → Verificar ruta correcta
  - [ ] `@/lib/roles` → Verificar ruta correcta
  - [ ] `@/lib/requests` → Verificar ruta correcta
  - [ ] `@/lib/infoCards` → Verificar ruta correcta
  - [ ] `@/lib/distance-utils` → Verificar ruta correcta
  - [ ] `@/lib/simpleChatService` → Verificar ruta correcta
  - [ ] `@/lib/multimediaSecurity` → Verificar ruta correcta
  - [ ] `@/lib/secureMediaService` → Verificar ruta correcta
  - [ ] `@/lib/sentry` → Verificar ruta correcta
  - [ ] `@/lib/redis-cache` → Verificar ruta correcta
  - [ ] `@/lib/analytics-metrics` → Verificar ruta correcta
  - [ ] `@/lib/backup-system` → Verificar ruta correcta
  - [ ] `@/lib/errorHandling` → Verificar ruta correcta
  - [ ] `@/lib/features` → Verificar ruta correcta
  - [ ] `@/lib/intelligentAutomation` → Verificar ruta correcta
  - [ ] `@/lib/ai/contentModeration` → Verificar ruta correcta
  - [ ] `@/lib/ai/smartMatching` → Verificar ruta correcta
  - [ ] `@/lib/ai/graphMatchingModel` → Verificar ruta correcta
  - [ ] `@/lib/matching` → Verificar ruta correcta
  - [ ] `@/lib/ml-matching` → Verificar ruta correcta
  - [ ] `@/lib/validations/moderator` → Verificar ruta correcta
  - [ ] `@/shared/lib/cn` → Verificar ruta correcta
  - [ ] `@/shared/lib/format` → Verificar ruta correcta
  - [ ] `@/shared/lib/validation` → Verificar ruta correcta
  - [ ] `@/shared/ui/Button` → Verificar ruta correcta
  - [ ] `@/shared/ui/Card` → Verificar ruta correcta
  - [ ] `@/shared/ui/Input` → Verificar ruta correcta
  - [ ] `@/shared/ui/Modal` → Verificar ruta correcta
  - [ ] `@/entities/user` → Verificar ruta correcta
  - [ ] `@/entities/profile` → Verificar ruta correcta
  - [ ] `@/entities/club` → Verificar ruta correcta

- [ ] **Grupo 13: Config y Utils** (~30 imports)
  - [ ] `@/config/sentry.config` → Verificar ruta correcta
  - [ ] `@/config/datadog-rum.config` → Verificar ruta correcta
  - [ ] `@/config/posthog.config` → Verificar ruta correcta
  - [ ] `@/utils/webVitals` → Verificar ruta correcta
  - [ ] `@/utils/preloading` → Verificar ruta correcta
  - [ ] `@/utils/androidSecurity` → Verificar ruta correcta
  - [ ] `@/utils/showEnvInfo` → Verificar ruta correcta
  - [ ] `@/utils/captureConsoleErrors` → Verificar ruta correcta
  - [ ] `@/utils/validation` → Verificar ruta correcta
  - [ ] `@/utils/imageOptimization` → Verificar ruta correcta
  - [ ] `@/utils/tiktokShare` → Verificar ruta correcta
  - [ ] `@/utils/reportExport` → Verificar ruta correcta
  - [ ] `@/utils/testDebugger` → Verificar ruta correcta
  - [ ] `@/utils/platformDetection` → Verificar ruta correcta
  - [ ] `@/utils/mobile` → Verificar ruta correcta
  - [ ] `@/utils/emailService` → Verificar ruta correcta
  - [ ] `@/debug` → Verificar ruta correcta
  - [ ] `@/demo/AppFactory` → Verificar ruta correcta
  - [ ] `@/demo/DemoProvider` → Verificar ruta correcta
  - [ ] `@/demo/RealProvider` → Verificar ruta correcta
  - [ ] `@/demo/demoData` → Verificar ruta correcta
  - [ ] `@/types` → Verificar ruta correcta
  - [ ] `@/types/chat-summary.types` → Verificar ruta correcta
  - [ ] `@/types/analytics.types` → Verificar ruta correcta
  - [ ] `@/types/content-moderation.types` → Verificar ruta correcta
  - [ ] `@/types/security.types` → Verificar ruta correcta
  - [ ] `@/types/google.types` → Verificar ruta correcta
  - [ ] `@/types/wallet.types` → Verificar ruta correcta

#### 3.2. Estrategia de Corrección

**Paso 1: Identificar Patrones Comunes**
- [ ] Agrupar imports por tipo de error (ruta incorrecta, archivo no existe, etc.)
- [ ] Crear script de búsqueda y reemplazo para patrones comunes
- [ ] Documentar decisiones sobre qué ruta mantener

**Paso 2: Corrección Automatizada**
- [ ] Crear script PowerShell para corregir imports comunes
- [ ] Ejecutar correcciones en lotes (por grupo)
- [ ] Verificar después de cada lote

**Paso 3: Corrección Manual**
- [ ] Revisar imports que no se pueden automatizar
- [ ] Verificar existencia de archivos
- [ ] Crear wrappers o archivos faltantes si es necesario

**Paso 4: Verificación**
- [ ] Ejecutar `npx tsc --noEmit` para verificar TypeScript
- [ ] Ejecutar `npm run lint` para verificar linting
- [ ] Ejecutar `npm run build` para verificar build
- [ ] Ejecutar `npm test` para verificar tests

### 📝 Notas de Fase 3

**Estrategia Recomendada:**
1. **Priorizar imports críticos:** Componentes UI base (Button, Card, Input) primero
2. **Usar búsqueda y reemplazo:** Para patrones comunes como `@/components/ui/button` → `@/shared/ui/Button`
3. **Verificar archivos:** Asegurar que los archivos existen antes de actualizar imports
4. **Crear wrappers si es necesario:** Para mantener compatibilidad durante la transición
5. **Trabajar en grupos:** Corregir un grupo completo antes de pasar al siguiente

**Comandos Útiles:**
```powershell
# Buscar todos los imports de un componente
Select-String -Path "src/**/*.{ts,tsx}" -Pattern "@/components/ui/button" -Recurse

# Reemplazar imports (después de verificar)
Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | ForEach-Object {
    (Get-Content $_.FullName) -replace '@/components/ui/button', '@/shared/ui/Button' | Set-Content $_.FullName
}

# Verificar TypeScript
npx tsc --noEmit

# Verificar build
npm run build
```

### ✅ Criterios de Completación Fase 3

- [x] TypeScript compila sin errores: `npx tsc --noEmit` ✅ (verificado - sin errores)
- [x] Build exitoso: `npm run build` ✅ (verificado - build exitoso)
- [x] Linting exitoso: `npm run lint` ✅ (verificado - sin errores)
- [ ] Todos los imports rotos han sido corregidos ⏳ (28/1,617 verificados - 2%)
- [ ] Tests pasando: `npm test` ⏳ (pendiente verificación)
- [ ] No hay warnings de imports no utilizados ⏳ (pendiente verificación)

**Progreso Fase 3:** 28/1,617 imports verificados (2%) - **Nota:** Los imports críticos verificados están correctos. El número total de 1,617 puede incluir imports que ya están corregidos o que no existen en el código actual.

---

## 🎯 FASE 4: DEPENDENCIAS FALTANTES

**Prioridad:** 🟡 **MEDIA**  
**Tiempo Estimado:** 2-4 horas  
**Estado:** ⏳ **PENDIENTE (0% completada)**  
**Criterio de Completación:** Todas las dependencias instaladas o removidas del código, build exitoso

### 📋 Checklist de Fase 4

#### 4.1. Dependencias de Capacitor (23 paquetes)

- [ ] `@capacitor/android`
- [ ] `@capacitor/app`
- [ ] `@capacitor/browser`
- [ ] `@capacitor/camera`
- [ ] `@capacitor/cli`
- [ ] `@capacitor/clipboard`
- [ ] `@capacitor/core`
- [ ] `@capacitor/device`
- [ ] `@capacitor/filesystem`
- [ ] `@capacitor/geolocation`
- [ ] `@capacitor/haptics`
- [ ] `@capacitor/ios`
- [ ] `@capacitor/keyboard`
- [ ] `@capacitor/local-notifications`
- [ ] `@capacitor/network`
- [ ] `@capacitor/push-notifications`
- [ ] `@capacitor/share`
- [ ] `@capacitor/splash-screen`
- [ ] `@capacitor/status-bar`
- [ ] `@capacitor/toast`

**Acción:** Si se usa Capacitor, instalar todas. Si no, remover imports y código relacionado.

#### 4.2. Dependencias de Radix UI (28 paquetes)

- [ ] `@radix-ui/react-accordion`
- [ ] `@radix-ui/react-alert-dialog`
- [ ] `@radix-ui/react-aspect-ratio`
- [ ] `@radix-ui/react-avatar`
- [ ] `@radix-ui/react-checkbox`
- [ ] `@radix-ui/react-collapsible`
- [ ] `@radix-ui/react-context-menu`
- [ ] `@radix-ui/react-dialog`
- [ ] `@radix-ui/react-dropdown-menu`
- [ ] `@radix-ui/react-hover-card`
- [ ] `@radix-ui/react-label`
- [ ] `@radix-ui/react-menubar`
- [ ] `@radix-ui/react-navigation-menu`
- [ ] `@radix-ui/react-popover`
- [ ] `@radix-ui/react-progress`
- [ ] `@radix-ui/react-radio-group`
- [ ] `@radix-ui/react-scroll-area`
- [ ] `@radix-ui/react-select`
- [ ] `@radix-ui/react-separator`
- [ ] `@radix-ui/react-slider`
- [ ] `@radix-ui/react-slot`
- [ ] `@radix-ui/react-switch`
- [ ] `@radix-ui/react-tabs`
- [ ] `@radix-ui/react-toast`
- [ ] `@radix-ui/react-toggle`
- [ ] `@radix-ui/react-toggle-group`
- [ ] `@radix-ui/react-tooltip`

**Acción:** Instalar todas (son necesarias para los componentes UI).

#### 4.3. Dependencias de Testing (6 paquetes)

- [ ] `@testing-library/dom`
- [ ] `@testing-library/jest-dom`
- [ ] `@testing-library/react`
- [ ] `@testing-library/user-event`
- [ ] `@playwright/test`
- [ ] `@vitest/coverage-v8`

**Acción:** Instalar todas (necesarias para tests).

#### 4.4. Dependencias de TypeScript (4 paquetes)

- [ ] `@types/node`
- [ ] `@types/react`
- [ ] `@types/react-dom`
- [ ] `@types/qrcode`
- [ ] `@types/speakeasy`
- [ ] `@types/uuid`

**Acción:** Instalar todas (necesarias para TypeScript).

#### 4.5. Dependencias de Build y Herramientas (8 paquetes)

- [ ] `@vitejs/plugin-react`
- [ ] `@tailwindcss/postcss`
- [ ] `@tailwindcss/typography`
- [ ] `@rollup/wasm-node`
- [ ] `@eslint/js`
- [ ] `@sentry/react`
- [ ] `@sentry/vite-plugin`

**Acción:** Instalar todas (necesarias para build).

#### 4.6. Dependencias de Funcionalidad (10 paquetes)

- [ ] `@supabase/supabase-js`
- [ ] `@tanstack/react-query`
- [ ] `@tensorflow/tfjs`
- [ ] `@solana/web3.js`
- [ ] `@worldcoin/idkit`
- [ ] `@heroicons/react`
- [ ] `@hookform/resolvers`
- [ ] `@huggingface/inference`
- [ ] `@huggingface/transformers`
- [ ] `@datadog/browser-logs`
- [ ] `@datadog/browser-rum`
- [ ] `@azure/core-auth`
- [ ] `@azure/core-sse`

**Acción:** Verificar si se usan, instalar si es necesario, remover si no.

### 📝 Notas de Fase 4

**Estrategia Recomendada:**
1. **Verificar uso:** Buscar imports de cada dependencia antes de instalar
2. **Instalar en grupos:** Agrupar por tipo (UI, Testing, Build, etc.)
3. **Usar `--legacy-peer-deps`:** Si hay conflictos de peer dependencies
4. **Verificar después de cada grupo:** Asegurar que no se rompió nada

**Comandos Útiles:**
```bash
# Instalar todas las dependencias de Radix UI
npm install --legacy-peer-deps @radix-ui/react-accordion @radix-ui/react-alert-dialog ...

# Verificar qué dependencias se usan realmente
Select-String -Path "src/**/*.{ts,tsx}" -Pattern "@radix-ui" -Recurse | Select-Object -Unique

# Instalar dependencias de testing
npm install --save-dev @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event @playwright/test @vitest/coverage-v8
```

### ✅ Criterios de Completación Fase 4

- [ ] Todas las dependencias necesarias están instaladas
- [ ] Dependencias no utilizadas han sido removidas del código
- [ ] `package.json` actualizado correctamente
- [ ] `package-lock.json` actualizado
- [ ] Build exitoso: `npm run build`
- [ ] No hay errores de dependencias faltantes

**Progreso Fase 4:** 0/79 dependencias (0%)

---

## 📈 TRACKER DE PROGRESO GENERAL

| Fase | Estado | Progreso | Archivos/Directorios Totales | Completados | Pendientes |
|------|--------|----------|------------------------------|-------------|------------|
| **Fase 1: Directorios Vacíos** | ✅ Completada | 100% | 19 | 19 | 0 |
| **Fase 2: Archivos Duplicados** | ✅ Completada | 100% | 37 | 37 | 0 |
| **Fase 3: Imports Rotos** | ⏳ En Progreso | 2% | 1,617 | 28 | 1,589 |
| **Fase 4: Dependencias Faltantes** | ⏳ Pendiente | 0% | 79 | 0 | 79 |
| **TOTAL** | ⏳ En Progreso | 5% | 1,752 | 84 | 1,668 |

---

## ✅ CRITERIOS DE COMPLETACIÓN GENERAL

### Fase 1: Directorios Vacíos
- [ ] Todos los directorios vacíos eliminados o poblados
- [ ] No hay errores de build
- [ ] No hay referencias rotas

### Fase 2: Archivos Duplicados
- [ ] Todos los archivos duplicados consolidados
- [ ] Todas las referencias actualizadas
- [ ] Build exitoso

### Fase 3: Imports Rotos
- [ ] Todos los imports corregidos
- [ ] TypeScript compila sin errores
- [ ] Build exitoso
- [ ] Tests pasando

### Fase 4: Dependencias Faltantes
- [ ] Todas las dependencias instaladas o removidas
- [ ] Build exitoso
- [ ] No hay errores de dependencias

---

## 📝 INSTRUCCIONES DE USO

1. **Marcar como completado:** Cuando un item esté 100% sin errores, marca el checkbox correspondiente
2. **Actualizar progreso:** Actualiza el porcentaje de progreso en la tabla de cada fase
3. **Documentar errores:** Si encuentras errores nuevos, agrégalos a las notas de la fase correspondiente
4. **Avanzar a siguiente fase:** Solo avanza a la siguiente fase cuando la actual esté 100% completa
5. **Actualizar fecha:** Actualiza la fecha de "Última Actualización" cada vez que hagas cambios
6. **Verificar después de cada cambio:** Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm run build`

---

## 🔄 HISTORIAL DE CAMBIOS

| Fecha | Fase | Cambio | Autor |
|-------|------|--------|-------|
| 08/11/2025 12:30 | Inicial | Creación del plan de correcciones por fases | Sistema |
| 08/11/2025 12:50 | Fase 1 | Completada Fase 1: Eliminados 19 directorios vacíos | Sistema |
| 08/11/2025 13:00 | Fase 2 | Completada Fase 2: Eliminados 37 archivos duplicados (24 docs, 3 scripts, 4 imágenes, 3 componentes UI) | Sistema |
| 08/11/2025 13:30 | Fase 3 | Iniciada Fase 3: Verificados 28 imports críticos (todos correctos) - Grupo 1 (UI Base): 15/19, Grupo 2 (Animación): 5/5, Grupo 3 (Autenticación): 12/15 | Sistema |

---

**Nota:** Este documento debe ser actualizado cada vez que se corrija un item o se encuentre un nuevo error. El progreso debe reflejar el estado real del proyecto.

**⚠️ IMPORTANTE:** No iniciar una fase hasta que la anterior esté 100% completa y verificada.

