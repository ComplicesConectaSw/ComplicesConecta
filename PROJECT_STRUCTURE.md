# 📁 Estructura del Proyecto - ComplicesConecta v2.9.3

**Última Actualización**: 07 de Enero, 2025 - 00:46 hrs  
**Contexto**: Plataforma Swinger Mexicana + Audit Completo Finalizado  
**Estado**: Sistema de Tokens CMPX/GTK Operativo + Production Ready  

## 🏗️ Arquitectura General

ComplicesConecta v2.9.3 es una plataforma swinger mexicana construida con React, TypeScript, Vite y Supabase. Incluye audit completo finalizado, sistema de tokens CMPX/GTK operativo con TokenChatBot wizard, optimizaciones UI/UX y sincronización Android con Capacitor.

```
conecta-social-comunidad-main/
├── 📁 src/                    # Código fuente principal
├── 📁 public/                 # Archivos estáticos
├── 📁 supabase/              # Configuración y migraciones de BD
├── 📁 tests/                 # Suite de pruebas
├── 📁 docs-unified/          # Documentación técnica
├── 📁 scripts/               # Scripts de utilidad
├── 📁 android/               # Configuración móvil Android
└── 📄 Archivos de configuración
```

## 📂 Directorio `/src` - Código Principal

### 🎨 `/src/components` - Componentes Swinger
```
components/
├── analytics/              # Métricas lifestyle (ubicaciones mexicanas)
├── animations/             # Animaciones temática swinger
├── auth/                   # Autenticación (+18, validación lifestyle)
├── chat/                   # Mensajería entre perfiles swinger
├── common/                 # Componentes base con tema lifestyle
├── demo/                   # Perfiles demo con terminología explícita
├── events/                 # Eventos swinger (fiestas privadas, clubs)
├── gallery/                # Galería responsiva lifestyle (UserGalleryPage)
├── images/                 # Galería de perfiles (ProfileImageGallery)
├── modals/                 # Modales responsivos y adaptativos
├── layout/                 # Layout con tema swinger mexicano
├── matching/               # Matching por intereses lifestyle
├── profile/                # Perfiles diferenciados (single/couple)
├── requests/               # Solicitudes de conexión swinger
├── settings/               # Configuración con intereses lifestyle
├── tokens/                 # Sistema de tokens CMPX/GTK
└── ui/                     # Componentes UI con tema swinger
```

### 📄 `/src/pages` - Páginas Lifestyle
```
pages/
├── Index.tsx               # Inicio con perfiles swinger mexicanos
├── Discover.tsx            # Descubrir perfiles lifestyle
├── Events.tsx              # Eventos swinger (clubs, fiestas privadas)
├── Matches.tsx             # Matches con intereses compartidos
├── Tokens.tsx              # Dashboard de tokens lifestyle
├── Profile*.tsx            # Perfiles contextualizados (single/couple)
├── Chat*.tsx               # Chat entre miembros del lifestyle
├── Gallery*.tsx            # Galería de contenido swinger
├── Settings*.tsx           # Configuración con intereses lifestyle
└── Auth.tsx                # Autenticación +18 con validación
```

### 🔧 `/src/lib` - Servicios Lifestyle
```
lib/
├── supabase.ts             # Cliente Supabase con contexto swinger
├── auth.ts                 # Autenticación lifestyle (+18)
├── chat.ts                 # Chat entre perfiles swinger
├── matching.ts             # Matching por compatibilidad lifestyle
├── email.ts                # Emails con terminología swinger
├── storage.ts              # Gestión de contenido lifestyle
├── tokens.ts               # Sistema de tokens swinger
├── lifestyle-interests.ts  # Intereses swinger mexicanos
├── sentry.ts               # Monitoreo de errores
└── utils.ts                # Utilidades con contexto mexicano
```

