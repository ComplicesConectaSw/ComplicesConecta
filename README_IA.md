# 🤖 README_IA

## Estrategia Segura con IA + DevOps Manager Ultra

1. **Crear ramas específicas**  
   - `backup/safe-YYYYMMDD_HHMMSS` → Respaldo completo
   - `feature/*` → Nuevas funciones
   - `fix/*` → Correcciones
   - `recover/*` → Recuperación desde backups

2. **SQL y Backups**
   - Todos los `.sql` y migraciones quedan excluidos en `.gitignore`
   - Backups locales guardados en `D:\complicesconecta_ultima_version_respaldo\supabase\migrations`

3. **Flujo de trabajo con IA**
   - IA genera migraciones o código → Validar con `npm run type-check`
   - Ejecutar `DevOpsManagerUltra.ps1` opción 7 → Commit seguro automático
   - Probar en `staging` antes de promover a `main`

4. **Prevención de caos**
   - No se crean duplicados de carpetas sin confirmación
   - Docs y reportes deben consolidarse (ej: `AUDIT_REPORT.md` mensual, no múltiples sueltos)
