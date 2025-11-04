/**
 * Script para ejecutar EXPLAIN ANALYZE en remoto (Supabase)
 * 
 * Ejecuta las queries críticas de queries-critical-analyze.sql
 * y genera un reporte de performance
 * 
 * Uso:
 *   npm run explain:analyze:remote
 * 
 * @version 3.5.0
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Cargar variables de entorno
config();

// Si no hay .env cargado por dotenv, intentar cargar manualmente
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configurados');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

interface QueryResult {
  query: string;
  executionTime?: number;
  plan?: string;
  error?: string;
}

/**
 * Ejecuta EXPLAIN ANALYZE en una query
 */
async function explainAnalyze(query: string): Promise<QueryResult> {
  try {
    // Remover EXPLAIN ANALYZE si existe
    const cleanQuery = query.replace(/^EXPLAIN\s+ANALYZE\s+/i, '').trim();
    
    // Ejecutar EXPLAIN ANALYZE
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `EXPLAIN ANALYZE ${cleanQuery}`
    });

    if (error) {
      // Si no existe la función RPC, intentar directamente
      // Nota: Supabase no permite ejecutar EXPLAIN ANALYZE directamente desde el cliente
      // Se necesita ejecutar desde el SQL Editor del dashboard
      return {
        query: cleanQuery,
        error: `No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: ${error.message}`
      };
    }

    return {
      query: cleanQuery,
      plan: JSON.stringify(data),
    };
  } catch (error: any) {
    return {
      query: query,
      error: error.message || String(error),
    };
  }
}

/**
 * Lee las queries del archivo SQL
 */
function readQueriesFromFile(filePath: string): string[] {
  if (!existsSync(filePath)) {
    console.error(`❌ Error: Archivo no encontrado: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf8');
  const queries: string[] = [];
  
  // Dividir por EXPLAIN ANALYZE
  const explainMatches = content.matchAll(/EXPLAIN\s+ANALYZE\s+([\s\S]*?)(?=\n--|$)/gi);
  
  for (const match of explainMatches) {
    if (match[1]) {
      queries.push(match[1].trim());
    }
  }

  return queries;
}

/**
 * Genera reporte de resultados
 */
function generateReport(results: QueryResult[]): string {
  let report = `# EXPLAIN ANALYZE Report - Remoto (Supabase)\n\n`;
  report += `**Fecha:** ${new Date().toLocaleString('es-ES')}\n`;
  report += `**Versión:** 3.5.0\n\n`;
  report += `---\n\n`;

  results.forEach((result, index) => {
    report += `## Query ${index + 1}\n\n`;
    report += `\`\`\`sql\n${result.query}\n\`\`\`\n\n`;
    
    if (result.error) {
      report += `**❌ Error:**\n`;
      report += `\`\`\`\n${result.error}\n\`\`\`\n\n`;
    } else if (result.plan) {
      report += `**✅ Plan de Ejecución:**\n`;
      report += `\`\`\`json\n${result.plan}\n\`\`\`\n\n`;
    }
    
    report += `---\n\n`;
  });

  return report;
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando EXPLAIN ANALYZE en remoto...\n');

  const queriesFile = join(process.cwd(), 'supabase', 'queries-critical-analyze.sql');
  const queries = readQueriesFromFile(queriesFile);

  console.log(`📊 Encontradas ${queries.length} queries para analizar\n`);

  const results: QueryResult[] = [];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`⏳ Ejecutando query ${i + 1}/${queries.length}...`);
    
    const result = await explainAnalyze(query);
    results.push(result);

    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
    } else {
      console.log(`  ✅ Completada`);
    }
  }

  // Generar reporte
  const report = generateReport(results);
  const reportPath = join(process.cwd(), 'reports', `explain-analyze-remote-${new Date().toISOString().split('T')[0]}.md`);
  
  // Crear directorio reports si no existe
  const reportsDir = join(process.cwd(), 'reports');
  if (!existsSync(reportsDir)) {
    const { mkdirSync } = await import('fs');
    mkdirSync(reportsDir, { recursive: true });
  }

  writeFileSync(reportPath, report, 'utf8');

  console.log(`\n✅ Reporte generado: ${reportPath}`);
  console.log(`\n⚠️  NOTA: Supabase no permite ejecutar EXPLAIN ANALYZE desde el cliente.`);
  console.log(`   Ejecuta las queries manualmente en el SQL Editor del dashboard:`);
  if (SUPABASE_URL) {
    const projectId = SUPABASE_URL.split('/').pop() || 'axtvqnozatbmllvwzuim';
    console.log(`   https://supabase.com/dashboard/project/${projectId}/sql`);
  } else {
    console.log(`   https://supabase.com/dashboard/project/axtvqnozatbmllvwzuim/sql`);
  }
}

main().catch(console.error);

