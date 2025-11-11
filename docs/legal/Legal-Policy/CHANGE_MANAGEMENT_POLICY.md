# Política de Gestión de Cambios

**Versión:** 1.0 | **Fecha:** 08 Nov 2025

## Proceso
1. Rama `feature/*` → PR → Review (2 approvers).
2. Pre-commit: lint, type-check, tests.
3. Deploy: `vercel --prod --force`.
4. Rollback: `vercel rollback`.

**Registro:** Git + RELEASE_NOTES.