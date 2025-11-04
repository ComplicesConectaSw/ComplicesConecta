/**
 * Script de Sincronización PostgreSQL → Neo4j
 * 
 * Sincroniza datos existentes desde PostgreSQL a Neo4j:
 * - Usuarios (profiles)
 * - Matches
 * - Likes
 * - Follows
 * 
 * Uso:
 *   npm run sync:neo4j
 *   npm run sync:neo4j -- --users-only
 *   npm run sync:neo4j -- --matches-only
 * 
 * @version 3.5.0
 */

import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { neo4jService } from '../src/services/graph/Neo4jService';

// Cargar variables de entorno desde .env
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

// Reinicializar Neo4jService con variables de entorno cargadas
neo4jService.reinitialize();

interface SyncOptions {
  usersOnly?: boolean;
  matchesOnly?: boolean;
  likesOnly?: boolean;
  batchSize?: number;
}

async function syncUsers(batchSize: number = 100): Promise<void> {
  console.log('🔄 Sincronizando usuarios...');

  let offset = 0;
  let hasMore = true;
  let totalSynced = 0;

  while (hasMore) {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, user_id, name, age, location, gender, created_at')
      .range(offset, offset + batchSize - 1)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo perfiles:', error);
      break;
    }

    if (!profiles || profiles.length === 0) {
      hasMore = false;
      break;
    }

    for (const profile of profiles) {
      const userId = profile.user_id || profile.id;
      await neo4jService.syncUserFromPostgres(userId, profile);
      totalSynced++;
    }

    offset += batchSize;
    hasMore = profiles.length === batchSize;

    console.log(`✅ ${totalSynced} usuarios sincronizados...`);
  }

  console.log(`✅ Total usuarios sincronizados: ${totalSynced}`);
}

async function syncMatches(batchSize: number = 100): Promise<void> {
  console.log('🔄 Sincronizando matches...');

  let offset = 0;
  let hasMore = true;
  let totalSynced = 0;

  while (hasMore) {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .range(offset, offset + batchSize - 1)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo matches:', error);
      break;
    }

    if (!matches || matches.length === 0) {
      hasMore = false;
      break;
    }

    for (const match of matches) {
      // match_score puede no existir, usar 0 como default
      const score = (match as any).match_score || (match as any).score || 0;
      await neo4jService.syncMatchFromPostgres(match.user1_id, match.user2_id, {
        ...match,
        score,
      });
      totalSynced++;
    }

    offset += batchSize;
    hasMore = matches.length === batchSize;

    console.log(`✅ ${totalSynced} matches sincronizados...`);
  }

  console.log(`✅ Total matches sincronizados: ${totalSynced}`);
}

async function syncLikes(batchSize: number = 100): Promise<void> {
  console.log('🔄 Sincronizando likes...');

  let offset = 0;
  let hasMore = true;
  let totalSynced = 0;

  while (hasMore) {
    // Nota: couple_profile_likes es para couple_profiles, no para profiles individuales
    // Por ahora, solo sincronizamos likes si existen en la base de datos
    // Si hay una tabla de likes para profiles individuales, usar esa en su lugar
    const { data: likes, error } = await supabase
      .from('couple_profile_likes')
      .select('id, liker_profile_id, couple_profile_id, liked_at')
      .range(offset, offset + batchSize - 1)
      .order('liked_at', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo likes:', error);
      console.log('⚠️  Nota: couple_profile_likes es para couple_profiles. Si necesitas likes de profiles individuales, usa otra tabla.');
      break;
    }

    if (!likes || likes.length === 0) {
      hasMore = false;
      break;
    }

    // couple_profile_likes usa liker_profile_id y couple_profile_id
    // Necesitamos obtener los user_id de los couple_profiles
    for (const like of likes) {
      // Obtener user_id de los couple_profiles
      const { data: likerCouple } = await supabase
        .from('couple_profiles')
        .select('user_id')
        .eq('id', like.liker_profile_id)
        .single();
      
      const { data: likedCouple } = await supabase
        .from('couple_profiles')
        .select('user_id')
        .eq('id', like.couple_profile_id)
        .single();

      if (likerCouple?.user_id && likedCouple?.user_id) {
        await neo4jService.createLike(likerCouple.user_id, likedCouple.user_id, {
          like_id: like.id,
          created_at: like.liked_at,
        });
        totalSynced++;
      }
    }

    offset += batchSize;
    hasMore = likes.length === batchSize;

    console.log(`✅ ${totalSynced} likes sincronizados...`);
  }

  console.log(`✅ Total likes sincronizados: ${totalSynced}`);
}

async function main() {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    usersOnly: args.includes('--users-only'),
    matchesOnly: args.includes('--matches-only'),
    likesOnly: args.includes('--likes-only'),
    batchSize: 100,
  };

  console.log('🚀 Iniciando sincronización PostgreSQL → Neo4j...\n');

  // Verificar conexión con Neo4j
  const isConnected = await neo4jService.verifyConnection();
  if (!isConnected) {
    console.error('❌ Error: No se pudo conectar con Neo4j. Verifica que esté corriendo.');
    process.exit(1);
  }

  console.log('✅ Conexión con Neo4j verificada\n');

  try {
    if (options.usersOnly) {
      await syncUsers(options.batchSize);
    } else if (options.matchesOnly) {
      await syncMatches(options.batchSize);
    } else if (options.likesOnly) {
      await syncLikes(options.batchSize);
    } else {
      // Sincronizar todo
      await syncUsers(options.batchSize);
      console.log('');
      await syncMatches(options.batchSize);
      console.log('');
      await syncLikes(options.batchSize);
    }

    // Obtener estadísticas finales
    console.log('\n📊 Estadísticas del grafo:');
    const stats = await neo4jService.getGraphStats();
    console.log(`  - Usuarios: ${stats.userCount}`);
    console.log(`  - Matches: ${stats.matchCount}`);
    console.log(`  - Likes: ${stats.likeCount}`);
    console.log(`  - Friends: ${stats.friendCount}`);

    console.log('\n✅ Sincronización completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante sincronización:', error);
    process.exit(1);
  } finally {
    await neo4jService.close();
  }
}

main();

