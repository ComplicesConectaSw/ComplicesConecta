# 🏗️ ComplicesConecta - Estructura del Proyecto Actualizada

## 📋 Información General
- **Proyecto:** ComplicesConecta v2.1.4
- **Tecnología:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **UI:** Tailwind CSS + Radix UI
- **Estado:** Producción Activa
- **Última actualización:** 07 de enero 2025, 03:30 AM

---

## 🎯 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend React + TS                      │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Backend                         │
├─────────────────────────────────────────────────────────────┤
│                   Capacitor Mobile                          │
└─────────────────────────────────────────────────────────────┘
```

### Frontend React + TS
- **Componentes:** Reutilizables con Radix UI
- **Páginas:** 40+ páginas con lazy loading
- **Hooks:** useAuth, useTokens, useFeatures
- **Estado:** React Query + Context API
- **Routing:** React Router v6

### Supabase Backend
- **Base de Datos:** PostgreSQL con 14+ tablas
- **Autenticación:** JWT + RLS policies
- **Storage:** 3 buckets (profile-images, gallery-images, chat-media)
- **Edge Functions:** 6 funciones serverless
- **Real-time:** Chat y notificaciones

### Capacitor Mobile
- **Android App:** APK generado automáticamente
- **iOS App:** Configurado para App Store
- **Plugins:** Camera, Storage, Push Notifications

---

## 📁 Estructura de Directorios

```
conecta-social-comunidad-main/
├── 📱 android/                    # Aplicación móvil Android
│   ├── app/src/main/             # Código fuente Android
│   └── gradle/                   # Configuración Gradle
├── 📄 docs-public/               # Documentación pública
│   ├── API.md                    # Documentación API
│   ├── COMPONENTS.md             # Guía de componentes
│   └── DEPLOY.md                 # Guía de despliegue
├── 🌐 public/                    # Archivos estáticos
│   ├── app-release.apk          # APK Android
│   ├── compliceslogo.png        # Logo principal
│   └── favicon.ico              # Favicon
├── 🛠️ scripts/                   # Scripts de automatización
│   ├── sql_scripts/             # Scripts SQL
│   ├── DEFINITIVE_RESET.sql     # Reset completo BD
│   └── VERIFY_TABLES.sql        # Verificación tablas
├── ⚛️ src/                       # Código fuente principal
│   ├── 🧩 components/           # Componentes React
│   │   ├── analytics/           # Componentes de analíticas
│   │   ├── auth/               # Componentes de autenticación
│   │   ├── chat/               # Sistema de chat
│   │   ├── discover/           # Funcionalidad descubrimiento
│   │   ├── events/             # Gestión de eventos
│   │   ├── gallery/            # Galería de imágenes
│   │   ├── invitations/        # Sistema de invitaciones
│   │   ├── matches/            # Sistema de matches
│   │   ├── navigation/         # Navegación y menús
│   │   ├── profile/            # Perfiles de usuario
│   │   ├── settings/           # Configuraciones
│   │   ├── tokens/             # Sistema de tokens CMPX/GTK
│   │   └── ui/                 # Componentes UI base
│   ├── 🎣 hooks/               # Custom React Hooks
│   │   ├── useAuth.ts          # Hook de autenticación
│   │   ├── useTokens.ts        # Hook de tokens
│   │   └── use-toast.ts        # Hook de notificaciones
│   ├── 🔧 lib/                 # Librerías y utilidades
│   │   ├── app-config.ts       # Configuración global
│   │   ├── data.ts             # Datos mock y constantes
│   │   ├── invitations.ts      # Lógica de invitaciones
│   │   └── media.ts            # Gestión de medios
│   ├── 📄 pages/               # Páginas de la aplicación
│   │   ├── Admin.tsx           # Panel admin demo
│   │   ├── AdminProduction.tsx # Panel admin producción
│   │   ├── Auth.tsx            # Autenticación
│   │   ├── Chat.tsx            # Chat público
│   │   ├── Discover.tsx        # Descubrimiento
│   │   ├── Events.tsx          # Eventos VIP
│   │   ├── Index.tsx           # Página principal
│   │   ├── Matches.tsx         # Matches y conexiones
│   │   ├── Profiles.tsx        # Lista de perfiles
│   │   ├── Settings.tsx        # Configuraciones
│   │   └── Tokens.tsx          # Gestión de tokens
│   └── 🔗 integrations/        # Integraciones externas
│       └── supabase/           # Cliente Supabase
├── 🗄️ supabase/                 # Configuración Supabase
│   ├── functions/              # Edge Functions
│   └── migrations/             # Migraciones BD
├── 🧪 tests/                    # Tests automatizados
│   ├── e2e/                    # Tests end-to-end
│   ├── integration/            # Tests de integración
│   └── unit/                   # Tests unitarios
└── 📋 Archivos de configuración
    ├── package.json            # Dependencias npm
    ├── vite.config.ts          # Configuración Vite
    ├── tailwind.config.ts      # Configuración Tailwind
    └── tsconfig.json           # Configuración TypeScript
```

---

## 🔐 Sistema de Autenticación

### Modos de Operación
1. **Modo Demo** (`VITE_APP_MODE=demo`)
   - Credenciales hardcodeadas
   - Datos mock para desarrollo
   - Sin conexión real a Supabase para usuarios normales

2. **Modo Producción** (`VITE_APP_MODE=production`)
   - Autenticación real con Supabase
   - Base de datos PostgreSQL
   - Usuarios reales verificados

### Usuarios Administradores
- **complicesconectasw@outlook.es** - Admin principal
- **djwacko28@gmail.com** - Admin secundario
- Acceso completo a panel de administración
- Pueden usar Supabase incluso en modo demo

---

## 🗃️ Base de Datos (Supabase)

### Tablas Principales
```sql
-- Usuarios y perfiles
profiles              # Perfiles de usuario
user_roles           # Roles y permisos
user_token_balances  # Balances de tokens CMPX

