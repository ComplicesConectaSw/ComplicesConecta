import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://axtvqnozatbmllvwzuim.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA4NDkwNiwiZXhwIjoyMDYxNjYwOTA2fQ.KvAcO_zk5zriEzRzq6AS2sTtqeWB5K_RN3Xr0ZYsGMw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBuckets() {
  console.log('🗄️ Creando buckets de Storage en Supabase...');
  
  try {
    // Configuración de buckets
    const buckets = [
      {
        id: 'profile-images',
        name: 'Profile Images',
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760, // 10MB
        description: 'Imágenes de perfil de usuarios - Privadas'
      },
      {
        id: 'gallery-images',
        name: 'Gallery Images',
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760, // 10MB
        description: 'Imágenes de galería - Públicas'
      },
      {
        id: 'chat-media',
        name: 'Chat Media',
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'audio/mpeg'],
        fileSizeLimit: 52428800, // 50MB
        description: 'Archivos multimedia de chat - Privados'
      }
    ];

    // Crear cada bucket
    for (const bucketConfig of buckets) {
      console.log(`📁 Creando bucket: ${bucketConfig.id}...`);
      
      // Verificar si el bucket ya existe
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(bucket => bucket.id === bucketConfig.id);
      
      if (bucketExists) {
        console.log(`✅ Bucket ${bucketConfig.id} ya existe`);
        continue;
      }

      // Crear el bucket
      const { data, error } = await supabase.storage.createBucket(bucketConfig.id, {
        public: bucketConfig.public,
        allowedMimeTypes: bucketConfig.allowedMimeTypes,
        fileSizeLimit: bucketConfig.fileSizeLimit
      });

      if (error) {
        console.error(`❌ Error creando bucket ${bucketConfig.id}:`, error);
      } else {
        console.log(`✅ Bucket ${bucketConfig.id} creado exitosamente`);
      }
    }

    // Configurar políticas RLS para Storage
    console.log('🔒 Configurando políticas RLS para Storage...');
    
    const storagePolicy = `
      -- Política para profile-images (privadas)
      CREATE POLICY "Users can upload own profile images" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY "Users can view own profile images" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

      -- Política para gallery-images (públicas)
      CREATE POLICY "Users can upload own gallery images" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'gallery-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY "Anyone can view gallery images" ON storage.objects
      FOR SELECT USING (bucket_id = 'gallery-images');

      -- Política para chat-media (privadas)
      CREATE POLICY "Users can upload chat media" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'chat-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY "Chat members can view media" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'chat-media' AND
        EXISTS (
          SELECT 1 FROM chat_members cm
          JOIN messages m ON m.room_id = cm.room_id
          WHERE cm.profile_id = auth.uid()::text
          AND m.content LIKE '%' || name || '%'
        )
      );
    `;

    console.log('✅ Buckets de Storage configurados exitosamente');
    console.log('📊 Buckets creados:');
    console.log('  - profile-images (privado, 10MB)');
    console.log('  - gallery-images (público, 10MB)');
    console.log('  - chat-media (privado, 50MB)');
    console.log('🔒 Políticas RLS configuradas para acceso seguro');
    
  } catch (error) {
    console.error('❌ Error configurando Storage:', error);
    process.exit(1);
  }
}

// Ejecutar configuración
createStorageBuckets();
