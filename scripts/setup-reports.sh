#!/bin/bash
set -e

echo "🚀 Ejecutando migración: reports + profiles"

# Verificar que las variables de entorno estén configuradas
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Error: SUPABASE_DB_URL no está configurado"
    echo "👉 Configura: export SUPABASE_DB_URL='postgresql://user:pass@host:port/db'"
    exit 1
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "❌ Error: SUPABASE_PROJECT_ID no está configurado"
    echo "👉 Configura: export SUPABASE_PROJECT_ID='tu-project-id'"
    exit 1
fi

# Ejecutar migración SQL
echo "📊 Aplicando migración SQL..."
psql $SUPABASE_DB_URL -f migrations/reports_profiles.sql

if [ $? -eq 0 ]; then
    echo "✅ Migración SQL aplicada exitosamente"
else
    echo "❌ Error aplicando migración SQL"
    exit 1
fi

# Regenerar tipos de Supabase
echo "📦 Regenerando tipos Supabase..."
npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > src/types/supabase.ts

if [ $? -eq 0 ]; then
    echo "✅ Tipos regenerados exitosamente"
else
    echo "❌ Error regenerando tipos"
    exit 1
fi

# Verificar compilación TypeScript
echo "🔍 Verificando compilación TypeScript..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ Compilación TypeScript exitosa"
else
    echo "❌ Errores de compilación TypeScript"
    echo "👉 Reinicia el servidor TS en VSCode: Ctrl+Shift+P → 'TypeScript: Restart TS server'"
    exit 1
fi

echo ""
echo "🎉 ¡Migración completada exitosamente!"
echo "👉 Reinicia el servidor TypeScript en VSCode para aplicar los nuevos tipos"
echo "👉 Comando: Ctrl+Shift+P → 'TypeScript: Restart TS server'"
echo ""
