# 🔧 PLAN DE CORRECCIONES POR FASES - ComplicesConecta v3.6.3

**Fecha:** 08 de Noviembre, 2025  
**Versión:** 3.6.3  
**Estado:** ⚠️ **REQUIERE CORRECCIONES ANTES DE PRODUCCIÓN**

---

## 📋 ÍNDICE

1. [Fase 1: Correcciones Críticas (Antes de Producción)](#fase-1-correcciones-críticas-antes-de-producción)
2. [Fase 2: Optimizaciones Importantes](#fase-2-optimizaciones-importantes)
3. [Fase 3: Mejoras Recomendadas](#fase-3-mejoras-recomendadas)
4. [Fase 4: Optimizaciones Futuras](#fase-4-optimizaciones-futuras)

---

## 🔴 FASE 1: CORRECCIONES CRÍTICAS (ANTES DE PRODUCCIÓN)

**Prioridad:** 🔴 **ALTA - BLOQUEANTE**  
**Tiempo Estimado:** 1-2 días  
**Estado:** ⏳ **EN PROGRESO (75% completada)**

### ✅ Checklist de Fase 1

#### 1.1. APK en Repositorio
- [x] **Problema:** `public/app-release.apk` (119.5 MB) está en el repositorio
- [x] **Impacto:** Aumenta tamaño del repositorio innecesariamente, puede causar problemas en clones y pulls
- [x] **Solución Aplicada:**
  ```bash
  # 1. Agregado a .gitignore
  public/app-release.apk
  ```
- [ ] **Pendiente:**
  ```bash
  # 2. Mover a GitHub Releases
  # Subir APK a GitHub Releases en lugar del repositorio
  
  # 3. Actualizar README.md
  # Cambiar link de descarga a GitHub Releases
  ```
- [ ] **Verificación:** Confirmar que APK está en GitHub Releases y link actualizado en README.md

#### 1.2. TODO Pendiente: app_logs
- [x] **Problema:** Tabla `app_logs` marcada como TODO en `verificar-alineacion-tablas.ps1`
- [x] **Análisis:** `app_logs` existe en remoto (113 tablas) pero no en local (66 tablas)
- [x] **Decisión:** ✅ Remover de TODOs - La tabla existe en remoto y está preparada para uso futuro
- [x] **Solución Aplicada:**
  ```powershell
  # En verificar-alineacion-tablas.ps1
  # Removido 'app_logs' de $knownTODOs
  $knownTODOs = @()  # app_logs removido: existe en remoto, preparada para uso futuro
  ```
- [x] **Actualización en logger.ts:** Comentario actualizado indicando que la tabla existe en remoto
- [x] **Verificación:** ✅ TODO resuelto - Script actualizado, comentarios actualizados

#### 1.3. Script Obsoleto: eliminar-documentos-consolidados.ps1
- [x] **Problema:** Script v3.5.0 que intenta eliminar documentos ya consolidados
- [x] **Análisis:** Todos los documentos que el script intenta eliminar ya fueron consolidados
- [x] **Solución Aplicada:** ✅ Script eliminado (obsoleto)
- [x] **Verificación:** ✅ Confirmado que script era obsoleto y eliminado

#### 1.4. Documentación: tunnel-setup.md
- [x] **Problema:** `tunnel-setup.md` estaba en `scripts/` pero es documentación
- [x] **Solución:** ✅ Movido a `docs/tunnel-setup.md`
- [x] **Verificación:** ✅ Confirmado

---

## 🟡 FASE 2: OPTIMIZACIONES IMPORTANTES

**Prioridad:** 🟡 **MEDIA**  
**Tiempo Estimado:** 1 semana  
**Estado:** ⏳ **PENDIENTE** (Bloqueado por Fase 1)

### ✅ Checklist de Fase 2

#### 2.1. Verificar Redundancia de Directorios
- [x] **Análisis:** Verificar si `src/app/(discover)/` es redundante con `src/profiles/`
- [x] **Resultado del Análisis:**
  - `src/app/(discover)/Discover.tsx` - Página completa de descubrimiento (890 líneas)
    - Ruta: `/discover`
    - Funcionalidad: Swipe, likes, super likes, filtros avanzados, modales, matching
    - Propósito: Página principal de descubrimiento de perfiles
  - `src/profiles/shared/Profiles.tsx` - Componente de listado de perfiles (805 líneas)
    - Ruta: `/profiles`
    - Funcionalidad: Listado, búsqueda, filtros básicos
    - Propósito: Listado de perfiles con búsqueda
  - **Conclusión:** ✅ NO son redundantes, tienen propósitos diferentes
- [x] **Acción:** ✅ Mantener ambos - No hay duplicación de funcionalidad
- [x] **Verificación:** ✅ Confirmado que no hay duplicación de funcionalidad

#### 2.2. Directorios Vacíos
- [x] **Análisis:** Verificar directorios vacíos `src/widgets` y `src/components/couples`
- [x] **Resultado del Análisis:**
  - `src/widgets/` - Vacío (puede eliminarse si no se va a usar)
  - `src/components/couples/` - Vacío (puede eliminarse si no se va a usar)
- [ ] **Acción:** [ ] Eliminar directorios vacíos [ ] Mantener para uso futuro
- [ ] **Verificación:** Confirmar si se eliminan o se mantienen

#### 2.2. Tests Actualizados
- [ ] **Problema:** Tests pueden fallar por nuevos archivos y paths movidos
- [ ] **Solución:**
  ```bash
  # Ejecutar todos los tests
  npm test
  
  # Verificar tests que fallan
  # Actualizar imports y paths en tests
  ```
- [ ] **Verificación:** Confirmar que todos los tests pasan (260 passed | 14 skipped)

#### 2.3. Verificar Imports en Tests
- [ ] **Problema:** Tests pueden tener imports obsoletos después de refactorización
- [ ] **Solución:**
  ```bash
  # Buscar imports obsoletos en tests
  grep -r "@/pages/" src/tests/
  grep -r "@/components/profile/" src/tests/
  grep -r "@/shared/hooks/" src/tests/
  
  # Actualizar imports
  ```
- [ ] **Verificación:** Confirmar que todos los imports en tests son correctos

#### 2.4. Consolidar Scripts Similares
- [ ] **Problema:** Múltiples scripts similares (túnel, migraciones)
- [ ] **Solución:** Considerar consolidar scripts similares en un script maestro
- [ ] **Verificación:** Confirmar que scripts consolidados funcionan correctamente

---

## 🟢 FASE 3: MEJORAS RECOMENDADAS

**Prioridad:** 🟢 **BAJA**  
**Tiempo Estimado:** 2-4 semanas  
**Estado:** ⏳ **PENDIENTE** (Bloqueado por Fase 2)

### ✅ Checklist de Fase 3

#### 3.1. Agregar Tests para Scripts Críticos
- [ ] **Problema:** Scripts críticos no tienen tests
- [ ] **Solución:** Crear tests unitarios para scripts críticos
- [ ] **Verificación:** Confirmar que tests cubren casos críticos

#### 3.2. Mejorar Documentación de Scripts
- [ ] **Problema:** Algunos scripts no tienen documentación completa
- [ ] **Solución:** Agregar README o documentación a cada script
- [ ] **Verificación:** Confirmar que todos los scripts están documentados

#### 3.3. Optimizar Performance de Scripts
- [ ] **Problema:** Algunos scripts pueden optimizarse
- [ ] **Solución:** Revisar y optimizar scripts lentos
- [ ] **Verificación:** Confirmar que performance mejoró

---

## 🔵 FASE 4: OPTIMIZACIONES FUTURAS

**Prioridad:** 🔵 **MUY BAJA**  
**Tiempo Estimado:** 1-2 meses  
**Estado:** ⏳ **PENDIENTE** (Bloqueado por Fase 3)

### ✅ Checklist de Fase 4

#### 4.1. Implementar Sistema de Rollback
- [ ] **Problema:** Scripts no tienen sistema de rollback
- [ ] **Solución:** Implementar sistema de rollback para operaciones críticas
- [ ] **Verificación:** Confirmar que rollback funciona correctamente

#### 4.2. Centralizar Configuración
- [ ] **Problema:** Configuración dispersa en múltiples archivos
- [ ] **Solución:** Centralizar configuración en un archivo maestro
- [ ] **Verificación:** Confirmar que configuración está centralizada

---

## 📊 PROGRESO GENERAL

### Estado por Fase

| Fase | Estado | Progreso | Bloqueado Por |
|------|--------|----------|---------------|
| **Fase 1** | ⏳ En Progreso | 3/4 (75%) | - |
| **Fase 2** | ⏳ Pendiente | 1/4 (25%) | Fase 1 |
| **Fase 3** | ⏳ Pendiente | 0/3 (0%) | Fase 2 |
| **Fase 4** | ⏳ Pendiente | 0/2 (0%) | Fase 3 |

### Progreso Total: 4/13 (31%)

### Tareas Completadas en Fase 1
- ✅ 1.2. TODO Pendiente: app_logs - Resuelto
- ✅ 1.3. Script Obsoleto: eliminar-documentos-consolidados.ps1 - Eliminado
- ✅ 1.4. Documentación: tunnel-setup.md - Movido a docs/

### Tareas Completadas en Fase 2
- ✅ 2.1. Verificar Redundancia de Directorios - Confirmado NO redundantes

### Tareas Pendientes en Fase 1
- ⏳ 1.1. APK en Repositorio - Parcialmente completado (agregado a .gitignore, pendiente mover a GitHub Releases)

### Tareas Pendientes en Fase 2
- ⏳ 2.2. Directorios Vacíos - Análisis completado, pendiente decisión (eliminar o mantener)

---

## 🎯 REGLAS DE FASE

### Regla 1: No Pasar a Siguiente Fase
- ⚠️ **NO se puede pasar a la siguiente fase hasta que la fase actual esté 100% completada**
- ✅ Todas las tareas de la fase deben estar marcadas como completadas
- ✅ Todas las verificaciones deben estar confirmadas

### Regla 2: Verificación Obligatoria
- ✅ Cada tarea debe tener verificación confirmada
- ✅ No se puede marcar como completada sin verificación

### Regla 3: Documentación de Cambios
- ✅ Todos los cambios deben estar documentados
- ✅ Actualizar este archivo después de completar cada fase

---

## 📚 DOCUMENTACIÓN RELACIONADA

- **[Documentación Maestra Unificada](../docs-unified/DOCUMENTACION_MAESTRA_UNIFICADA_v3.6.3.md)** - Documentación técnica completa (uso interno)
- **[Memorias de Sesiones](../docs-unified/MEMORIAS_SESIONES_UNIFICADAS_v3.6.3.md)** - Avances y mejoras (uso interno)
- **[Reportes y Análisis](../docs-unified/REPORTES_ANALISIS_UNIFICADOS_v3.6.3.md)** - Reportes consolidados (uso interno)
- **[Auditoría Completa](./Auditoria/)** - Auditorías profesionales

---

**Última actualización:** 08 de Noviembre, 2025  
**Versión:** 3.6.3  
**Estado:** ⚠️ **REQUIERE CORRECCIONES ANTES DE PRODUCCIÓN**

