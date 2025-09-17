# 📋 Guía de Instalación - ComplicesConecta Swinger v2.9.2

> **Plataforma Swinger Mexicana - Instalación Completa**  
> **Galería Responsiva • Sincronización Android • APK Lista**

## 🔧 Prerrequisitos

### Sistema Operativo
- **Windows**: 10/11 (64-bit)
- **macOS**: 10.15+ (Catalina o superior)
- **Linux**: Ubuntu 20.04+ / Debian 10+

### Software Requerido
- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior (incluido con Node.js)
- **Git**: Última versión estable

### Verificar Instalación
```bash
node --version    # v18.0.0+
npm --version     # v8.0.0+
git --version     # 2.30.0+
```

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio Swinger
```bash
# Clonar plataforma swinger mexicana
git clone https://github.com/ComplicesConectaSw/ComplicesConecta.git
cd ComplicesConecta

# Verificar rama principal
git branch
# * main (contexto swinger mexicano v2.9.1)
```

### 2. Instalar Dependencias Lifestyle
```bash
# Instalar dependencias de la plataforma swinger
npm install

# Verificar instalación exitosa
npm list --depth=0

# Dependencias específicas del lifestyle:
# - React 18.3.1 (UI swinger responsiva)
# - Supabase (backend con RLS para privacidad)
# - TailwindCSS (temas personalizados por género)
# - Framer Motion (animaciones lifestyle)
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar variables de entorno
# Windows: notepad .env.local
# macOS/Linux: nano .env.local
```

#### Variables Requeridas para Plataforma Swinger:
```env
# Supabase Configuration (Backend Swinger)
VITE_SUPABASE_URL=tu_supabase_url_swinger
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_swinger

# App Configuration (Modo Lifestyle)
VITE_APP_MODE=development  # development | production
VITE_APP_PHASE=lifestyle   # lifestyle para contexto swinger

# Swinger Context Configuration
VITE_LIFESTYLE_MODE=true   # Habilita terminología swinger
VITE_MEXICO_LOCALIZATION=true  # Localización mexicana
VITE_EXPLICIT_DEMO=true    # Términos explícitos en demo

# Optional: Analytics & Monitoring
VITE_SENTRY_DSN=tu_sentry_dsn_swinger
```

### 4. Ejecutar en Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en:
# http://localhost:5173
```

## 🗄️ Configuración de Base de Datos Swinger

### Supabase Setup para Lifestyle
1. **Crear cuenta en Supabase**: https://supabase.com
2. **Crear proyecto swinger**: `complices-conecta-lifestyle`
3. **Obtener credenciales**:
   - URL del proyecto swinger
   - Anon key (clave pública lifestyle)

### Esquema de Base de Datos Lifestyle
La plataforma incluye tablas especializadas para el ambiente swinger:
- `profiles`: Perfiles con intereses lifestyle
- `lifestyle_interests`: 30+ intereses swinger categorizados
- `swinger_matches`: Matches entre miembros del ambiente
- `lifestyle_events`: Eventos y fiestas privadas
- `couple_profiles`: Perfiles especializados para parejas

### Ejecutar Migraciones Swinger
```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Inicializar Supabase para plataforma lifestyle
supabase init

# Aplicar migraciones específicas del ambiente swinger
supabase db push

# Ejecutar scripts SQL del lifestyle
# - 01_CREATE_MATCHING_TABLES_STEP1.sql
# - 02_CREATE_MATCHING_INDEXES_STEP2.sql  
# - 03_CREATE_MATCHING_RLS_STEP3.sql
# - HABILITAR_RLS_COMPLETO.sql (privacidad swinger)
```

## 📱 Desarrollo Mobile Swinger

### APK Android Lifestyle Funcional
La plataforma incluye APK Android completamente funcional con:
- Contexto swinger mexicano completo
- Terminología lifestyle auténtica
- Localización 100% mexicana
- Temas personalizados por género

### Android Setup Swinger
```bash
# Instalar Capacitor para app lifestyle
npm install @capacitor/core @capacitor/cli

# Agregar plataforma Android swinger
npx cap add android

# Sincronizar archivos con contexto lifestyle
npx cap sync android

# Configurar capacitor.config.ts para swinger:
# - appId: 'com.complicesconecta.lifestyle'
# - appName: 'ComplicesConecta Swinger'
# - bundledWebRuntime: false (React completo)

# Abrir en Android Studio
npx cap open android
```

### iOS Setup (macOS únicamente)
```bash
# Agregar plataforma iOS
npx cap add ios

# Sincronizar archivos
npx cap sync ios

# Abrir en Xcode
npx cap open ios
```

## 🧪 Testing Lifestyle

### Suite de Tests Swinger (101/101 Pasando)
La plataforma incluye tests específicos para el contexto lifestyle:

### Ejecutar Tests Swinger
```bash
# Tests unitarios lifestyle
npm run test
# Incluye: auth.test.ts, lifestyle-interests.test.ts

# Tests con cobertura swinger
npm run test:coverage
# Cobertura: 85%+ en componentes lifestyle

