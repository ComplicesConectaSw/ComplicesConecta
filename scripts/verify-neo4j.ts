/**
 * Script de Verificación de Neo4j
 * 
 * Verifica la conexión con Neo4j y muestra estadísticas del grafo
 * 
 * Uso:
 *   npm run verify:neo4j
 *   tsx scripts/verify-neo4j.ts
 * 
 * @version 3.5.0
 */

import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
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

async function verify() {
  console.log('🔍 Verificando conexión con Neo4j...\n');

  try {
    // Verificar conexión
    const isConnected = await neo4jService.verifyConnection();

    if (!isConnected) {
      console.log('❌ Error conectando con Neo4j\n');
      console.log('Verifica que:');
      console.log('  1. Neo4j esté corriendo: docker-compose up -d neo4j');
      console.log('  2. Variables de entorno estén configuradas:');
      console.log('     - VITE_NEO4J_ENABLED=true');
      console.log('     - VITE_NEO4J_URI=bolt://localhost:7687');
      console.log('     - VITE_NEO4J_USER=neo4j');
      console.log('     - VITE_NEO4J_PASSWORD=complices2025');
      console.log('  3. Acceder a http://localhost:7474 para verificar');
      process.exit(1);
    }

    console.log('✅ Conexión exitosa con Neo4j\n');

    // Obtener estadísticas del grafo
    console.log('📊 Estadísticas del grafo:');
    const stats = await neo4jService.getGraphStats();
    console.log(`  - Usuarios: ${stats.userCount}`);
    console.log(`  - Matches: ${stats.matchCount}`);
    console.log(`  - Likes: ${stats.likeCount}`);
    console.log(`  - Friends: ${stats.friendCount}\n`);

    // Verificar si hay datos
    if (stats.userCount === 0) {
      console.log('⚠️  No hay datos en Neo4j aún');
      console.log('   Ejecuta: npm run sync:neo4j para sincronizar datos\n');
    } else {
      console.log('✅ Neo4j está configurado y tiene datos\n');
    }

    await neo4jService.close();
    console.log('✅ Verificación completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante verificación:', error);
    process.exit(1);
  }
}

verify().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

