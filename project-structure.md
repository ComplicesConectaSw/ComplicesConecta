# 🔥 ComplicesConecta - Estructura del Proyecto Swinger

> **Plataforma swinger premium para conexiones auténticas y discretas**

```
ComplicesConecta/
├── .github/                          # 🔄 CI/CD y workflows
│   ├── workflows/                    # Automatización GitHub Actions
│   └── environments/                 # Configuraciones de entorno
├── android/                          # 📱 Aplicación Android nativa
│   ├── app/src/                      # Código fuente Android
│   └── gradle/                       # Configuración Gradle
├── supabase/                         # 🗄️ Backend serverless
│   ├── functions/                    # ⚡ Edge Functions
│   │   ├── send-email/               # 📧 Sistema de emails
│   │   ├── check-subscription/       # 💳 Verificación suscripciones
│   │   └── customer-portal/          # 👤 Portal de cliente
│   └── migrations/                   # 🔄 Migraciones DB
├── public/
│   ├── app-release.apk              # 📱 APK de la aplicación
│   ├── compliceslogo.png             # 🎨 Logo oficial
│   ├── favicon.ico                   # 🔖 Favicon
│   └── placeholder.svg               # 🖼️ Placeholder imágenes
└── src/                              # 💻 Frontend React + TypeScript
    ├── components/                   # 🧩 Componentes reutilizables
    │   ├── analytics/                # 📊 Componentes de análisis
    │   ├── chat/                     # 💬 Sistema de chat swinger
    │   ├── discover/                 # 🔍 Descubrimiento de parejas
    │   ├── matches/                  # 💕 Sistema de matches
    │   ├── premium/                  # 💎 Funcionalidades premium
    │   ├── sidebar/                  # 📋 Navegación lateral
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       └── use-toast.ts
    ├── hooks/                        # 🎣 Custom React hooks
    │   ├── use-mobile.tsx            # 📱 Detección móvil
    │   ├── use-toast.ts              # 🔔 Sistema de notificaciones
    │   └── useAuth.ts                # 🔐 Autenticación swinger
    ├── integrations/
    │   └── supabase/                 # 🔌 Integración Supabase
    ├── lib/
    │   ├── utils.ts                  # 🛠️ Utilidades generales
    │   └── data.ts                   # 📊 Datos mock y configuración
    ├── pages/                        # 📄 Páginas principales
    │   ├── Index.tsx                 # 🏠 Página principal swinger ✅
    │   ├── Auth.tsx                  # 🔐 Autenticación y registro ✅
    │   ├── ProfileSingle.tsx         # 👤 Perfil individual ✅
    │   ├── ProfileCouple.tsx         # 👫 Perfil de pareja ✅
    │   ├── EditProfileSingle.tsx     # ✏️ Editar perfil individual ✅
    │   ├── EditProfileCouple.tsx     # ✏️ Editar perfil de pareja ✅
    │   ├── Chat.tsx                  # 💬 Chat privado encriptado ✅
    │   ├── Matches.tsx               # 💕 Gestión de matches ✅
    │   ├── Discover.tsx              # 🔍 Descubrimiento avanzado ✅
    │   ├── Admin.tsx                 # ⚙️ Panel administrativo
    │   ├── FAQ.tsx                   # ❓ Preguntas frecuentes
    │   └── NotFound.tsx              # 🚫 Página 404
    └── assets/                       # 🖼️ Recursos estáticos
        ├── profile-1.jpg             # 👤 Imágenes de perfil demo
        ├── profile-2.jpg
        ├── profile-3.jpg
        └── profile-4.jpg
```

## 🎨 **Layout de la Aplicación Swinger**

