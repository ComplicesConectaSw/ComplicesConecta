# 🤖 README_IA v3.4.0

## Estrategia Avanzada con IA + DevOps Manager Ultra

1. **Crear ramas específicas**  
   - `backup/safe-YYYYMMDD_HHMMSS` → Respaldo completo
   - `feature/*` → Nuevas funciones
   - `fix/*` → Correcciones
   - `recover/*` → Recuperación desde backups
   - **NUEVO v3.4.0**: `feature/advanced-*` → Funcionalidades avanzadas (seguridad, moderación, parejas)

2. **SQL y Backups**
   - Todos los `.sql` y migraciones quedan excluidos en `.gitignore`
   - Backups locales guardados en `D:\complicesconecta_ultima_version_respaldo\supabase\migrations`
   - **NUEVO v3.4.0**: Migraciones de seguridad y parejas incluidas

3. **Flujo de trabajo con IA**
   - IA genera migraciones o código → Validar con `npm run type-check`
   - Ejecutar `DevOpsManagerUltra.ps1` opción 7 → Commit seguro automático
   - Probar en `staging` antes de promover a `main`
   - **NUEVO v3.4.0**: Validación automática de funcionalidades avanzadas

4. **Prevención de caos**
   - No se crean duplicados de carpetas sin confirmación
   - Docs y reportes deben consolidarse (ej: `AUDIT_REPORT.md` mensual, no múltiples sueltos)
   - **NUEVO v3.4.0**: Monitoreo continuo de amenazas y moderación automática
