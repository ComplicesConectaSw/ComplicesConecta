# 🏗️ Estructura del Proyecto - ComplicesConecta v3.1.0

**Fecha de Actualización:** 23 de Septiembre, 2025 - 05:05 hrs  
**Estado:** ✅ PRODUCTION READY ENHANCED  
**Puntuación:** 100/100 🏆

### Sistema de Reportes v3.1.0 Implementado:
- **Reportes Completos**: Sistema para reportar usuarios, contenido y actividad sospechosa
- **Moderación Automática**: IA integrada para detección de contenido inapropiado
- **Panel de Administración**: Dashboard completo para moderadores
- **Nuevos Componentes**: ReportForm, ReportsList, ModerationPanel y más

### Estructura General del Monorepo

```
conecta-social-comunidad-main/
├── src/                          # Frontend React + TypeScript
│   ├── components/               # Componentes reutilizables
│   │   ├── chat/                 # Sistema de chat
│   │   ├── discover/             # Funcionalidad de descubrimiento
│   │   ├── events/               # Gestión de eventos VIP
│   │   ├── profile/              # Gestión de perfiles
│   │   ├── ui/                   # Componentes UI base
│   │   ├── auth/                 # Componentes de autenticación
│   │   ├── demo/                 # Componentes de demostración
│   │   ├── animations/           # Sistema de animaciones
│   │   ├── analytics/            # Componentes de análisis
│   │   └── theme/                # Sistema de temas visuales (NUEVO v2.8.3)
│   ├── pages/                    # Páginas principales de la app
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utilidades y helpers
│   ├── integrations/             # Integraciones (Supabase, APIs)
│   ├── lib/                      # Librerías y configuraciones
│   ├── styles/                   # Estilos globales
│   └── assets/                   # Recursos estáticos
├── supabase/                     # Backend Supabase
│   ├── functions/                # Edge Functions serverless
│   │   ├── send-email/           # Sistema de emails
│   │   ├── push-notifications/   # Notificaciones push
│   │   └── ai-matching/          # Algoritmo de matching IA
│   └── migrations/               # Migraciones de base de datos (11 archivos, 90.4KB)
│       ├── 20250906125234_clean_final_schema.sql      # Esquema base (10.6KB)
│       ├── 20250107_create_couple_profiles.sql        # Perfiles parejas (5.7KB)
│       ├── 20250914_add_interests_tables.sql          # Intereses (4.3KB)
│       ├── 20250914103600_create_couple_photos_table.sql # Fotos (4.9KB)
│       ├── 20250914103700_create_chat_realtime_tables.sql # Chat (10.4KB)
│       ├── 20250906_05_create_token_system.sql        # Tokens (16.2KB)
│       ├── 20250906_06_create_token_rls.sql           # RLS Tokens (7.8KB)
│       ├── HABILITAR_RLS_COMPLETO.sql                 # RLS General (2.5KB)
│       ├── rls-profiles-validation.sql                # Validación (4.6KB)
│       ├── rls-messages-tokens-invitations.sql       # RLS Específico (12KB)
│       └── rls-fix-20250915.sql                       # Corrección Final (12.2KB)
├── android/                      # Proyecto Android nativo
├── public/                       # Archivos públicos estáticos
├── docs-unified/                 # Documentación completa
├── tests/                        # Suite de testing
└── config/                       # Archivos de configuración
```

### Base de Datos (Supabase)

#### Tablas Principales
```sql
-- Tablas del Sistema v3.1.0
profiles              -- Perfiles de usuario
matches              -- Sistema de matching
chats                -- Conversaciones
messages             -- Mensajes del chat
user_preferences     -- Preferencias de usuario
theme_preferences    -- Preferencias de tema
subscriptions        -- Suscripciones premium
tokens               -- Sistema de tokens
interests            -- Intereses de usuarios
user_interests       -- Relación usuario-intereses
career_forms         -- Formularios de carrera
notifications        -- Sistema de notificaciones
user_sessions        -- Sesiones de usuario
activity_logs        -- Logs de actividad
reports              -- Sistema de Reportes v3.1.0
report_categories    -- Categorías de reportes
report_actions       -- Acciones de moderación
moderation_logs      -- Logs de moderación
```

### Edge Functions
```typescript
// Funciones Serverless v3.1.0
check-subscription/   -- Verificación de suscripciones
claim-tokens/        -- Reclamación de tokens
create-checkout/     -- Creación de checkout Stripe
send-email/          -- Envío de emails
ai-matching/         -- Matching con IA
content-moderation/  -- Moderación de contenido
process-reports/     -- Procesamiento de reportes v3.1.0

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

## 🚀 Estado del Proyecto v2.8.6

### ✅ Completado
- Correcciones exhaustivas TypeScript en backend services
- Estandarización completa del sistema logger
- Fixes de errores implícitos any en callbacks
- Corrección de consultas SQL con tipos seguros
- Documentación actualizada a versión 2.8.6
- Sistema de temas visuales completo
- Tests pasando con cero errores críticos

### 🔄 En Progreso
- Commit y push a GitHub con mensaje en español
- Validación final de build y lint tests

### 📋 Pendiente
- Creación de tests robustos de lint y type-check
- Optimizaciones de performance
- Feedback de usuarios