### 🎯 `/src/hooks` - Custom Hooks
```
hooks/
├── useAuth.ts              # Hook de autenticación
├── useProfileTheme.ts      # Temas de perfil
├── usePersistedState.ts    # Estado persistente
├── useChat.ts              # Funcionalidades de chat
└── useMatching.ts          # Lógica de matching
```

### 🎨 `/src/styles` - Estilos
```
styles/
├── globals.css             # Estilos globales
├── components.css          # Estilos de componentes
└── themes.css              # Sistema de temas
```

## 🗄️ Base de Datos Swinger - `/supabase`

### 📊 Tablas Lifestyle
```sql
-- Usuarios y Perfiles Swinger
├── profiles                # Perfiles lifestyle (+18, intereses swinger)
├── couple_profiles         # Perfiles de parejas swinger
├── user_roles              # Roles (single, couple, admin)

-- Sistema de Matching Lifestyle
├── invitations             # Invitaciones con contexto swinger
├── matches                 # Matches por compatibilidad lifestyle
├── interests               # Intereses swinger específicos
├── lifestyle_preferences   # Preferencias del ambiente

-- Comunicación Swinger
├── chat_rooms              # Salas de chat lifestyle
├── chat_members            # Miembros del ambiente
├── messages                # Mensajes con terminología swinger

-- Eventos y Contenido Lifestyle
├── events                  # Eventos swinger (clubs, fiestas)
├── gallery_images          # Galería de contenido lifestyle
├── image_access_requests   # Solicitudes de acceso a galerías
├── swinger_locations       # Ubicaciones en México

-- Tokens y Gamificación
├── user_tokens             # Balance de tokens lifestyle
└── token_transactions      # Transacciones del ambiente
```

### 🔒 Seguridad Lifestyle (RLS)
- **Row Level Security** habilitado para proteger privacidad swinger
- **Políticas granulares** por tipo de perfil (single/couple)
- **Validación +18** estricta en todos los registros
- **Separación completa** entre datos demo (explícitos) y reales
- **Protección de contenido** lifestyle sensible

## 🧪 Testing - `/tests`

### 🔬 Tests Unitarios (`/tests/unit`)
```
unit/
├── auth.test.ts            # Tests de autenticación
├── matching.test.ts        # Tests de matching
├── profiles.test.ts        # Tests de perfiles
├── emailService.test.ts    # Tests de email
└── invitations.test.ts     # Tests de invitaciones
```

### 🎭 Tests E2E (`/tests/e2e`)
```
e2e/
├── auth-flow.spec.ts       # Flujo de autenticación
├── profile-creation.spec.ts # Creación de perfiles
├── matching.spec.ts        # Sistema de matching
└── chat.spec.ts            # Funcionalidades de chat
```

## 📱 Mobile - `/android`

### 🤖 Configuración Android
```
android/
├── app/
│   ├── src/main/           # Código nativo Android
│   └── build.gradle        # Configuración de build
├── capacitor.settings.gradle
└── build.gradle            # Configuración del proyecto
```

## 📚 Documentación - `/docs-unified`

### 📖 Documentación Técnica
```
docs-unified/
├── api/                    # Documentación de API
├── authentication/         # Docs de autenticación
├── database/              # Esquemas de BD
├── deployment/            # Guías de despliegue
├── mobile/                # Documentación móvil
└── audits/                # Reportes de auditoría
```

## ⚙️ Configuración - Archivos Raíz

### 🔧 Archivos de Configuración
```
├── package.json            # Dependencias y scripts
├── vite.config.ts          # Configuración Vite
├── tsconfig.json           # Configuración TypeScript
├── tailwind.config.ts      # Configuración TailwindCSS
├── capacitor.config.ts     # Configuración Capacitor
├── playwright.config.ts    # Configuración E2E
├── vitest.config.ts        # Configuración tests unitarios
└── eslint.config.js        # Configuración ESLint
```

## 🔄 Flujo de Datos

