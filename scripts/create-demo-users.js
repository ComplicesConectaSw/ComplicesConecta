/**
 * Script para crear usuarios demo en Supabase con integridad de datos
 * Verifica existencia antes de crear y mantiene foreign key constraints
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no encontrada en variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Definir usuarios demo
const demoUsers = [
  {
    email: 'single@outlook.es',
    password: 'Demo1234!',
    profile: {
      name: 'Usuario Demo Single',
      bio: 'Perfil de demostración Single',
      age: 28,
      gender: 'Mujer',
      interested_in: 'Hombre',
      account_type: 'single',
      is_verified: true,
      personality_traits: { openness: 75 },
      lifestyle_preferences: { activity_level: 'moderate' },
      location_preferences: { max_distance: 50 }
    }
  },
  {
    email: 'pareja@outlook.es',
    password: 'Demo1234!',
    profile: {
      name: 'Usuario Demo Pareja',
      bio: 'Perfil de demostración Pareja',
      age: 30,
      gender: 'Hombre',
      interested_in: 'Mujer',
      account_type: 'couple',
      is_verified: true,
      personality_traits: { conscientiousness: 85 },
      lifestyle_preferences: { social_preference: 'balanced' },
      location_preferences: { max_distance: 100 }
    }
  },
  {
    email: 'admin@outlook.es',
    password: 'Demo1234!',
    profile: {
      name: 'Administrador Demo',
      bio: 'Perfil administrador para testing',
      age: 35,
      gender: 'Hombre',
      interested_in: 'Mujer',
      account_type: 'single',
      is_verified: true,
      personality_traits: { openness: 85 },
      lifestyle_preferences: { activity_level: 'high' },
      location_preferences: { max_distance: 200 }
    }
  },
  {
    email: 'moderador@outlook.es',
    password: 'Demo1234!',
    profile: {
      name: 'Moderador Demo',
      bio: 'Perfil moderador para testing',
      age: 33,
      gender: 'No binario',
      interested_in: 'Todos',
      account_type: 'single',
      is_verified: true,
      personality_traits: { extraversion: 70 },
      lifestyle_preferences: { activity_level: 'moderate' },
      location_preferences: { max_distance: 150 }
    }
  }
];

async function checkExistingUsers() {
  console.log('🔍 Verificando usuarios existentes...');
  
  const existingUsers = {};
  
  for (const user of demoUsers) {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error(`❌ Error al verificar usuario ${user.email}:`, error);
        continue;
      }
      
      const existingUser = data.users.find(u => u.email === user.email);
      if (existingUser) {
        console.log(`✅ Usuario ${user.email} ya existe con ID: ${existingUser.id}`);
        existingUsers[user.email] = existingUser.id;
      } else {
        console.log(`ℹ️ Usuario ${user.email} no existe, será creado`);
      }
    } catch (error) {
      console.error(`❌ Error al verificar ${user.email}:`, error);
    }
  }
  
  return existingUsers;
}

async function createUser(userConfig) {
  console.log(`🔄 Creando usuario ${userConfig.email}...`);
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userConfig.email,
      password: userConfig.password,
      email_confirm: true,
      user_metadata: {
        name: userConfig.profile.name
      }
    });
    
    if (error) {
      console.error(`❌ Error al crear usuario ${userConfig.email}:`, error);
      return null;
    }
    
    console.log(`✅ Usuario ${userConfig.email} creado con ID: ${data.user.id}`);
    return data.user.id;
  } catch (error) {
    console.error(`❌ Error inesperado al crear ${userConfig.email}:`, error);
    return null;
  }
}

async function createProfile(userId, profileConfig) {
  console.log(`🔄 Creando perfil para usuario ID: ${userId}...`);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        ...profileConfig
      })
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error al crear perfil:`, error);
      return false;
    }
    
    console.log(`✅ Perfil creado para ${profileConfig.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Error inesperado al crear perfil:`, error);
    return false;
  }
}

async function validateIntegrity() {
  console.log('🔍 Validando integridad de datos...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        name,
        users:user_id (
          email
        )
      `)
      .not('users', 'is', null);
    
    if (error) {
      console.error('❌ Error al validar integridad:', error);
      return false;
    }
    
    console.log('✅ Validación de integridad completada:');
    data.forEach(profile => {
      console.log(`  - ${profile.name} → ${profile.users?.email} (${profile.user_id})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error inesperado en validación:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando creación de usuarios demo...\n');
  
  // Paso 1: Verificar usuarios existentes
  const existingUsers = await checkExistingUsers();
  console.log('');
  
  // Paso 2: Crear usuarios faltantes y perfiles
  const userIds = {};
  
  for (const userConfig of demoUsers) {
    let userId = existingUsers[userConfig.email];
    
    // Si el usuario no existe, crearlo
    if (!userId) {
      userId = await createUser(userConfig);
      if (!userId) {
        console.error(`❌ No se pudo crear usuario ${userConfig.email}, saltando...`);
        continue;
      }
    }
    
    userIds[userConfig.email] = userId;
    
    // Verificar si ya tiene perfil
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile) {
      console.log(`ℹ️ Perfil ya existe para ${userConfig.email}`);
    } else {
      // Crear perfil
      await createProfile(userId, userConfig.profile);
    }
  }
  
  console.log('');
  
  // Paso 3: Validar integridad
  await validateIntegrity();
  
  console.log('\n🎉 Proceso completado!');
  
  // Mostrar UUIDs para referencia
  console.log('\n📋 UUIDs generados:');
  Object.entries(userIds).forEach(([email, id]) => {
    console.log(`  ${email}: ${id}`);
  });
}

// Ejecutar script
main().catch(console.error);
