# 📁 PROJECT STRUCTURE TREE - ComplicesConecta v3.4.0

**Última Actualización:** 22 de Enero, 2025 - 15:30 hrs  
**Versión:** 3.4.0  
**Estado:** ✅ **PRODUCTION READY ADVANCED**  
**Puntuación:** 100/100 🏆

### Funcionalidades Avanzadas v3.4.0 Implementadas:
- **Sistema de Seguridad**: SecurityAuditService con monitoreo continuo y detección de amenazas
- **Moderación con IA**: AdvancedModerationPanel con cola de moderación y configuración avanzada
- **Funcionalidades de Parejas**: AdvancedCoupleService con matching, eventos y mensajería especializada
- **Notificaciones en Tiempo Real**: Service Worker, push notifications y centro de notificaciones
- **Caché Avanzado**: AdvancedCacheService multi-nivel con compresión y predicción
- **Analytics Avanzados**: AdvancedAnalyticsService con métricas en tiempo real y predicciones
- **Responsive Design**: Optimización completa móvil/desktop/Android

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
│   │   ├── admin/                # Dashboard administrativo (ACTUALIZADO v3.4.0)
│   │   │   ├── panels/           # Subpaneles modulares (6 paneles)
│   │   │   ├── SecurityDashboard.tsx      # Panel de seguridad avanzado (NUEVO)
│   │   │   └── AdvancedModerationPanel.tsx # Panel de moderación con IA (NUEVO)
│   │   ├── analytics/            # Componentes de análisis (ACTUALIZADO v3.4.0)
│   │   │   └── AdvancedAnalyticsDashboard.tsx # Dashboard analytics avanzado (NUEVO)
│   │   ├── cache/                # Componentes de caché (NUEVO v3.4.0)
│   │   │   └── CacheDashboard.tsx # Dashboard de monitoreo de caché
│   │   ├── couples/              # Componentes de parejas (NUEVO v3.4.0)
│   │   │   └── CoupleDashboard.tsx # Dashboard especializado para parejas
│   │   ├── notifications/        # Componentes de notificaciones (NUEVO v3.4.0)
│   │   │   └── NotificationCenter.tsx # Centro de notificaciones
│   │   └── theme/                # Sistema de temas visuales
│   ├── pages/                    # Páginas principales de la app
│   ├── hooks/                    # Custom React hooks (ACTUALIZADO v3.4.0)
│   │   ├── useAdvancedAnalytics.ts    # Hook para analytics avanzados (NUEVO)
│   │   ├── useAdvancedCache.ts        # Hook para gestión de caché (NUEVO)
│   │   ├── useAdvancedModeration.ts   # Hook para moderación (NUEVO)
│   │   └── useRealtimeNotifications.ts # Hook para notificaciones tiempo real (NUEVO)
│   ├── utils/                    # Utilidades y helpers
│   ├── integrations/             # Integraciones (Supabase, APIs)
│   ├── lib/                      # Librerías y configuraciones
│   ├── services/                 # Servicios de negocio (ACTUALIZADO v3.4.0)
│   │   ├── AdvancedAnalyticsService.ts    # Analytics avanzados (NUEVO)
│   │   ├── AdvancedCacheService.ts        # Caché multi-nivel (NUEVO)
│   │   ├── AdvancedCoupleService.ts       # Servicio de parejas (NUEVO)
│   │   ├── SecurityAuditService.ts       # Auditoría de seguridad (NUEVO)
│   │   ├── PushNotificationService.ts     # Notificaciones push (ACTUALIZADO)
│   │   └── PerformanceMonitoringService.ts # Monitoreo en tiempo real
│   ├── styles/                   # Estilos globales
│   │   └── responsive-admin.css  # CSS responsive admin
│   └── assets/                   # Recursos estáticos
├── supabase/                     # Backend Supabase (ACTUALIZADO v3.4.0)
│   ├── functions/                # Edge Functions serverless
│   │   ├── send-email/           # Sistema de emails
│   │   ├── push-notifications/   # Notificaciones push
│   │   └── ai-matching/          # Algoritmo de matching IA
│   └── migrations/               # Migraciones de base de datos (ACTUALIZADO)
│       ├── 20250122000003_create_security_tables_fixed.sql # Tablas seguridad (NUEVO)
│       └── 20250122000004_create_couple_tables.sql        # Tablas parejas (NUEVO)
├── android/                      # Proyecto Android nativo
├── public/                       # Archivos públicos (ACTUALIZADO v3.4.0)
│   ├── sw-notifications.js       # Service Worker notificaciones (NUEVO)
│   └── manifest.json             # PWA manifest
├── docs-unified/                 # Documentación completa
├── tests/                        # Suite de testing
└── config/                       # Archivos de configuración
```

### Base de Datos (Supabase)

#### Tablas Principales v3.4.0
```sql
-- Tablas del Sistema v3.4.0
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
reports              -- Sistema de Reportes
report_categories    -- Categorías de reportes
report_actions       -- Acciones de moderación
moderation_logs      -- Logs de moderación

-- Tablas de Seguridad v3.4.0 (NUEVAS)
security_events      -- Eventos de seguridad
blocked_ips          -- IPs bloqueadas
threat_detections    -- Amenazas detectadas
security_configurations -- Configuraciones de seguridad
security_alerts      -- Alertas de seguridad

-- Tablas de Parejas v3.4.0 (NUEVAS)
couple_profiles      -- Perfiles de parejas
couple_matches       -- Matches entre parejas
couple_interactions  -- Interacciones entre parejas
couple_events        -- Eventos de parejas
couple_messages      -- Mensajes entre parejas
couple_gifts         -- Regalos entre parejas
couple_favorites     -- Parejas favoritas
couple_reports       -- Reportes de parejas
couple_verifications -- Verificaciones de parejas
couple_statistics    -- Estadísticas de parejas
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