### 📊 Arquitectura de Estado
```
Usuario → Componente → Hook → Servicio → Supabase
    ↑                                        ↓
    ←── Estado Local ←── Respuesta ←── Base de Datos
```

### 🎯 Separación Demo vs Real - Contexto Swinger
```
AppFactory.tsx
├── DemoProvider.tsx        # Perfiles demo con terminología explícita
│   ├── demoData.ts         # Datos swinger
│   └── lifestyle-interests # Intereses explícitos para demo
└── RealProvider.tsx        # Datos reales de Supabase lifestyle
    ├── Perfiles reales     # Usuarios +18 verificados
    └── Contenido filtrado  # Según nivel de experiencia
```

## 🚀 Scripts de Desarrollo

### 📋 Scripts Principales
```json
{
  "dev": "vite",                    // Servidor desarrollo
  "build": "vite build",            // Build producción
  "test": "vitest",                 // Tests unitarios
  "test:e2e": "playwright test",    // Tests E2E
  "lint": "eslint src/",            // Linter
  "type-check": "tsc --noEmit"      // Verificación tipos
}
```

## 🎨 Sistema de Temas Swinger

### 🌈 Estructura de Temas Lifestyle
```
Tema Base Swinger (TailwindCSS)
├── Colores pasión (rojos, rosas)
├── Tipografía sensual
├── Espaciado íntimo
└── Componentes UI lifestyle

Temas de Perfil Swinger
├── Tema Couple (Rosa/naranja - parejas)
├── Tema Single Male (Azul - hombres)
├── Tema Single Female (Rosa - mujeres)
├── Tema Lifestyle (Púrpura - general)
└── Tema Admin (Neutro)

Gradientes Swinger
├── hero-gradient (Azul-púrpura)
├── swinger-gradient (Rojo-naranja)
└── passion-gradient (Rosa-rojo)
```

## 🔐 Seguridad y Autenticación

### 🛡️ Capas de Seguridad
```
1. Supabase Auth (JWT)
2. Row Level Security (RLS)
3. Validación Frontend
4. Sanitización de datos
5. Rate limiting
```

---

## 📋 Refactorización Swinger Completada

### ✅ Contexto Lifestyle Implementado (16/09/2025)

1. **Terminología Auténtica**:
   - Hotwife, Bull, Unicornio, Cuckold, Tríos, Orgías
   - Vocabulario diversificado sin repeticiones
   - Diferenciación por género y experiencia

2. **Localización Mexicana**:
   - Ciudad de México, Guadalajara, Monterrey
   - Sin referencias a España u otros países
   - Cultura swinger mexicana auténtica

3. **Componentes Actualizados**:
   - `ProfileFilters.tsx`: 30 intereses swinger
   - `lifestyle-interests.ts`: Categorización por experiencia
   - `demoData.ts`: Perfiles con terminología explícita
   - Todos los perfiles contextualizados al lifestyle

4. **Estructura de Datos**:
   - Intereses swinger específicos en BD
   - Validación +18 estricta
   - Separación demo (explícito) vs real
   - Eventos lifestyle (clubs, fiestas privadas)

### 🎯 Estado del Proyecto
- **Versión**: v2.9.3 - Audit Completo Finalizado
- **Contexto**: 100% lifestyle auténtico + Sistema de tokens operativo
- **Localización**: México exclusivamente
- **Terminología**: Swinger profesional y respetuosa
- **Testing**: 107 tests unitarios pasando al 100%
- **Tokens**: Sistema CMPX/GTK con TokenChatBot wizard
- **UI/UX**: Optimizaciones de contraste y accesibilidad
- **Android**: Capacitor sincronizado para generación de APK

---

**© 2025 ComplicesConecta** - Plataforma Swinger Mexicana v2.9.3  
**Contexto**: Audit Completo + Sistema de Tokens CMPX/GTK  
**Actualizado**: 07 de Enero, 2025 - 00:46 hrs
