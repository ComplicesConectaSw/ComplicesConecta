# 🏗️ Estructura del Proyecto ComplicesConecta v2.8.4

## 🔒 Validación de Edad y Términos Implementada

**Fecha:** 15 de Septiembre, 2025 - 01:04 hrs  
**Versión:** 2.8.4 - Sistema de verificación +18 y consentimiento legal

### Componentes de Seguridad Agregados:
- `src/components/auth/TermsModal.tsx` - Modal de términos obligatorio
- `src/pages/Auth.tsx` - Validación de edad +18 integrada
- Sistema de fecha de nacimiento con cálculo automático
- Validación dual para parejas (ambos +18 años)
- Bloqueo de registro sin cumplir requisitos legales

## 📁 Estructura General del Monorepo

```
📁 conecta-social-comunidad-main/
├── 🎨 src/                          # Frontend React + TypeScript
│   ├── 🧩 components/               # Componentes reutilizables
│   │   ├── 💬 chat/                 # Sistema de chat
│   │   ├── 🔍 discover/             # Funcionalidad de descubrimiento
│   │   ├── 🎭 events/               # Gestión de eventos VIP
│   │   ├── 👤 profile/              # Gestión de perfiles
│   │   ├── 🎨 ui/                   # Componentes UI base
│   │   ├── 🔐 auth/                 # Componentes de autenticación
│   │   ├── 🎪 demo/                 # Componentes de demostración
│   │   ├── 🎬 animations/           # Sistema de animaciones
│   │   ├── 📊 analytics/            # Componentes de análisis
│   │   └── 🎯 theme/                # Sistema de temas visuales (NUEVO v2.8.3)
│   ├── 📄 pages/                    # Páginas principales de la app
│   ├── 🎣 hooks/                    # Custom React hooks
│   ├── 🛠️ utils/                    # Utilidades y helpers
│   ├── 🔌 integrations/             # Integraciones (Supabase, APIs)
│   ├── 📚 lib/                      # Librerías y configuraciones
│   ├── 🎨 styles/                   # Estilos globales
│   └── 🖼️ assets/                   # Recursos estáticos
├── 🗄️ supabase/                     # Backend Supabase
│   ├── ⚡ functions/                # Edge Functions serverless
│   │   ├── 📧 send-email/           # Sistema de emails
│   │   ├── 🔔 push-notifications/   # Notificaciones push
│   │   └── 🤖 ai-matching/          # Algoritmo de matching IA
│   └── 🔄 migrations/               # Migraciones de base de datos
├── 📱 android/                      # Proyecto Android nativo
├── 🌐 public/                       # Archivos públicos estáticos
├── 📚 docs-unified/                 # Documentación completa
├── 🧪 tests/                        # Suite de testing
└── 🔧 config/                       # Archivos de configuración
```

## 🎨 Sistema de Temas Visuales v2.8.3 (NUEVO)

### 📁 Estructura de Componentes de Temas

```
src/
├── 🎣 hooks/
│   └── useProfileTheme.ts           # Hook principal para lógica de temas
├── 🧩 components/
│   ├── 🎨 ui/
│   │   ├── ProfileCard.tsx          # Componente mejorado con soporte de temas
│   │   └── ThemeSelector.tsx        # Selector interactivo de temas
│   ├── 🎪 demo/
│   │   └── ProfileThemeShowcase.tsx # Demostración interactiva de temas
│   └── 👤 profile/
│       └── MainProfileCard.tsx      # Tarjeta principal con integración de temas
├── 📄 pages/
│   └── ProfileThemeDemo.tsx         # Página completa de demostración
└── 📚 lib/
    └── demoData.ts                  # Datos demo actualizados con temas
```

## 🧩 Componentes por Categoría

### 🎨 Componentes UI Base
- **Button.tsx** - Botones base con variantes
- **Card.tsx** - Tarjetas base reutilizables
- **Input.tsx** - Campos de entrada
- **Modal.tsx** - Modales y diálogos
- **Badge.tsx** - Etiquetas y badges
- **Avatar.tsx** - Avatares de usuario
- **ProfileCard.tsx** - Tarjetas de perfil con temas ✨
- **ThemeSelector.tsx** - Selector de temas visuales ✨

### 🔐 Componentes de Autenticación
- **LoginForm.tsx** - Formulario de login
- **RegisterForm.tsx** - Formulario de registro
- **AuthGuard.tsx** - Protección de rutas
- **LoginLoadingScreen.tsx** - Pantalla de carga
- **DemoModeToggle.tsx** - Toggle modo demo

### 👤 Componentes de Perfil
- **ProfileForm.tsx** - Formulario de edición
- **ProfileStats.tsx** - Estadísticas del perfil
- **ProfileGallery.tsx** - Galería de imágenes
- **MainProfileCard.tsx** - Tarjeta principal con temas ✨
- **CouplePhotoSection.tsx** - Fotos de pareja

### 💬 Componentes de Chat
- **ChatWindow.tsx** - Ventana de chat
- **MessageBubble.tsx** - Burbujas de mensaje
- **ChatList.tsx** - Lista de conversaciones
- **RealtimeChatWindow.tsx** - Chat en tiempo real
- **TypingIndicator.tsx** - Indicador de escritura

### 🔍 Componentes de Descubrimiento
- **ProfileGrid.tsx** - Grid de perfiles
- **FilterPanel.tsx** - Panel de filtros
- **MatchCard.tsx** - Tarjetas de matches
- **SwipeCard.tsx** - Tarjetas deslizables

