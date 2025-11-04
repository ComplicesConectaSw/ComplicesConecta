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
import { logger } from '../src/lib/logger';

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
      .select('id, user_id, name, email, age, location, gender, created_at')
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
      .select('id, user1_id, user2_id, created_at, score')
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
      await neo4jService.syncMatchFromPostgres(match.user1_id, match.user2_id, match);
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
    const { data: likes, error } = await supabase
      .from('couple_profile_likes')
      .select('id, liker_id, liked_id, created_at')
      .range(offset, offset + batchSize - 1)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo likes:', error);
      break;
    }

    if (!likes || likes.length === 0) {
      hasMore = false;
      break;
    }

    for (const like of likes) {
      await neo4jService.createLike(like.liker_id, like.liked_id, {
        like_id: like.id,
        created_at: like.created_at,
      });
      totalSynced++;
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

