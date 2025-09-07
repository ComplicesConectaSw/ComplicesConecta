# Workflows Desactivados

Este directorio contiene los workflows de GitHub Actions que han sido temporalmente desactivados para evitar el consumo de recursos mientras el proyecto se estabiliza.

## Ubicación original:
- **Antes**: `.github/workflows/`
- **Ahora**: `workflows-desactivados/workflows/`

## Archivos movidos:
- `ci.yml` - Pipeline principal de CI/CD
- Otros archivos de workflow si existen

## Para reactivar:
1. Mover el directorio `workflows-desactivados/workflows/` de vuelta a `.github/workflows/`
2. Descommentar las líneas en `ci.yml` si es necesario
3. Hacer commit y push de los cambios

## Fecha de desactivación:
06/09/2025 22:40

## Razón:
Pipeline consume muchos recursos y el proyecto necesita estabilizarse primero.
