# 🚀 ComplicesConecta - Guía de Despliegue v2.0.0

## 📋 Configuración de Producción

### 🌐 Vercel Deployment

#### 1. Preparar Variables de Entorno
Crear archivo `.env.production` en Vercel:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# hCaptcha Configuration
VITE_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
HCAPTCHA_SECRET=0x0000000000000000000000000000000000000000

# World ID Configuration
VITE_WORLD_ID_APP_ID=app_staging_12345
WORLD_ID_API_KEY=sk_12345...

# Stripe Configuration (Production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...

# Environment Settings
VITE_APP_ENV=production
VITE_APP_PHASE=premium
VITE_TOKENS_ENABLED=true
VITE_PREMIUM_FEATURES_ENABLED=true
```

#### 2. Configurar Vercel Project

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Configurar proyecto
vercel

# Configurar variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add VITE_HCAPTCHA_SITE_KEY
vercel env add HCAPTCHA_SECRET
# ... (repetir para todas las variables)

# Deploy
vercel --prod
```

#### 3. Configurar vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 🗄️ Supabase Configuration

#### 1. Configurar Proyecto Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Inicializar proyecto local
supabase init

# Link con proyecto remoto
supabase link --project-ref your-project-ref

# Aplicar migraciones
supabase db push

# Deploy Edge Functions
supabase functions deploy hcaptcha-verify
supabase functions deploy worldid-verify
```

#### 2. Configurar Variables de Entorno en Supabase

En el dashboard de Supabase > Settings > API:

```env
# Edge Functions Environment Variables
HCAPTCHA_SECRET=0x0000000000000000000000000000000000000000
WORLD_ID_API_KEY=sk_12345...
STRIPE_SECRET_KEY=sk_live_51...
```

#### 3. Configurar Storage Buckets

```sql
-- Crear buckets de storage
INSERT INTO storage.buckets (id, name, public) VALUES 
('profile-images', 'profile-images', false),
('gallery-images', 'gallery-images', true),
('chat-media', 'chat-media', false);

-- Aplicar políticas RLS
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

CREATE POLICY "Public gallery images are viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');
```

#### 4. Configurar RLS Policies

```sql
-- Ejecutar script de políticas RLS
\i supabase/migrations/20250101_120000_rls_policies.sql

-- Verificar políticas activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 📱 Android APK Build

#### 1. Configurar Capacitor

```bash
# Instalar dependencias
npm install @capacitor/core @capacitor/cli @capacitor/android

# Inicializar Capacitor
npx cap init

# Agregar plataforma Android
npx cap add android

# Configurar capacitor.config.ts
```

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.complicesconecta.app',
  appName: 'ComplicesConecta',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#667eea",
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
```

#### 2. Build y Deploy APK

```bash
# Build web app
npm run build

# Sync con Capacitor
npx cap sync

# Abrir Android Studio
npx cap open android

# O build desde CLI
cd android
./gradlew assembleRelease

# APK estará en: android/app/build/outputs/apk/release/
```

### 🔒 Configuración de Seguridad

#### 1. CORS Configuration

```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://complicesconecta.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};
```

#### 2. Rate Limiting

```sql
-- Configurar rate limiting en Supabase
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Crear tabla de rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ip_address, endpoint, window_start)
);

-- Función de rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  client_ip INET,
  endpoint_name TEXT,
  max_requests INTEGER DEFAULT 100,
  window_minutes INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  current_requests INTEGER;
BEGIN
  -- Limpiar ventanas expiradas
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 minute' * window_minutes;
  
  -- Obtener requests actuales
  SELECT requests_count INTO current_requests
  FROM rate_limits 
  WHERE ip_address = client_ip 
    AND endpoint = endpoint_name 
    AND window_start >= NOW() - INTERVAL '1 minute' * window_minutes;
  
  IF current_requests IS NULL THEN
    -- Primera request en esta ventana
    INSERT INTO rate_limits (ip_address, endpoint, requests_count, window_start)
    VALUES (client_ip, endpoint_name, 1, NOW());
    RETURN TRUE;
  ELSIF current_requests < max_requests THEN
    -- Incrementar contador
    UPDATE rate_limits 
    SET requests_count = requests_count + 1
    WHERE ip_address = client_ip AND endpoint = endpoint_name;
    RETURN TRUE;
  ELSE
    -- Rate limit excedido
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

#### 3. SSL/TLS Configuration

```bash
# Verificar certificados SSL
curl -I https://complicesconecta.vercel.app

# Configurar HSTS headers en vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 📊 Monitoreo y Analytics

#### 1. Configurar Logging

```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.VITE_APP_ENV === 'production') {
      // Enviar a servicio de logging (ej. LogRocket, Sentry)
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    if (import.meta.env.VITE_APP_ENV === 'production') {
      // Enviar a servicio de error tracking
      console.error(`[ERROR] ${message}`, error);
    }
  }
};
```

#### 2. Performance Monitoring

```typescript
// src/lib/analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    // Integrar con Google Analytics, Mixpanel, etc.
    gtag('event', eventName, properties);
  }
};

export const trackPageView = (path: string) => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path
    });
  }
};
```

### 🧪 Testing en Producción

#### 1. Health Checks

```bash
# Verificar endpoints críticos
curl -f https://complicesconecta.vercel.app/api/health
curl -f https://your-project.supabase.co/rest/v1/

# Verificar Edge Functions
curl -X POST https://your-project.supabase.co/functions/v1/hcaptcha-verify \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"token":"test-token"}'
```

#### 2. Load Testing

```bash
# Instalar artillery
npm install -g artillery

# Crear config de load testing
# artillery.yml
config:
  target: 'https://complicesconecta.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Load test main pages"
    requests:
      - get:
          url: "/"
      - get:
          url: "/auth"
      - get:
          url: "/discover"

# Ejecutar test
artillery run artillery.yml
```

### 🔄 CI/CD Pipeline

#### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### 📝 Checklist de Despliegue

- [ ] Variables de entorno configuradas en Vercel
- [ ] Supabase proyecto configurado y migrado
- [ ] Edge Functions desplegadas
- [ ] Storage buckets creados con políticas RLS
- [ ] Certificados SSL activos
- [ ] Rate limiting configurado
- [ ] Monitoreo y analytics configurados
- [ ] Health checks pasando
- [ ] Load testing completado
- [ ] CI/CD pipeline funcionando
- [ ] APK Android generada y firmada
- [ ] Documentación actualizada

### 🚨 Troubleshooting

#### Errores Comunes

1. **CORS Errors**
   ```bash
   # Verificar configuración de CORS en Edge Functions
   # Asegurar que el dominio esté en la whitelist
   ```

2. **RLS Policy Errors**
   ```sql
   -- Verificar políticas activas
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   
   -- Verificar permisos de usuario
   SELECT auth.uid(), auth.role();
   ```

3. **Edge Function Timeouts**
   ```typescript
   // Aumentar timeout en función
   export const config = {
     timeout: 30000 // 30 segundos
   };
   ```

4. **Build Errors**
   ```bash
   # Limpiar cache
   rm -rf node_modules dist .vercel
   npm install
   npm run build
   ```
