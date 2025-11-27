# Política de Respuesta a Incidentes

**Versión:** 1.0 | **Fecha:** 08 Nov 2025

## Flujo
1. Detección (Sentry < 5min).
2. Contención (RLS + baneo digital_fingerprints).
3. Notificación (usuarios EU <72h, SACMEX si Ley Olimpia).
4. Recuperación (backups Supabase).
5. Lección aprendida (RELEASE_NOTES).

## Equipo
- DPO (lead), DevOps, Moderador 24/7.

**Prueba:** Trimestral (simulacro).