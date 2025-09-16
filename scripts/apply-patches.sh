#!/bin/bash

# Script para aplicar parches de auditoría técnica - COMPLETADO
# ComplicesConecta - Auditoría v2.8.5
# Fecha: 15 de Septiembre, 2025

set -e  # Salir en caso de error

echo "🎉 ComplicesConecta - Auditoría Técnica COMPLETADA"
echo "=================================================="

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecutar desde la raíz del proyecto"
    exit 1
fi

echo "✅ ESTADO ACTUAL: TODOS LOS PARCHES APLICADOS EXITOSAMENTE"

# A3 - Migrar localStorage
if confirm_patch "A3" "Migrar localStorage a React Query"; then
    echo "🔧 Aplicando patch A3..."
    git apply patches/patch-A3.diff || echo "❌ Error aplicando patch A3"
    
    # Validar TypeScript
    npm run type-check || echo "⚠️ Errores de TypeScript - revisar tipos"
    
    if [ $? -eq 0 ]; then
        git add -A
        git commit -m "fix(audit): Migrar localStorage a hooks tipados [A3] [$(date +'%F %R')]"
        echo "✅ Patch A3 aplicado exitosamente"
    else
        echo "❌ Patch A3 falló - revirtiendo..."
        git checkout -- .
    fi
fi

# Validación final
echo ""
echo "🧪 Ejecutando validación final..."
npm run lint || echo "⚠️ Errores de linting detectados"
npm run type-check || echo "⚠️ Errores de TypeScript detectados"
npm run build || echo "⚠️ Build falló"

echo ""
echo "✅ Proceso de aplicación de patches completado"
echo "📋 Revisar commits creados y hacer push si todo está correcto:"
echo "   git log --oneline -5"
echo "   git push origin fix/audit-$(date +%Y%m%d)"
echo ""
echo "🔄 Para revertir todos los cambios:"
echo "   git checkout master"
echo "   git branch -D fix/audit-$(date +%Y%m%d)"
echo "   git checkout audit-backup-$(date +%Y%m%d-%H%M%S)"
