# 🔥 ComplicesConecta - Plataforma Social +18

> **La comunidad swinger más exclusiva y segura de España**

<div align="center">

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Android](https://img.shields.io/badge/Android-Ready-brightgreen.svg)](android/)
[![+18](https://img.shields.io/badge/Contenido-+18-red.svg)](#aviso-legal)

### 📱 ¡Descarga la App Ahora!

<a href="https://github.com/ComplicesConectaSw/complicesconectasw/releases/download/v.1.1/app-release.apk" download>
  <img src="https://img.shields.io/badge/📱_Descargar_APK-v1.1-3DDC84?style=for-the-badge&logo=android&logoColor=white&labelColor=1976D2" alt="Descargar APK" />
</a>

*🔒 Aplicación segura y verificada para Android*

</div>

## 🌟 Visión del Proyecto

ComplicesConecta es más que una aplicación de citas: es una **plataforma integral** diseñada específicamente para la comunidad lifestyle mexicana, ofreciendo un espacio seguro, verificado y discreto para conexiones auténticas.

### 🎯 Misión
Crear la comunidad lifestyle más exclusiva y segura de México, donde parejas y solteros pueden conectar de manera auténtica, discreta y verificada.

## ✨ Características Revolucionarias

### 🔐 **Seguridad de Nivel Bancario**
- **🛡️ Verificación KYC Avanzada**: Sistema de 3 niveles de verificación
- **🔒 Encriptación E2E**: Todas las comunicaciones protegidas
- **👤 Perfiles Anónimos**: Privacidad total hasta el match mutuo
- **📍 Geolocalización Difusa**: Ubicación aproximada sin comprometer privacidad
- **🚨 Sistema Anti-Fake**: IA para detectar perfiles falsos

### 💕 **Experiencia Social Premium**
- **🧠 Matching IA**: Algoritmo de compatibilidad con 50+ factores
- **💬 Chat Encriptado**: Mensajería con autodestrucción opcional
- **🎭 Eventos VIP Exclusivos**: Fiestas privadas y encuentros verificados
- **🌟 Comunidad Selecta**: Solo usuarios verificados y premium
- **🎁 Sistema de Tokens**: CMPX y GTK para economía interna

### 🎨 **Diseño de Vanguardia**
- **📱 UI/UX Premium**: Diseño inspirado en apps de lujo
- **🌈 Animaciones Fluidas**: Micro-interacciones con Framer Motion
- **📱 Responsive Total**: Experiencia perfecta en todos los dispositivos
- **🔔 Notificaciones Inteligentes**: Push notifications contextuales
- **🎛️ Filtros Avanzados**: Búsqueda granular por preferencias lifestyle

## 🚀 Stack Tecnológico de Élite

<div align="center">

### **Frontend Moderno**
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)

### **Backend Serverless**
![Supabase](https://img.shields.io/badge/Supabase-3BA55D?style=for-the-badge&logo=supabase)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![Edge Functions](https://img.shields.io/badge/Edge_Functions-000000?style=for-the-badge&logo=vercel)

### **Mobile Nativo**
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android)
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios)

</div>

## 📊 Arquitectura del Sistema

```mermaid
graph TB
    A[Frontend React + TS] --> B[Supabase Backend]
    A --> C[Capacitor Mobile]
    B --> D[PostgreSQL DB]
    B --> E[Edge Functions]
    B --> F[Real-time Chat]
    C --> G[Android App]
    C --> H[iOS App]
    E --> I[Email Service]
    E --> J[Push Notifications]
    E --> K[AI Matching]
```

## 🏗️ Estructura del Monorepo

```
📁 conecta-social-comunidad-main/
├── 🎨 src/                          # Frontend React + TypeScript
│   ├── 🧩 components/               # Componentes reutilizables
│   │   ├── 💬 chat/                 # Sistema de chat
│   │   ├── 🔍 discover/             # Funcionalidad de descubrimiento
│   │   ├── 🎭 events/               # Gestión de eventos VIP
│   │   └── 👤 profile/              # Gestión de perfiles
│   ├── 📄 pages/                    # Páginas principales de la app
│   ├── 🎣 hooks/                    # Custom React hooks
│   ├── 🛠️ utils/                    # Utilidades y helpers
│   ├── 🔌 integrations/             # Integraciones (Supabase, APIs)
│   └── 🖼️ assets/                   # Recursos estáticos
├── 🗄️ supabase/                     # Backend Supabase
│   ├── ⚡ functions/                # Edge Functions serverless
│   │   ├── 📧 send-email/           # Sistema de emails
│   │   ├── 🔔 push-notifications/   # Notificaciones push
│   │   └── 🤖 ai-matching/          # Algoritmo de matching IA
│   └── 🔄 migrations/               # Migraciones de base de datos
├── 📱 android/                      # Proyecto Android nativo
├── 🌐 public/                       # Archivos públicos estáticos
├── 📚 docs/                         # Documentación completa
└── 🔧 config/                       # Archivos de configuración
```

## 🚀 Instalación y Desarrollo

### 📋 Prerrequisitos

- **Node.js** 18+ 
- **Bun** (recomendado) o npm/pnpm
- **Android Studio** (para desarrollo móvil)
- **Supabase CLI**
- **Git** con acceso al repositorio

### ⚡ Configuración Rápida

```bash
# 1️⃣ Clonar el repositorio
git clone https://github.com/ComplicesConectaSw/complicesconectasw.git
cd conecta-social-comunidad-main

# 2️⃣ Instalar dependencias (ultra-rápido con Bun)
bun install

# 3️⃣ Configurar variables de entorno
cp .env.example .env.local
# ✏️ Editar .env.local con tus credenciales

# 4️⃣ Iniciar servidor de desarrollo
bun run dev
# 🌐 Abre http://localhost:5173

# 📱 Para desarrollo móvil Android
bun run build
npx cap sync
npx cap open android
```

### 🔐 Variables de Entorno Críticas

```env
# 🗄️ Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-supabase

# 🌍 Environment
VITE_APP_ENV=development
NODE_ENV=development
## 🎨 Páginas y Funcionalidades

### 🏠 **Página Principal (Index)**
- Hero section con animaciones avanzadas
- LoadingScreen profesional
- Modal de bienvenida interactivo
- Perfiles destacados

### 🔐 **Autenticación (Auth)**
- Login/Registro con Supabase Auth
- Verificación KYC
- Geolocalización opcional

### 👥 **Perfiles (Profiles)**
- Búsqueda avanzada con IA
- Filtros específicos swinger
- Perfiles verificados únicos

### 💬 **Chat Privado**
- Conversaciones encriptadas
- Mensajes en tiempo real
- Interfaz moderna y segura

### 💕 **Matches**
- Sistema de compatibilidad IA
- Stats detalladas
- Matches con parejas/solteros

### 🔍 **Descubrimiento (Discover)**
- Sistema de swipe
- Filtros avanzados
- Perfiles verificados

### ❓ **FAQ y Comentarios**
- Centro de ayuda completo
- Preguntas frecuentes sobre la plataforma
- Sistema de feedback y valoraciones
- Soporte directo de la comunidad

### 📊 **Dashboard/Configuración**
- Panel de control interactivo
- Estadísticas del proyecto en tiempo real
- Funcionalidades principales destacadas
- Ejemplo post-registro del potencial de la plataforma

## 💳 Sistema de Suscripciones

| Plan | Precio | Características |
|------|--------|----------------|
| **Basic** | €9.99/mes | Chat básico, 10 likes/día |
| **Silver** | €19.99/mes | Chat ilimitado, 50 likes/día, eventos |
| **Gold** | €29.99/mes | Todo Silver + Super Likes, verificación |
| **Premium** | €49.99/mes | Acceso VIP total, eventos exclusivos |

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Plataformas Recomendadas
- **Vercel** - Para aplicación web
- **Netlify** - Alternativa web
- **Google Play Store** - Para Android
- **App Store** - Para iOS

## 🔒 Seguridad y Privacidad

- **🛡️ Verificación KYC** obligatoria
- **🔐 Encriptación end-to-end** en chats
- **👥 Comunidad moderada** 24/7
- **🚫 Tolerancia cero** al acoso
- **📱 Reportes anónimos** disponibles

## 👥 Equipo

**Liderado por**: Juan Carlos Méndez Nataren  
**Repositorio**: https://github.com/ComplicesConectaSw/complice

## 📄 Licencia

Este proyecto es propiedad de ComplicesConectaSW. Todos los derechos reservados.

---

**🔥 ¡Únete a la comunidad swinger más exclusiva de España!**

*Conexiones auténticas, experiencias únicas, discreción total.*
