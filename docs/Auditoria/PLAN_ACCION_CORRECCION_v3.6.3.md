# Plan de Acción - Corrección de Problemas Detectados v3.6.3

**Fecha:** 09 de Noviembre, 2025  
**Versión:** 3.6.3  
**Estado:** En Progreso

## 📊 Resumen de Problemas Detectados

- **Imports rotos:** 25
- **Dependencias faltantes:** 77
- **Directorios vacíos:** 1
- **Archivos huérfanos:** 146
- **Vulnerabilidades:** 105
- **Errores de código:** 40

**Total de problemas:** 394

---

## 🎯 FASE 1: Correcciones Críticas (Prioridad Alta)

### 1.1. Errores de Sintaxis y Parsing
- [ ] Corregir errores de parsing en archivos TypeScript/JavaScript
- [ ] Corregir caracteres corruptos (`díashboard`, `Moderatordíashboard`, etc.)
- [ ] Corregir operadores faltantes (`??`, `||`, etc.)
- [ ] Verificar que todos los archivos compilen sin errores

**Archivos afectados:** ~20 archivos con errores de parsing

**Comando:**
```powershell
.\scripts\fix-character-encoding.ps1
npm run lint
```

**Estimación:** 2-3 horas

---

### 1.2. Imports Rotos (25 archivos)
- [ ] Identificar todos los imports rotos
- [ ] Corregir rutas de imports incorrectas
- [ ] Verificar alias `@/` en todos los archivos
- [ ] Corregir imports de módulos no existentes

**Archivos afectados:** 25 archivos

**Comando:**
```powershell
npm run lint | Select-String "import/no-unresolved"
```

**Estimación:** 3-4 horas

---

### 1.3. Errores de Código (40 errores)
- [ ] Corregir errores de TypeScript
- [ ] Corregir errores de ESLint
- [ ] Eliminar uso de `as any` donde sea posible
- [ ] Corregir tipos incorrectos

**Archivos afectados:** ~40 archivos

**Comando:**
```powershell
npm run type-check
npm run lint
```

**Estimación:** 4-5 horas

---

## 🔒 FASE 2: Seguridad (Prioridad Alta)

### 2.1. Vulnerabilidades Críticas (105 vulnerabilidades)
- [ ] Revisar y corregir uso de `eval()`
- [ ] Revisar y corregir uso de `innerHTML` / `dangerouslySetInnerHTML`
- [ ] Revisar y corregir posibles SQL Injections
- [ ] Implementar validación en `localStorage`
- [ ] Revisar secretos hardcodeados

**Archivos afectados:** ~105 archivos

**Prioridad:**
1. **Crítico:** `eval()`, SQL Injection, secretos hardcodeados
2. **Alto:** `innerHTML` sin sanitización
3. **Medio:** `localStorage` sin validación

**Estimación:** 6-8 horas

---

## 📦 FASE 3: Dependencias y Estructura (Prioridad Media)

### 3.1. Dependencias Faltantes (77 dependencias)
- [ ] Identificar dependencias faltantes
- [ ] Instalar dependencias necesarias
- [ ] Verificar compatibilidad de versiones
- [ ] Actualizar `package.json`

**Archivos afectados:** `package.json`, múltiples archivos de código

**Comando:**
```powershell
npm install
npm audit
```

**Estimación:** 2-3 horas

---

### 3.2. Archivos Huérfanos (146 archivos)
- [ ] Identificar archivos huérfanos
- [ ] Decidir: eliminar, mover o integrar
- [ ] Documentar decisiones
- [ ] Ejecutar limpieza

**Archivos afectados:** 146 archivos

**Criterios:**
- Si no se usa: **Eliminar**
- Si se usa pero está mal ubicado: **Mover**
- Si es código legacy: **Documentar y considerar eliminar**

**Estimación:** 4-6 horas

---

### 3.3. Directorios Vacíos (1 directorio)
- [ ] Identificar directorio vacío
- [ ] Decidir: eliminar o agregar `.gitkeep`

**Archivos afectados:** 1 directorio

**Estimación:** 15 minutos

---

## 🧹 FASE 4: Limpieza y Optimización (Prioridad Baja)

### 4.1. Archivos Duplicados
- [ ] Identificar archivos duplicados
- [ ] Consolidar o eliminar duplicados
- [ ] Actualizar imports

**Estimación:** 2-3 horas

---

### 4.2. Archivos Obsoletos
- [ ] Identificar archivos obsoletos
- [ ] Verificar si se usan
- [ ] Eliminar o mover a carpeta de respaldo

**Estimación:** 1-2 horas

---

### 4.3. Archivos Mal Ubicados
- [ ] Identificar archivos mal ubicados
- [ ] Mover a ubicaciones correctas
- [ ] Actualizar imports

**Estimación:** 2-3 horas

---

## 📋 Checklist de Verificación

### Pre-Corrección
- [x] TypeScript type-check: ✅ SIN ERRORES
- [x] Error en `Auditoria-analisis.ps1` corregido
- [ ] Backup del código actual
- [ ] Crear rama de trabajo: `fix/auditoria-v3.6.3`

### Durante Corrección
- [ ] Ejecutar tests después de cada fase
- [ ] Verificar que no se rompa funcionalidad existente
- [ ] Documentar cambios importantes

### Post-Corrección
- [ ] Ejecutar `npm run type-check` → Sin errores
- [ ] Ejecutar `npm run lint` → Sin errores críticos
- [ ] Ejecutar `npm test` → Todos los tests pasan
- [ ] Ejecutar `npm run build` → Build exitoso
- [ ] Re-ejecutar auditoría → Verificar mejoras

---

## 🚀 Orden de Ejecución Recomendado

1. **FASE 1.1** - Errores de Sintaxis (Bloquea todo)
2. **FASE 1.2** - Imports Rotos (Bloquea compilación)
3. **FASE 1.3** - Errores de Código (Bloquea compilación)
4. **FASE 2.1** - Vulnerabilidades Críticas (Seguridad)
5. **FASE 3.1** - Dependencias Faltantes (Funcionalidad)
6. **FASE 3.2** - Archivos Huérfanos (Limpieza)
7. **FASE 3.3** - Directorios Vacíos (Limpieza)
8. **FASE 4** - Limpieza y Optimización (Mejoras)

---

## 📝 Notas

- **Tiempo total estimado:** 20-30 horas
- **Prioridad:** FASE 1 y FASE 2 son críticas
- **Riesgo:** FASE 3 y FASE 4 pueden hacerse gradualmente
- **Testing:** Ejecutar tests después de cada fase importante

---

## 🔄 Actualización de Estado

**Última actualización:** 09 de Noviembre, 2025 - 11:56 AM

**Estado actual:**
- ✅ TypeScript type-check: SIN ERRORES
- ✅ Error en `Auditoria-analisis.ps1` corregido
- ⏳ Pendiente: Iniciar FASE 1.1

---

## 📚 Referencias

- Reporte de auditoría: `AUDITORIA_COMPLETA_v3.6.3_20251109_0550.md`
- Script de corrección de caracteres: `scripts/fix-character-encoding.ps1`
- Script de type-check: `scripts/test-type-check-robust.cjs`

