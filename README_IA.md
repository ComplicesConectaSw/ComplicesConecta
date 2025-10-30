# 🤖 README_IA v3.5.0

## Estrategia Avanzada con IA + Machine Learning + DevOps Manager Ultra

1. **Crear ramas específicas**  
   - `backup/safe-YYYYMMDD_HHMMSS` → Respaldo completo
   - `feature/*` → Nuevas funciones
   - `fix/*` → Correcciones
   - `recover/*` → Recuperación desde backups
   - **v3.4.0**: `feature/advanced-*` → Funcionalidades avanzadas (seguridad, moderación, parejas)
   - **v3.4.1**: `feature/monitoring-*` → Sistema de monitoreo y analytics
   - **NUEVO v3.5.0**: `feature/ai-native-*` → AI/ML layers (compatibility, chat summaries)
   - **NUEVO v3.5.0**: `feature/scalability-*` → S2 Geosharding, Neo4j

2. **SQL y Backups**
   - Todos los `.sql` y migraciones quedan excluidos en `.gitignore`
   - Backups locales guardados en `D:\complicesconecta_ultima_version_respaldo\supabase\migrations`
   - **v3.4.0**: Migraciones de seguridad y parejas incluidas
   - **v3.4.1**: 20 migraciones aplicadas (47 tablas sincronizadas 100%)
   - **NUEVO v3.5.0**: 25 migraciones aplicadas (52 tablas sincronizadas 100%)

3. **Flujo de trabajo con IA/ML**
   - IA genera migraciones o código → Validar con `npm run type-check`
   - **NUEVO**: ML models en `/public/models/` → Lazy loading con TensorFlow.js
   - Ejecutar `DevOpsManagerUltra.ps1` opción 7 → Commit seguro automático
   - Probar en `staging` antes de promover a `main`
   - **v3.4.0**: Validación automática de funcionalidades avanzadas
   - **v3.4.1**: Validación con linting 0 errores antes de cada commit
   - **NUEVO v3.5.0**: Tests unitarios para servicios AI (AILayerService, ChatSummaryService)

4. **Prevención de caos**
   - No se crean duplicados de carpetas sin confirmación
   - Docs y reportes deben consolidarse (ej: `AUDIT_REPORT.md` mensual, no múltiples sueltos)
   - **v3.4.0**: Monitoreo continuo de amenazas y moderación automática
   - **v3.4.1**: Documentación consolidada en 4 archivos maestros + eliminación de redundantes
   - **NUEVO v3.5.0**: Documentación consolidada en 1 archivo maestro (`SINCRONIZACION_BD_COMPLETADA_v3.5.0.md`)

5. **AI/ML Strategy v3.5.0** 🆕
   - **PyTorch/TensorFlow.js**: Modelos pre-entrenados para compatibility scoring
   - **HuggingFace API**: Chat summaries GRATIS con BART model
   - **Feature Flags**: `VITE_AI_NATIVE_ENABLED`, `VITE_AI_CHAT_SUMMARIES_ENABLED`
   - **Opciones Gratuitas**: HuggingFace (gratis), Fallback (sin ML), Ollama (local)
   - **Caching**: 1h para scores AI, 24h para resúmenes
   - **Rate Limiting**: 10 resúmenes/día por usuario
   - **Fallback Automático**: AI → Legacy scoring si modelo falla
   - **Docs**: `CHAT_SUMMARIES_FREE_OPTIONS_v3.5.0.md` para opciones gratuitas

6. **Scalability Strategy v3.5.0** 🆕
   - **Google S2 Geosharding**: Cell ID para queries geográficas 50-300x más rápidos
   - **Backfill Script**: `npm run backfill:s2` para usuarios existentes
   - **Neo4j** (Pendiente Fase 2.2): Graph database para conexiones sociales
   - **Redis** (Pendiente Fase 2.3): Cache distribuido con TTL
   - **Docs**: `FASE_2_SCALABILITY_PLAN_v3.5.0.md` para roadmap completo

7. **Monitoreo y Observabilidad v3.4.1**
   - **Datadog RUM**: Integrado en `src/main.tsx` para Real User Monitoring
   - **Datadog Agent**: Desplegado en Docker con APM, Security, Profiling, Logs
   - **Sentry**: Configurado para error tracking con source maps y release tracking
   - **New Relic**: APM integrado en `server.js` para monitoreo de aplicación
   - **Analytics Dashboard**: 4 pestañas funcionales en `/admin/analytics`
   - **Webhooks**: Sistema completo para Slack, Discord, Custom
   - **Validación**: Antes de cada deploy, verificar métricas en Datadog/New Relic

8. **Seguridad Mejorada v3.4.1**
   - **Variables de Entorno**: Credenciales migradas a `.env` (gitignored)
   - **Wallet Protection**: Errores completamente silenciados en `src/main.tsx`
   - **Privacidad Sentry**: Filtros automáticos de datos sensibles
   - **RLS Completo**: 65+ políticas activas en Supabase (v3.5.0)
   - **Validación**: Nunca commitear `.env`, usar `.env.example` como template
