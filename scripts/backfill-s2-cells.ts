/**
 * Backfill S2 Cells Script
 * Actualiza s2_cell_id para usuarios existentes con lat/lng
 * 
 * Uso:
 * ```bash
 * npm run backfill:s2
 * ```
 * 
 * @version 3.5.0
 * @date 2025-10-31
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { s2Service } from '../src/services/geo/S2Service';

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
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

// Configuración
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
// Priorizar SUPABASE_SERVICE_ROLE_KEY para bypass RLS
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const BATCH_SIZE = 100;
const DEFAULT_LEVEL = 15; // ~1km²

if (!SUPABASE_URL) {
  console.error('❌ Error: VITE_SUPABASE_URL no configurada en archivo .env');
  console.error('Por favor, crea un archivo .env con las credenciales de Supabase');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: No se encontró clave de autenticación');
  console.error('Configura SUPABASE_SERVICE_ROLE_KEY o VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

// Cliente Supabase con service role (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface Profile {
  id: string;
  latitude: number | null;
  longitude: number | null;
  s2_cell_id: string | null;
}

/**
 * Main backfill function
 */
async function backfillS2Cells() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║     🗺️  BACKFILL S2 CELLS                                     ║');
  console.log('║     ComplicesConecta v3.5.0                                    ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log('🔗 Testing Supabase connection...');
  console.log(`   URL: ${SUPABASE_URL.substring(0, 30)}...`);
  console.log(`   Key: ${SUPABASE_SERVICE_KEY ? '✅ Configured' : '❌ Missing'}\n`);

  try {
    // 1. Verificar conexión básica primero
    console.log('🔍 Verificando conexión con BD...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      throw testError;
    }
    console.log('✅ Conexión OK\n');
    
    // 2. Contar perfiles sin s2_cell_id pero con lat/lng
    console.log('📊 Contando perfiles a procesar...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .is('s2_cell_id', null);

    if (countError) {
      console.error('❌ Error details:', {
        message: countError.message,
        details: countError.details,
        hint: countError.hint,
        code: countError.code,
      });
      throw new Error(`Error counting profiles: ${countError.message}`);
    }

    const totalProfiles = count || 0;
    console.log(`✅ Total perfiles a actualizar: ${totalProfiles}`);

    if (totalProfiles === 0) {
      console.log('✨ No hay perfiles pendientes de backfill. Todo listo!');
      return;
    }

    // 2. Procesar en batches
    let processed = 0;
    let updated = 0;
    let errors = 0;
    let offset = 0;

    console.log(`\n🔄 Procesando en batches de ${BATCH_SIZE}...\n`);

    while (processed < totalProfiles) {
      // Fetch batch
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, latitude, longitude, s2_cell_id')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .is('s2_cell_id', null)
        .range(offset, offset + BATCH_SIZE - 1);

      if (fetchError) {
        console.error(`❌ Error fetching batch at offset ${offset}:`, fetchError.message);
        errors++;
        break;
      }

      if (!profiles || profiles.length === 0) {
        break;
      }

      // Process each profile
      for (const profile of profiles as Profile[]) {
        try {
          if (!profile.latitude || !profile.longitude) {
            continue;
          }

          // Calculate S2 cell ID
          const s2CellId = s2Service.getCell(
            profile.latitude,
            profile.longitude,
            DEFAULT_LEVEL
          );

          // Update profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              s2_cell_id: s2CellId,
              s2_level: DEFAULT_LEVEL,
            })
            .eq('id', profile.id);

          if (updateError) {
            console.error(`  ❌ Error updating profile ${profile.id}:`, updateError.message);
            errors++;
          } else {
            updated++;
          }

          processed++;

          // Progress indicator
          if (processed % 10 === 0) {
            const percentage = ((processed / totalProfiles) * 100).toFixed(1);
            process.stdout.write(`  Progress: ${processed}/${totalProfiles} (${percentage}%) - Updated: ${updated}, Errors: ${errors}\r`);
          }
        } catch (error) {
          console.error(`  ❌ Error processing profile ${profile.id}:`, error);
          errors++;
        }
      }

      offset += BATCH_SIZE;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. Resumen final
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     ✅ BACKFILL COMPLETADO                                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📊 ESTADÍSTICAS:`);
    console.log(`   Total procesados:   ${processed}`);
    console.log(`   Actualizados:       ${updated} ✅`);
    console.log(`   Errores:            ${errors} ${errors > 0 ? '⚠️' : '✅'}`);
    console.log(`   Tasa de éxito:      ${((updated / processed) * 100).toFixed(1)}%`);
    console.log('');

    // 4. Verificar resultados
    console.log('🔍 Verificando resultados...');
    const { count: remainingCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .is('s2_cell_id', null);

    console.log(`   Perfiles pendientes: ${remainingCount || 0}`);

    if ((remainingCount || 0) === 0) {
      console.log('\n✨ ¡Todos los perfiles tienen s2_cell_id! Backfill 100% completo.');
    } else {
      console.log(`\n⚠️  Aún quedan ${remainingCount} perfiles sin s2_cell_id. Ejecutar script nuevamente.`);
    }

    // 5. Estadísticas de celdas
    console.log('\n📈 Estadísticas de celdas S2:');
    const { data: cellStats } = await supabase.rpc('count_users_per_cell');
    
    if (cellStats && cellStats.length > 0) {
      console.log(`   Total celdas únicas: ${cellStats.length}`);
      console.log(`   Celda con más usuarios: ${cellStats[0].user_count} usuarios`);
      console.log(`   Top 5 celdas más pobladas:`);
      cellStats.slice(0, 5).forEach((stat: any, idx: number) => {
        console.log(`     ${idx + 1}. ${stat.s2_cell_id} - ${stat.user_count} usuarios`);
      });
    }

    console.log('\n✅ Backfill completado exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error fatal en backfill:', error);
    process.exit(1);
  }
}

// Ejecutar directamente (ES modules)
backfillS2Cells().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { backfillS2Cells };

