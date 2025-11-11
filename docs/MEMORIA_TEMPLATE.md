# Plantilla: Memoria de sesión

Usa esta plantilla para documentar avances significativos y al finalizar una sesión de trabajo.
Rellena los campos y añade los archivos modificados/creados.

Fecha: YYYY-MM-DD HH:MM

Resumen breve (1-2 líneas):
- 

Cambios realizados (detallado):
- 

Archivos modificados/creados (ruta y breve razón):
- `ruta/archivo` — razón

Pruebas realizadas / Verificación:
- Comandos ejecutados (PowerShell):
  - `npm run build` (o `npm run dev`) — resultado
  - `tsx scripts/mi-script.ts` — resultado

Problemas detectados / Notas:
- 

Siguientes pasos (con responsable y prioridad):
- 

Ramas a actualizar al finalizar la sesión:
- `feature/desarrollo` (o rama de trabajo) — empujar y abrir PR
- `master` — solo vía PR revisada después de merge en rama de desarrollo

Checklist antes de push:
- [ ] Actualizar `docs/MEMORIAS_SESIONES_UNIFICADAS_v3.6.3.md` con el resumen consolidado
- [ ] Verificar `git status` y que no haya secretos en los cambios
- [ ] Commit en español MX con fecha y hora: `feat: ... - YYYY-MM-DD HH:MM`
