/**
 * Script de Configuración de Índices Neo4j
 * 
 * Crea índices y constraints en Neo4j para optimizar performance
 * 
 * Uso:
 *   npm run setup:neo4j-indexes
 *   tsx scripts/setup-neo4j-indexes.ts
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

// Reinicializar Neo4jService con variables de entorno cargadas
neo4jService.reinitialize();

async function setupIndexes() {
  console.log('🔧 Configurando índices y constraints en Neo4j...\n');

  try {
    // Verificar conexión
    const isConnected = await neo4jService.verifyConnection();
    if (!isConnected) {
      console.error('❌ Error: No se pudo conectar con Neo4j. Verifica que esté corriendo.');
      process.exit(1);
    }

    console.log('✅ Conexión con Neo4j verificada\n');

    // Obtener driver directamente para ejecutar queries
    const driver = (neo4jService as any).driver;
    if (!driver) {
      console.error('❌ Error: Driver de Neo4j no está disponible');
      process.exit(1);
    }

    const session = driver.session();
    
    try {
      // 1. Crear constraint único en User.id
      console.log('📝 Creando constraint único en User.id...');
      try {
        await session.run(`
          CREATE CONSTRAINT user_id_unique IF NOT EXISTS
          FOR (u:User) REQUIRE u.id IS UNIQUE
        `);
        console.log('✅ Constraint único en User.id creado\n');
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log('ℹ️  Constraint único en User.id ya existe\n');
        } else {
          throw error;
        }
      }

      // 2. Crear índice en User.id
      console.log('📝 Creando índice en User.id...');
      try {
        await session.run(`
          CREATE INDEX user_id_index IF NOT EXISTS
          FOR (u:User) ON (u.id)
        `);
        console.log('✅ Índice en User.id creado\n');
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log('ℹ️  Índice en User.id ya existe\n');
        } else {
          throw error;
        }
      }

      // 3. Crear índice en User.created_at (para ordenamiento)
      console.log('📝 Creando índice en User.created_at...');
      try {
        await session.run(`
          CREATE INDEX user_created_at_index IF NOT EXISTS
          FOR (u:User) ON (u.created_at)
        `);
        console.log('✅ Índice en User.created_at creado\n');
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log('ℹ️  Índice en User.created_at ya existe\n');
        } else {
          throw error;
        }
      }

      // 4. Crear índice en relaciones MATCHED_WITH.created_at
      console.log('📝 Creando índice en relaciones MATCHED_WITH.created_at...');
      try {
        await session.run(`
          CREATE INDEX matched_with_created_at_index IF NOT EXISTS
          FOR ()-[r:MATCHED_WITH]-() ON (r.created_at)
        `);
        console.log('✅ Índice en MATCHED_WITH.created_at creado\n');
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log('ℹ️  Índice en MATCHED_WITH.created_at ya existe\n');
        } else {
          throw error;
        }
      }

      // 5. Crear índice en relaciones LIKED.created_at
      console.log('📝 Creando índice en relaciones LIKED.created_at...');
      try {
        await session.run(`
          CREATE INDEX liked_created_at_index IF NOT EXISTS
          FOR ()-[r:LIKED]-() ON (r.created_at)
        `);
        console.log('✅ Índice en LIKED.created_at creado\n');
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log('ℹ️  Índice en LIKED.created_at ya existe\n');
        } else {
          throw error;
        }
      }

      // 6. Crear índice en relaciones FRIENDS_WITH.created_at
      console.log('📝 Creando índice en relaciones FRIENDS_WITH.created_at...');
      try {
        await session.run(`
          CREATE INDEX friends_with_created_at_index IF NOT EXISTS
          FOR ()-[r:FRIENDS_WITH]-() ON (r.created_at)
        `);
        console.log('✅ Índice en FRIENDS_WITH.created_at creado\n');
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log('ℹ️  Índice en FRIENDS_WITH.created_at ya existe\n');
        } else {
          throw error;
        }
      }

      // 7. Verificar índices creados
      console.log('📊 Verificando índices creados...');
      const indexesResult = await session.run(`
        SHOW INDEXES
      `);
      
      console.log(`\n✅ Total de índices: ${indexesResult.records.length}`);
      indexesResult.records.forEach((record: any) => {
        const index = record.get('name');
        const state = record.get('state');
        console.log(`  - ${index}: ${state}`);
      });

      console.log('\n✅ Configuración de índices completada exitosamente');
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('❌ Error configurando índices:', error);
    process.exit(1);
  } finally {
    await neo4jService.close();
  }
}

setupIndexes().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

