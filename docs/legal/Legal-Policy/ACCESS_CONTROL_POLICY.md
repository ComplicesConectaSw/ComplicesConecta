# Política de Control de Acceso

**Versión:** 1.0 | **Fecha:** 08 Nov 2025

## Principios
- **Mínimo privilegio:** Solo datos necesarios.
- **RBAC:** 5 niveles (user, creator, mod, admin, DPO).
- **RLS Supabase:** 65 políticas activas.
- **WorldID + hCaptcha:** Verificación +18.

## Reglas
- Acceso a gallery_images: solo con consentimiento.
- Admin: solo DPO y 2 moderadores.
- Logs: 1 año retention.

**Auditoría:** Mensual.