# Tests E2E del ambiente
npm run test:e2e
# Incluye: auth-flow.spec.ts, swinger-matching.spec.ts

# Tests específicos del lifestyle:
# - Validación +18 años
# - Terminología swinger auténtica
# - Localización mexicana
# - Diferenciación por género
```

## 🏗️ Build para Producción Swinger

### Web Build Lifestyle
```bash
# Generar build optimizado para plataforma swinger
npm run build
# Build incluye:
# - Terminología lifestyle completa
# - Localización mexicana 100%
# - Temas por género optimizados
# - Assets swinger comprimidos

# Preview del build swinger
npm run preview
# Disponible en: http://localhost:4173
```

### Mobile Build Swinger
```bash
# Build para Android lifestyle
npm run build:android
# Genera: app-release.apk con contexto swinger

# Build para iOS lifestyle (macOS únicamente)
npm run build:ios
# Genera: ComplicesConecta.ipa para App Store

# APK Android funcional disponible:
# - Tamaño: ~15MB optimizado
# - React app completa cargada
# - Contexto swinger mexicano 100%
```

## ⚠️ Solución de Problemas Lifestyle

### Problemas Específicos del Contexto Swinger

### Error: "Module not found" Lifestyle
```bash
# Limpiar node_modules y reinstalar dependencias swinger
rm -rf node_modules package-lock.json
npm install

# Verificar que las dependencias lifestyle estén instaladas
npm list | grep -E "react|supabase|tailwind|framer"
```

### Error: "Port 5173 already in use" 
```bash
# Usar puerto diferente para desarrollo lifestyle
npm run dev -- --port 3000
# o
npm run dev -- --port 8080
```

### Error: "Contexto Swinger no carga"
```bash
# Verificar variables de entorno lifestyle
cat .env.local | grep LIFESTYLE

# Confirmar archivos de contexto swinger
ls src/lib/lifestyle-interests.ts
ls src/demo/demoData.ts

# Validar terminología en componentes
grep -r "hotwife" src/components/
```

### Error: Supabase Connection Lifestyle
1. Verificar variables de entorno swinger en `.env.local`
2. Confirmar que el proyecto Supabase lifestyle esté activo
3. Revisar configuración de RLS para privacidad swinger
4. Validar que las tablas lifestyle estén creadas:
   ```sql
   SELECT * FROM profiles WHERE lifestyle_verified = true;
   SELECT * FROM lifestyle_interests;
   ```

### Error: Build Failed
```bash
# Verificar TypeScript
npm run type-check

# Linter
npm run lint

# Fix automático
npm run lint:fix
```

## 🔧 Scripts Disponibles Lifestyle

| Script | Descripción Swinger |
|--------|--------------------|
| `npm run dev` | Servidor desarrollo lifestyle |
| `npm run build` | Build producción swinger |
| `npm run preview` | Preview build lifestyle |
| `npm run test` | Tests unitarios swinger |
| `npm run test:e2e` | Tests E2E del ambiente |
| `npm run lint` | Verificar código lifestyle |
| `npm run type-check` | Verificar TypeScript swinger |
| `npm run build:android` | APK Android lifestyle |
| `npm run lifestyle:validate` | Validar contexto swinger |

## 📞 Soporte Lifestyle

Si encuentras problemas durante la instalación de la plataforma swinger:

### Problemas Comunes del Lifestyle
1. **Revisar logs swinger**: Buscar errores específicos del contexto lifestyle
2. **Verificar versiones**: Confirmar Node.js 18+ y npm 8+ actualizados
3. **Limpiar caché lifestyle**: `npm cache clean --force`
4. **Validar contexto swinger**: Verificar que los intereses lifestyle se carguen
5. **Contactar soporte**: soporte@complicesconecta.com

### Recursos Adicionales
- **Documentación técnica**: `TECHNICAL_DETAILS.md`
- **Estructura del proyecto**: `PROJECT_STRUCTURE.md`
- **Notas de versión**: `RELEASE_NOTES.md`
- **Auditorías de seguridad**: `AUDITS.md`

### Validación Post-Instalación
```bash
# Verificar que el contexto swinger esté activo
curl http://localhost:5173/api/lifestyle/validate

# Confirmar terminología lifestyle cargada
grep -r "hotwife\|bull\|unicornio" src/

# Validar localización mexicana
grep -r "CDMX\|Guadalajara\|Monterrey" src/
```

---

## 🎯 Instalación Completada v2.9.1

### ✅ Verificación Final Lifestyle
- **Contexto Swinger**: Terminología auténtica cargada
- **Localización México**: Sin referencias extranjeras
- **Diferenciación Género**: Temas y contenido personalizados
- **APK Android**: Funcional con React completo
- **Base de Datos**: RLS configurado para privacidad
- **Tests**: 101/101 pasando (100% success rate)

**© 2025 ComplicesConecta** - Plataforma Swinger Mexicana v2.9.1  
**Instalación Lifestyle Completa** - 16 de Septiembre, 2025
