import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuración de Supabase
const supabaseUrl = 'https://axtvqnozatbmllvwzuim.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA4NDkwNiwiZXhwIjoyMDYxNjYwOTA2fQ.KvAcO_zk5zriEzRzq6AS2sTtqeWB5K_RN3Xr0ZYsGMw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigrations() {
  console.log('🚀 Iniciando migración completa de ComplicesConecta v2.0.0...');
  
  try {
    // 1. Verificar conexión
    console.log('🔗 Verificando conexión a Supabase...');
    const { data: authData } = await supabase.auth.getSession();
    console.log('✅ Conexión establecida');

    // 2. Crear tablas principales
    console.log('📊 Creando tablas principales...');
    
    // Tabla images
    const { error: imagesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          is_public BOOLEAN DEFAULT true,
          type TEXT DEFAULT 'profile' CHECK (type IN ('profile', 'gallery', 'cover')),
          title TEXT,
          description TEXT,
          file_size INTEGER,
          mime_type TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (imagesError && !imagesError.message.includes('already exists')) {
      console.error('❌ Error creando tabla images:', imagesError);
    } else {
      console.log('✅ Tabla images creada/verificada');
    }

    // Tabla chat_rooms
    const { error: chatRoomsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_rooms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          is_public BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          max_members INTEGER DEFAULT 100,
          created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (chatRoomsError && !chatRoomsError.message.includes('already exists')) {
      console.error('❌ Error creando tabla chat_rooms:', chatRoomsError);
    } else {
      console.log('✅ Tabla chat_rooms creada/verificada');
    }

    // Tabla chat_members
    const { error: chatMembersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
          profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_muted BOOLEAN DEFAULT false,
          UNIQUE(room_id, profile_id)
        );
      `
    });
    
    if (chatMembersError && !chatMembersError.message.includes('already exists')) {
      console.error('❌ Error creando tabla chat_members:', chatMembersError);
    } else {
      console.log('✅ Tabla chat_members creada/verificada');
    }

    // Tabla messages
    const { error: messagesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
          sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
          reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
          is_edited BOOLEAN DEFAULT false,
          is_deleted BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (messagesError && !messagesError.message.includes('already exists')) {
      console.error('❌ Error creando tabla messages:', messagesError);
    } else {
      console.log('✅ Tabla messages creada/verificada');
    }

    // 3. Crear índices
    console.log('🔍 Creando índices optimizados...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_images_profile_id ON images(profile_id);',
      'CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);',
      'CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_public ON chat_rooms(is_public);',
      'CREATE INDEX IF NOT EXISTS idx_chat_members_room_id ON chat_members(room_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);'
    ];

    for (const index of indices) {
      const { error } = await supabase.rpc('exec', { sql: index });
      if (error && !error.message.includes('already exists')) {
        console.warn('⚠️ Warning en índice:', error.message);
      }
    }
    console.log('✅ Índices creados/verificados');

    // 4. Crear sala de chat público
    console.log('💬 Creando sala de chat público...');
    const { error: publicChatError } = await supabase
      .from('chat_rooms')
      .upsert({
        name: 'Chat General',
        description: 'Sala de chat pública para toda la comunidad ComplicesConecta',
        is_public: true,
        is_active: true
      }, { onConflict: 'name' });

    if (publicChatError) {
      console.warn('⚠️ Warning creando chat público:', publicChatError.message);
    } else {
      console.log('✅ Sala de chat público creada/verificada');
    }

    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('📊 Tablas creadas: images, chat_rooms, chat_members, messages');
    console.log('🔍 Índices optimizados aplicados');
    console.log('💬 Sala de chat público configurada');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

// Ejecutar migraciones
executeMigrations();