-- Sistema social
matches              # Matches entre usuarios
invitations          # Invitaciones y solicitudes
chat_rooms           # Salas de chat
messages             # Mensajes de chat

-- Contenido
events               # Eventos VIP
gallery_images       # Galería de imágenes
faq_items           # Preguntas frecuentes

-- Métricas y admin
app_metrics         # Métricas de la aplicación
apk_downloads       # Descargas del APK
```

### Políticas RLS (Row Level Security)
- **Perfiles:** Solo propietario puede editar
- **Matches:** Solo usuarios involucrados pueden ver
- **Chat:** Acceso basado en permisos
- **Galería:** Imágenes públicas vs privadas
- **Admin:** Solo administradores pueden acceder

---

## 🎨 Sistema de UI/UX

### Tema Visual
- **Gradiente principal:** Púrpura a rosa (`bg-hero-gradient`)
- **Colores:** Esquema oscuro con acentos vibrantes
- **Tipografía:** Inter font family
- **Iconos:** Lucide React icons

### Animaciones
- **Partículas flotantes:** 16 elementos animados
- **Scroll suave:** Transiciones de 0.3s
- **Hover effects:** Scale y glow effects
- **Fade-in:** Animaciones de entrada

### Componentes Clave
- **Header:** Navegación principal
- **Tabs:** Sistema de pestañas
- **Cards:** Contenedores de información
- **Modals:** Diálogos y formularios
- **Buttons:** Botones interactivos

---

## 🪙 Sistema de Tokens

### Tokens CMPX (Interno)
- **Propósito:** Recompensas y gamificación
- **Distribución:** 40% para usuarios
- **Límites:** 500 CMPX/mes por referidos
- **Estado:** Activo en beta

### Tokens GTK (Blockchain)
- **Estándar:** ERC20 en Ethereum
- **Staking:** Pausado hasta release
- **Lockup:** 30 días mínimo
- **Estado:** Preparado para mainnet

---

## 📱 Aplicación Móvil

### Android
- **APK:** Generado automáticamente
- **Tamaño:** ~15MB optimizado
- **Compatibilidad:** Android 7.0+
- **Features:** Camera, Push notifications

### iOS
- **Estado:** Configurado para App Store
- **Certificados:** Preparados
- **TestFlight:** Listo para beta testing

---

## 🚀 Despliegue y CI/CD

### Entornos
- **Desarrollo:** localhost:5173
- **Staging:** Vercel preview
- **Producción:** https://complices-conecta.vercel.app

### Pipeline CI/CD
```yaml
Triggers: Push to master
├── Lint & Type Check
├── Unit Tests (Vitest)
├── E2E Tests (Playwright)
├── Build & Deploy (Vercel)
└── APK Build (GitHub Actions)
```

### Monitoreo
- **Logs:** Supabase Dashboard
- **Métricas:** Google Analytics
- **Errores:** Console logging
- **Performance:** Lighthouse CI

---

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```bash
# Producción (.env)
VITE_APP_MODE=production
VITE_SUPABASE_URL=https://axtvqnozatbmllvwzuim.supabase.co
VITE_SUPABASE_ANON_KEY=[key]

# Demo (.env.demo)
VITE_APP_MODE=demo
```

### Scripts Principales
```bash
npm run dev          # Desarrollo local
npm run build        # Build producción
npm run test         # Tests unitarios
npm run test:e2e     # Tests E2E
npm run lint         # Linting
npm run type-check   # Verificación TypeScript
```

---

## 📊 Métricas y KPIs

### Usuarios
- **Total:** Crecimiento orgánico
- **Activos:** 70% de usuarios totales
- **Premium:** Conversión del 15%
- **Verificados:** WorldID integration

### Engagement
- **Matches:** Algoritmo de compatibilidad
- **Mensajes:** Chat público y privado
- **Eventos:** Participación VIP
- **Tokens:** Actividad de recompensas

---

## 🛡️ Seguridad

### Autenticación
- **JWT:** Tokens seguros
- **RLS:** Políticas granulares
- **Roles:** Admin, User, Premium
- **Verificación:** Email + WorldID

### Datos
- **Encriptación:** En tránsito y reposo
- **Backup:** Automático diario
- **GDPR:** Cumplimiento completo
- **Auditoría:** Logs detallados

---

## 🔄 Estado Actual del Proyecto

### ✅ Completado
- Sistema de autenticación dual (demo/producción)
- Panel de administración funcional
- UI/UX moderna con animaciones
- Sistema de tokens CMPX/GTK
- Tests automatizados (92.8% success)
- CI/CD pipeline completo
- Aplicación móvil Android

### 🔄 En Progreso
- Optimización de rendimiento
- Nuevas funcionalidades sociales
- Expansión del sistema de tokens
- Tests de usuario beta

### 📋 Próximos Pasos
- Launch público oficial
- Marketing y adquisición
- Monetización premium
- Expansión internacional

---

**Última actualización:** 07 de enero 2025, 03:30 AM  
**Versión:** v2.1.4  
**Estado:** Producción Activa ✅
