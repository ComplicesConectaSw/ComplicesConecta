# 🔍 PROMPT DE AUDITORÍA TÉCNICA - ComplicesConecta

## 📋 Instrucciones para Auditor Técnico Senior

**Rol:** Arquitecto Senior Fullstack + Auditor Técnico Especialista en React 18, TypeScript estricto, Vite, Supabase, Vitest y Playwright.

**Objetivo:** Aplicar todas las correcciones pendientes descritas en el informe de auditoría técnica, sin romper lógica, flujo ni autenticación, dejando el proyecto en estado 100% listo para producción.

---

## 🔧 INSTRUCCIONES PRINCIPALES

### 🛡️ Seguridad y backups primero

**Antes de cada corrección crea rama Git:**
```bash
git checkout -b fix/audit-<ID>
```

**Haz backup de la carpeta afectada:**
- `src/`, `supabase/`, etc.
- Usa `robocopy` en Windows o `cp -r` en Unix

### 🎯 Acciones a realizar (según el informe):

1. **Migrar localStorage hacia hook centralizado `usePersistedState`**
   - Consolidar todos los accesos directos a localStorage
   - Crear hook centralizado con SSR-safety
   - Mantener compatibilidad con datos existentes

2. **Consolidar componentes ProfileCard en MainProfileCard**
   - Unificar todas las variantes de ProfileCard
   - Crear wrappers de compatibilidad en rutas antiguas
   - Documentar en `fix-log.md` qué archivos quedaron como wrappers

3. **Separar lógica demo/real en hook `useAuthMode`**
   - Centralizar toda la lógica de modo demo vs producción
   - API limpia: `switchToDemo()`, `switchToReal()`, `clearDemoSession()`
   - Persistencia automática del estado

4. **Revisar imports y estandarizar a `@/`**
   - Cambiar todos los imports relativos a alias `@/`
   - Mantener consistencia en todo el proyecto

5. **Corregir migraciones SQL:**
   - Validar si columnas existen antes de crearlas (`is_verified`, `relationship_type`)
   - Reordenar políticas RLS para que nunca fallen
   - Usar bloques condicionales `DO $$` para validación

6. **Revisar archivos duplicados, huérfanos o corruptos**
   - Consolidar, renombrar o eliminar con wrapper de reexport
   - Mantener compatibilidad hacia atrás

7. **Aplicar cambios visuales y de datos del perfil single también en couple**
   - Sincronizar UI entre perfiles single y couple
   - Adaptaciones profesionales (colores, navegación, tabs)

8. **Reemplazar accesos inseguros en hooks**
   - Usar versiones encapsuladas (`usePersistedState`, `useAuthMode`)
   - Eliminar accesos directos a localStorage

---

## 📝 Memoria y trazabilidad

**Guarda todas tus acciones en `fix-log.md`:**
- Fecha y hora de cada corrección
- Problema identificado
- Solución aplicada
- Archivos modificados
- Impacto de la corrección

**Si ocurre un error durante un fix:**
- Si se aplicó bien → continúa
- Si falló → corrige y reintenta
- Documenta el error y la solución

---

## ✅ Validaciones automáticas obligatorias

**Ejecutar después de cada corrección:**
```bash
npx tsc --noEmit          # → sin errores TypeScript
npm run lint              # → sin errores ESLint
npm run test              # → 100% de tests pasando
npm run build             # → build exitoso
```

**Validaciones en Supabase:**
```sql
\d profiles               # → confirmar columna is_verified
SELECT * FROM profiles LIMIT 1;  # → devuelve is_verified
```

---

## 🚫 Reglas estrictas

### ❌ NO HACER:
- Eliminar archivos críticos sin wrapper
- Modificar autenticación real/demo sin respetar flujo
- Romper compatibilidad hacia atrás
- Ignorar errores de TypeScript o SQL

### ✅ SIEMPRE HACER:
- Documentar qué cambiaste en `fix-log.md`
- Respetar TypeScript strict
- Respetar RLS y políticas de seguridad de Supabase
- Crear wrappers de compatibilidad
- Validar que todo funciona antes de continuar

---

## 📑 ENTREGABLES

**Al finalizar, debes dejar en el repo:**

1. **`fix-log.md`** → lista detallada de cambios aplicados
2. **`patches/patch-A<ID>.diff`** → parches por issue crítico
3. **`audit-summary.json`** → resumen parseable de issues corregidos
4. **Wrappers de compatibilidad** en cada archivo renombrado o consolidado
5. **Tests actualizados** que pasen al 100%

---

## 🎯 Objetivo final

**Proyecto ComplicesConecta actualizado a v2.9.0 estable:**
- ✅ Sin errores SQL, lint, build o tests
- ✅ Imports estandarizados con alias `@/`
- ✅ Perfiles single y couple sincronizados visual y funcionalmente
- ✅ RLS seguro y verificado
- ✅ localStorage centralizado y seguro
- ✅ Documentación y logs claros para trazabilidad
- ✅ Componentes consolidados con wrappers de compatibilidad

---

## 🔐 Modo de Ejecución

**Ejecuta ahora en FIX MODE:**
- Seguir el informe `audit-full-report.md`
- Aplicar correcciones una por una
- Validar después de cada cambio
- Documentar todo en `fix-log.md`
- **Sin romper nada existente**

---

## 📋 Tareas Pendientes Específicas

### 📋 Pendiente
- Creación de tests robustos de lint y type-check
- Optimizaciones de performance  
- Feedback de usuarios
- Limpieza manual de snippets en Supabase Dashboard
- Validación final de todas las migraciones SQL
- Deployment a producción con tag v2.9.0

---

**Estado:** 🚀 LISTO PARA AUDITORÍA TÉCNICA COMPLETA
**Fecha:** 16 de Septiembre, 2025 - 01:42 hrs
**Versión Objetivo:** v2.9.0 - Production Ready
