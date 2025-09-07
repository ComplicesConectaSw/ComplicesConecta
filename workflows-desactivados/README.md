# Workflows Desactivados

Este directorio contiene los workflows de GitHub Actions que han sido temporalmente desactivados para evitar el consumo de recursos mientras el proyecto se estabiliza.

## Ubicación original:
- **Workflows**: `.github/workflows/` → `workflows-desactivados/workflows/`
- **Environments**: `.github/environments/` → `workflows-desactivados/environments/`

## Archivos movidos:

### Workflows:
- `ci.yml` - Pipeline principal de CI/CD
- Otros archivos de workflow si existen

### Environments:
- `preview.yml` - Configuración de entorno de preview
- `production.yml` - Configuración de entorno de producción  
- `staging.yml` - Configuración de entorno de staging

⚠️ **PROBLEMA IDENTIFICADO**: Los archivos de environments requieren workflows activos para funcionar y contienen configuraciones de secrets de Vercel que son inútiles sin el pipeline de CI/CD.

## Para reactivar:
1. Mover `workflows-desactivados/workflows/` de vuelta a `.github/workflows/`
2. Mover `workflows-desactivados/environments/` de vuelta a `.github/environments/`
3. Descommentar las líneas en `ci.yml` si es necesario
4. Hacer commit y push de los cambios

## Fecha de desactivación:
06/09/2025 22:40

## Razón:
Pipeline consume muchos recursos y el proyecto necesita estabilizarse primero.