```
┌─────────────────────────────────────────────────────────┐
│ 🔥 ComplicesConecta - Plataforma Swinger Premium       │
├─────────────────┬───────────────────────────────────────┤
│ Sidebar (280px) │ Grid de Perfiles Swinger Verificados  │
│ 🔍 Filtros      │ ┌─────┐ ┌─────┐ ┌─────┐              │
│ 📊 Stats        │ │👫💕│ │👤🔥│ │👫✨│              │
│ 💎 Premium      │ └─────┘ └─────┘ └─────┘              │
│ 💬 Chat         │ ┌─────┐ ┌─────┐ ┌─────┐              │
│ 🎭 Eventos      │ │👤💋│ │👫🌟│ │👤💎│              │
│                 │ └─────┘ └─────┘ └─────┘              │
└─────────────────┴───────────────────────────────────────┘
```

### 🎯 **Características Específicas del Proyecto**
- **Comunidad +18**: Plataforma exclusiva para adultos
- **Verificación KYC**: Todos los perfiles verificados
- **Discreción Total**: Privacidad y anonimato garantizados
- **Matching IA**: Algoritmo de compatibilidad swinger
- **Eventos VIP**: Fiestas y encuentros exclusivos
- **Chat Encriptado**: Conversaciones seguras y privadas

## 🏗️ Descripción de la Arquitectura Swinger

### 📁 **Backend Serverless (Supabase)**
- **Edge Functions**: Funciones serverless para lógica de negocio
- **Base de Datos**: PostgreSQL con RLS para seguridad
- **Autenticación**: Sistema de auth con verificación KYC
- **Storage**: Almacenamiento seguro de imágenes de perfil
- **Real-time**: Chat en tiempo real encriptado

### 📱 **Aplicación Móvil Android**
- **Capacitor**: Framework híbrido para funcionalidades nativas
- **APK**: Aplicación compilada lista para distribución
- **Permisos**: Geolocalización, cámara, notificaciones push

### 💻 **Frontend React Swinger**
#### 🧩 **Componentes Especializados**
- **Chat**: Sistema de mensajería privada y discreta
- **Discover**: Algoritmo de descubrimiento de parejas compatibles
- **Matches**: Gestión de conexiones y compatibilidad swinger
- **Premium**: Funcionalidades exclusivas para suscriptores
- **Analytics**: Estadísticas de perfil y actividad

#### 📄 **Páginas Principales Implementadas**
- **Index**: Landing page con perfiles destacados ✅
- **Auth**: Registro y login con verificación de edad (+18) ✅
- **ProfileSingle**: Perfil individual con edición de avatar ✅
- **ProfileCouple**: Perfil de pareja con datos duales ✅
- **EditProfileSingle**: Formulario de edición individual ✅
- **EditProfileCouple**: Formulario de edición de pareja ✅
- **Chat**: Conversaciones privadas encriptadas ✅
- **Matches**: Gestión de conexiones y matches ✅
- **Discover**: Búsqueda avanzada con filtros lifestyle ✅
- **Admin**: Panel de administración y moderación
- **FAQ**: Preguntas frecuentes
- **NotFound**: Página 404

#### 🔐 **Seguridad y Privacidad**
- **Verificación KYC**: Sistema de 3 niveles de verificación
- **Encriptación E2E**: Todas las comunicaciones protegidas
- **Perfiles Anónimos**: Privacidad hasta el match mutuo
- **Geolocalización Difusa**: Ubicación aproximada sin comprometer privacidad

## 🚀 **Stack Tecnológico Premium**

### **Frontend Moderno**
- **React 18** + **TypeScript** - Framework principal
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** + **shadcn/ui** - Sistema de diseño premium
- **React Router** - Navegación SPA
- **TanStack Query** - Gestión de estado servidor
- **Lucide React** - Iconografía moderna

### **Backend Serverless**
- **Supabase** - Backend as a Service completo
- **PostgreSQL** - Base de datos relacional
- **Edge Functions** - Lógica serverless
- **Real-time** - WebSockets para chat
- **Storage** - CDN global para imágenes

### **Mobile & DevOps**
- **Capacitor** - Aplicaciones móviles híbridas
- **GitHub Actions** - CI/CD automatizado
- **Vercel/Netlify** - Despliegue frontend
- **Google Play Store** - Distribución Android