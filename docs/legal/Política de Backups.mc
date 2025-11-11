# Política de Backups

**Versión:** 1.0 | **Fecha:** 08 Nov 2025

## Frecuencia
- Supabase: Daily + Point-in-Time Recovery.
- Vercel: Build cache 30 días.
- Local: `npm run backup:local`.

## Retención
- 90 días (producción).
- 1 año (logs legales).

**Prueba de restauración:** Mensual.