### 🎪 Componentes de Demostración
- **ProfileThemeShowcase.tsx** - Demostración de temas ✨
- **DemoProfileCard.tsx** - Tarjetas demo
- **FeatureShowcase.tsx** - Demostración de características

### 🎬 Sistema de Animaciones
- **AnimationProvider.tsx** - Proveedor de contexto
- **GlobalAnimations.tsx** - Variantes globales
- **PageTransitions.tsx** - Transiciones de página
- **InteractiveAnimations.tsx** - Animaciones interactivas
- **EnhancedComponents.tsx** - Componentes animados
- **NotificationSystem.tsx** - Sistema de notificaciones
- **AnimationSettings.tsx** - Configuración de animaciones

## 🎣 Hooks Personalizados

### 🔐 Autenticación
- **useAuth.ts** - Gestión de autenticación
- **useDemo.ts** - Modo demostración
- **usePermissions.ts** - Permisos de usuario

### 👤 Perfiles
- **useProfile.ts** - Gestión de perfiles
- **useProfileCache.ts** - Cache de perfiles
- **useCouplePhotos.ts** - Fotos de pareja
- **useProfileTheme.ts** - Temas visuales ✨

### 💬 Chat
- **useChat.ts** - Funcionalidad de chat
- **useRealtimeChat.ts** - Chat en tiempo real
- **useTyping.ts** - Indicadores de escritura

### 🔍 Descubrimiento
- **useMatching.ts** - Sistema de matching
- **useFilters.ts** - Filtros de búsqueda
- **useGeolocation.ts** - Geolocalización

### 🎬 Animaciones
- **useAnimations.ts** - Control de animaciones
- **usePageTransitions.ts** - Transiciones de página
- **useInteractiveEffects.ts** - Efectos interactivos

### 🎨 Temas (NUEVO v2.8.3)
- **useProfileTheme.ts** - Lógica principal de temas ✨

## 📄 Páginas Principales

### 🏠 Páginas Core
- **Index.tsx** - Página principal
- **Auth.tsx** - Autenticación
- **Profile.tsx** - Perfil de usuario
- **Discover.tsx** - Descubrimiento
- **Chat.tsx** - Mensajería
- **Matches.tsx** - Matches del usuario

### 🎪 Páginas Demo
- **ProfileThemeDemo.tsx** - Demostración de temas ✨
- **AnimationDemo.tsx** - Demostración de animaciones
- **ComponentShowcase.tsx** - Showcase de componentes

### 💎 Páginas Premium
- **TokenDashboard.tsx** - Dashboard de tokens
- **VIPEvents.tsx** - Eventos VIP
- **PremiumFeatures.tsx** - Características premium

### ⚙️ Páginas de Administración
- **AdminPanel.tsx** - Panel administrativo
- **UserManagement.tsx** - Gestión de usuarios
- **Analytics.tsx** - Análisis y métricas

## 🛠️ Utilidades y Librerías

### 📚 Librerías Core
- **supabase.ts** - Cliente de Supabase
- **auth.ts** - Configuración de autenticación
- **database.ts** - Helpers de base de datos
- **storage.ts** - Gestión de archivos
- **demoData.ts** - Datos de demostración con temas ✨

### 🛠️ Utilidades
- **constants.ts** - Constantes globales
- **helpers.ts** - Funciones auxiliares
- **validators.ts** - Validaciones
- **formatters.ts** - Formateadores
- **logger.ts** - Sistema de logging

### 🎨 Estilos
- **globals.css** - Estilos globales
- **components.css** - Estilos de componentes
- **animations.css** - Animaciones CSS
- **themes.css** - Variables de temas ✨

## 📊 Métricas del Proyecto

### 📈 Estadísticas Generales
- **Total de Archivos**: 200+
- **Líneas de Código**: 30,000+
- **Componentes React**: 60+
- **Custom Hooks**: 20+
- **Páginas**: 20+

### 🎨 Sistema de Temas v2.8.3
- **Componentes con Temas**: 4
- **Hooks de Temas**: 1
- **Variantes de Temas**: 8 (5 automáticas + 3 personalizables)
- **Páginas Demo**: 1
- **Líneas de Código Temas**: 1,200+

### 🗄️ Base de Datos
- **Tablas**: 15+
- **Edge Functions**: 7
- **Políticas RLS**: 50+
- **Migraciones**: 10+

### 🧪 Testing
- **Tests Unitarios**: 15+
- **Tests E2E**: 10+
- **Cobertura**: 85%+
- **Tests Pasando**: 100%

## 🔄 Flujo de Desarrollo

### 1. **Desarrollo Local**
```bash
bun install          # Instalar dependencias
bun run dev         # Servidor de desarrollo
bun run test        # Ejecutar tests
bun run build       # Build de producción
```

### 2. **Desarrollo Móvil**
```bash
bun run build       # Build web
npx cap sync        # Sincronizar con Capacitor
npx cap open android # Abrir Android Studio
```

### 3. **Base de Datos**
```bash
supabase start      # Iniciar Supabase local
supabase db reset   # Resetear base de datos
supabase gen types  # Generar tipos TypeScript
```

## 🚀 Estado del Proyecto v2.8.3

### ✅ Completado
- Sistema de temas visuales completo
- Documentación actualizada
- Componentes integrados
- Demo funcional
- Tests pasando

### 🔄 En Progreso
- Modal de registro con temas
- Integración en Auth.tsx
- Documentación técnica detallada

### 📋 Pendiente
- Feedback de usuarios
- Optimizaciones de performance
- Nuevos temas personalizados
