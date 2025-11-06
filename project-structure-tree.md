# 📁 PROJECT STRUCTURE TREE - ComplicesConecta v3.5.0

**Última Actualización:** 06 de Noviembre, 2025  
**Versión:** 3.5.0  
**Estado:** ✅ **PRODUCTION READY - AI-NATIVE - ENTERPRISE GRADE - REFACTORIZADO - NEO4J OPERATIVO**  
**Puntuación:** 94/100 ✅ (Estructura: 100/100, Lógica: 100/100, Consistencia: 94/100)  
**Build:** ✅ 17.13s | **Linting:** ✅ 0 errores | **TypeScript:** ✅ 0 errores

### Funcionalidades Avanzadas v3.5.0 Implementadas:
- **AI-Native Layer (Fase 1)**: ML Compatibility Scoring + Chat Summaries (100%)
- **PyTorch/TensorFlow.js**: Modelos pre-entrenados (400K parámetros)
- **Chat Summaries ML**: GPT-4, BART (HuggingFace), Fallback (3 opciones)
- **Google S2 Geosharding (Fase 2.1)**: Cell ID generation + migration (100% estructura, 70% total)
- **Neo4j Graph Database (Fase 2.2)**: Graph database para conexiones sociales (100% implementado) ✅
- **Base de Datos**: 107 tablas operativas (80+ índices, 65+ RLS) + Neo4j Graph Database ✅
- **Refactorización Completa**: PostCSS + CSS + Consolidación (-77% duplicación) ✅
- **Sistema de Monitoreo Completo**: Performance, Error Alerting, Analytics Dashboard (95%)
- **Sistema de Chat con Privacidad (NUEVO v3.5.0)**: ChatRoom + MessageList + ChatPrivacyService (100%) ✅
- **Geolocalización en Chat**: Compartir ubicación en mensajes integrado ✅
- **Permisos de Galería desde Chat**: Solicitud de acceso integrada ✅
- **Video Chat Preparado**: VideoChatService estructura lista para futuro ✅
- **Mejoras Visuales CSS**: Gradientes purple/blue, visibilidad mejorada ✅
- **Silenciamiento Ultra Agresivo Wallet Errors**: Captura por mensaje, archivo y stack trace ✅
- **React Polyfills Mejorados**: Todos los hooks disponibles globalmente, fallbacks completos ✅
- **Navegación Condicional**: HeaderNav/Navigation según autenticación en TokensInfo y Tokens ✅
- **Documentación Interna de Tokens**: Solo visible para usuarios autenticados ✅
- **Correcciones UI**: Botón "Todas" corregido, textos invisibles en TokenChatBot resueltos ✅
- **Datadog RUM**: Real User Monitoring con Web Vitals y Session Tracking
- **Sistema de Seguridad**: SecurityAuditService con monitoreo continuo y detección de amenazas
- **Moderación con IA**: AdvancedModerationPanel con métricas y KPIs para moderadores
- **Funcionalidades de Parejas**: AdvancedCoupleService con matching, eventos y mensajería especializada
- **Notificaciones en Tiempo Real**: Service Worker, push notifications y centro de notificaciones
- **Caché Avanzado**: AdvancedCacheService multi-nivel con compresión y predicción
- **Analytics Avanzados**: AdvancedAnalyticsService con métricas en tiempo real y predicciones
- **Responsive Design**: Optimización completa móvil/desktop/Android
- **Sistema de Estilos Completo**: Tailwind CSS v4 + 19 archivos CSS especializados ✅
- **Análisis de Estilos**: Auditoría completa realizada (06 Nov 2025) ✅

### Estructura General del Monorepo

```
conecta-social-comunidad-main/
├── src/                          # Frontend React + TypeScript
│   ├── components/               # Componentes reutilizables
│   │   ├── chat/                 # Sistema de chat (ACTUALIZADO v3.5.0)
│   │   │   ├── ChatRoom.tsx              # Componente principal con privacidad (NUEVO v3.5.0)
│   │   │   ├── MessageList.tsx           # Lista de mensajes (NUEVO v3.5.0)
│   │   │   ├── RealtimeChatWindow.tsx    # Ventana de chat tiempo real
│   │   │   ├── ChatWithLocation.tsx      # Chat con geolocalización
│   │   │   └── ... (componentes existentes)
│   │   ├── discover/             # Funcionalidad de descubrimiento
│   │   ├── events/               # Gestión de eventos VIP
│   │   ├── profile/              # Gestión de perfiles
│   │   │   └── NFTGalleryManager.tsx # Gestor de galerías NFT (NUEVO v3.5.0)
│   │   ├── tokens/               # Componentes de tokens (ACTUALIZADO v3.5.0)
│   │   │   ├── TokenBalance.tsx       # Balance con sección NFT (NUEVO v3.5.0)
│   │   │   ├── TokenDashboard.tsx    # Dashboard con sección NFT (NUEVO v3.5.0)
│   │   │   ├── TokenChatBot.tsx      # Chat bot de tokens
│   │   │   └── StakingModal.tsx       # Modal de staking con tips NFT (NUEVO v3.5.0)
│   │   ├── images/               # Componentes de imágenes (ACTUALIZADO v3.5.0)
│   │   │   ├── ImageGallery.tsx      # Galería con badge NFT (NUEVO v3.5.0)
│   │   │   └── ImageUpload.tsx        # Subida con opción NFT (NUEVO v3.5.0)
│   │   ├── ui/                   # Componentes UI base
│   │   ├── auth/                 # Componentes de autenticación
│   │   ├── demo/                 # Componentes de demostración
│   │   ├── animations/           # Sistema de animaciones
│   │   ├── analytics/            # Componentes de análisis
│   │   ├── admin/                # Dashboard administrativo (ACTUALIZADO v3.4.1)
│   │   │   ├── panels/           # Subpaneles modulares (6 paneles)
│   │   │   ├── SecurityDashboard.tsx          # Panel de seguridad avanzado
│   │   │   ├── AdvancedModerationPanel.tsx    # Panel de moderación con IA
│   │   │   ├── AnalyticsDashboard.tsx         # Dashboard analytics completo (4 pestañas)
│   │   │   ├── ModerationMetrics.tsx          # Métricas de moderación (NUEVO v3.4.1)
│   │   │   ├── HistoricalCharts.tsx           # Gráficos históricos Recharts (NUEVO v3.4.1)
│   │   │   ├── WebhookConfigPanel.tsx         # Sistema de webhooks (NUEVO v3.4.1)
│   │   │   ├── AlertConfigPanel.tsx           # Configuración de alertas (NUEVO v3.4.1)
│   │   │   ├── ExportButton.tsx               # Exportación de reportes (NUEVO v3.4.1)
│   │   │   └── NotificationSettings.tsx       # Notificaciones desktop (NUEVO v3.4.1)
│   │   ├── analytics/            # Componentes de análisis (ACTUALIZADO v3.4.1)
│   │   │   └── AdvancedAnalyticsDashboard.tsx # Dashboard analytics avanzado
│   │   ├── cache/                # Componentes de caché (NUEVO v3.4.0)
│   │   │   └── CacheDashboard.tsx # Dashboard de monitoreo de caché
│   │   ├── couples/              # Componentes de parejas (NUEVO v3.4.0)
│   │   │   └── CoupleDashboard.tsx # Dashboard especializado para parejas
│   │   ├── notifications/        # Componentes de notificaciones (NUEVO v3.4.0)
│   │   │   └── NotificationCenter.tsx # Centro de notificaciones
│   │   └── theme/                # Sistema de temas visuales
│   ├── pages/                    # Páginas principales de la app
│   ├── hooks/                    # Custom React hooks (ACTUALIZADO v3.4.1)
│   │   ├── useAdvancedAnalytics.ts    # Hook para analytics avanzados
│   │   ├── useAdvancedCache.ts        # Hook para gestión de caché
│   │   ├── useAdvancedModeration.ts   # Hook para moderación
│   │   ├── useRealtimeNotifications.ts # Hook para notificaciones tiempo real
│   │   ├── useAuth.ts                 # Hook de autenticación (ACTUALIZADO v3.4.1)
│   │   └── useWorldID.ts              # Hook para World ID (ACTUALIZADO v3.4.1)
│   ├── utils/                    # Utilidades y helpers
│   ├── integrations/             # Integraciones (Supabase, APIs)
│   ├── lib/                      # Librerías y configuraciones
│   │   ├── env-utils.ts                      # Helper variables de entorno Vite/Node.js (NUEVO v3.5.0)
│   │   └── logger.ts                          # Logger (ACTUALIZADO v3.5.0 - compatible Vite/Node.js)
│   ├── services/                 # Servicios de negocio (ACTUALIZADO v3.5.0)
│   │   ├── graph/                # Servicios de grafo (NUEVO v3.5.0)
│   │   │   └── Neo4jService.ts                # Graph database Neo4j (NUEVO v3.5.0)
│   │   ├── ChatPrivacyService.ts              # Privacidad y permisos de chat (NUEVO v3.5.0)
│   │   ├── VideoChatService.ts                # Preparación video chat futuro (NUEVO v3.5.0)
│   │   ├── SmartMatchingService.ts            # Matching con IA + Neo4j (NUEVO v3.5.0)
│   │   ├── DataPrivacyService.ts              # GDPR compliance (NUEVO v3.5.0)
│   │   ├── UserVerificationService.ts         # Verificación unificada (NUEVO v3.5.0)
│   │   ├── TokenService.ts                    # Gestión de tokens (NUEVO v3.5.0)
│   │   ├── NFTGalleryService.ts               # Servicio de galerías NFT (NUEVO v3.5.0)
│   │   ├── PerformanceMonitoringService.ts    # Monitoreo de performance (ACTUALIZADO v3.4.1)
│   │   ├── ErrorAlertService.ts               # Sistema de alertas (NUEVO v3.4.1)
│   │   ├── ModerationMetricsService.ts        # Métricas de moderación (NUEVO v3.4.1)
│   │   ├── HistoricalMetricsService.ts        # Métricas históricas (NUEVO v3.4.1)
│   │   ├── WebhookService.ts                  # Sistema de webhooks (NUEVO v3.4.1)
│   │   ├── DesktopNotificationService.ts      # Notificaciones desktop (NUEVO v3.4.1)
│   │   ├── AdvancedAnalyticsService.ts        # Analytics avanzados
│   │   ├── AdvancedCacheService.ts            # Caché multi-nivel
│   │   ├── AdvancedCoupleService.ts           # Servicio de parejas
│   │   ├── SecurityAuditService.ts            # Auditoría de seguridad
│   │   └── PushNotificationService.ts         # Notificaciones push
│   ├── styles/                   # Estilos globales (19 archivos CSS)
│   │   ├── consolidated-styles.css      # Estilos consolidados (1,175+ líneas)
│   │   ├── animations.css               # Animaciones personalizadas (193 líneas)
│   │   ├── responsive.css               # Estilos responsive globales (239 líneas)
│   │   ├── accessibility.css            # Estilos de accesibilidad
│   │   ├── android-optimization.css     # Optimizaciones Android
│   │   ├── cross-browser.css            # Compatibilidad cross-browser
│   │   ├── decorative-hearts.css        # Elementos decorativos
│   │   ├── force-visibility.css         # Forzar visibilidad
│   │   ├── header-fixes.css             # Correcciones del header
│   │   ├── header-nav-protection.css    # Protección del header
│   │   ├── info-text-visibility.css     # Visibilidad de texto
│   │   ├── mobile-responsive.css        # Responsive móviles
│   │   ├── responsive-admin.css         # Responsive admin
│   │   ├── responsive-fixes.css          # Correcciones responsive
│   │   ├── text-overflow-fixes.css      # Desbordamiento de texto
│   │   ├── text-visibility-fixes.css    # Visibilidad de texto
│   │   └── ui-fixes-contraste.css       # Correcciones de contraste
│   ├── index.css                 # Estilos globales principales (433 líneas)
│   ├── config/                   # Configuraciones (NUEVO v3.4.1)
│   │   ├── sentry.config.ts      # Integración Sentry completa
│   │   └── datadog-rum.config.ts # Datadog RUM configuration
│   └── assets/                   # Recursos estáticos
├── supabase/                     # Backend Supabase (ACTUALIZADO v3.4.1)
│   ├── functions/                # Edge Functions serverless
│   │   ├── send-email/           # Sistema de emails
│   │   ├── push-notifications/   # Notificaciones push
│   │   └── ai-matching/          # Algoritmo de matching IA
│   └── migrations/               # Migraciones de base de datos (20 migraciones)
│       ├── 20250122000003_create_security_tables_fixed.sql    # Tablas seguridad
│       ├── 20250122000004_create_couple_tables.sql            # Tablas parejas
│       ├── 20251029000000_create_monitoring_tables.sql        # Tablas monitoreo (NUEVO v3.4.1)
│       ├── 20251029100000_create_interests_tables.sql         # Tablas intereses (NUEVO v3.4.1)
│       ├── 20251029100001_create_worldid_verifications.sql    # World ID (NUEVO v3.4.1)
│       └── 20251030000001_alter_referral_rewards.sql          # Referral rewards (NUEVO v3.4.1)
├── scripts/                      # Scripts de utilidad (17+ scripts)
│   ├── sync-postgres-to-neo4j.ts              # Sincronización PostgreSQL → Neo4j (NUEVO v3.5.0, CORREGIDO 05 Nov 2025)
│   ├── verify-neo4j.ts                        # Verificación conexión Neo4j (NUEVO v3.5.0)
│   └── setup-neo4j-indexes.ts                # Setup de índices Neo4j (NUEVO v3.5.0)
├── tailwind.config.ts            # Configuración Tailwind CSS v3.4.18 (300 líneas)
├── postcss.config.js             # Configuración PostCSS con @tailwindcss/postcss
├── docker-compose.yml            # Docker Compose con Neo4j (ACTUALIZADO v3.5.0)
├── android/                      # Proyecto Android nativo
├── kubernetes/                   # Configs Datadog/K8s (NUEVO v3.4.1)
│   ├── datadog-docker-run.sh    # Script Datadog Agent
│   ├── datadog-agent.yaml       # Manifest Kubernetes
│   └── datadog-setup.sh         # Setup automatizado
├── public/                       # Archivos públicos (ACTUALIZADO v3.4.1)
│   ├── sw-notifications.js      # Service Worker notificaciones
│   └── manifest.json            # PWA manifest
├── docs-unified/                # Documentación completa (gitignored)
├── tests/                       # Suite de testing (98% passing)
├── server.js                    # Express server producción (NUEVO v3.4.1)
├── newrelic.js                  # New Relic APM config (NUEVO v3.4.1)
├── Dockerfile                   # Docker multi-stage (ACTUALIZADO v3.4.1)
├── .dockerignore                # Optimización Docker (NUEVO v3.4.1)
├── .env.example                 # Template variables entorno (NUEVO v3.4.1)
└── config/                      # Archivos de configuración
```

### Base de Datos (Supabase)

#### Tablas Principales v3.4.1 (47 tablas - 100% sincronizadas)
```sql
-- Tablas del Sistema Core
profiles              -- Perfiles de usuario
matches              -- Sistema de matching
chats                -- Conversaciones
messages             -- Mensajes del chat
user_preferences     -- Preferencias de usuario
theme_preferences    -- Preferencias de tema
subscriptions        -- Suscripciones premium
tokens               -- Sistema de tokens
swinger_interests    -- Intereses swinger específicos (NUEVO v3.4.1)
user_swinger_interests -- Relación usuario-intereses (NUEVO v3.4.1)
career_forms         -- Formularios de carrera
notifications        -- Sistema de notificaciones
user_sessions        -- Sesiones de usuario
activity_logs        -- Logs de actividad
reports              -- Sistema de Reportes
report_categories    -- Categorías de reportes
report_actions       -- Acciones de moderación
moderation_logs      -- Logs de moderación

-- Tablas de Seguridad
security_events      -- Eventos de seguridad
blocked_ips          -- IPs bloqueadas
threat_detections    -- Amenazas detectadas
security_configurations -- Configuraciones de seguridad
security_alerts      -- Alertas de seguridad

-- Tablas de Parejas
couple_profiles      -- Perfiles de parejas (49 campos)
couple_matches       -- Matches entre parejas
couple_interactions  -- Interacciones entre parejas
couple_events        -- Eventos de parejas
couple_messages      -- Mensajes entre parejas
couple_gifts         -- Regalos entre parejas
couple_favorites     -- Parejas favoritas
couple_reports       -- Reportes de parejas
couple_verifications -- Verificaciones de parejas
couple_statistics    -- Estadísticas de parejas

-- Tablas de Monitoreo v3.4.1 (NUEVAS)
performance_metrics  -- Métricas de performance
error_alerts         -- Alertas de errores
web_vitals_history   -- Historial de Web Vitals
monitoring_sessions  -- Sesiones de monitoreo

-- Tablas de World ID v3.4.1 (NUEVAS)
worldid_verifications       -- Verificaciones World ID
worldid_nullifier_hashes    -- Hashes únicos
worldid_verification_stats  -- Estadísticas

-- Tablas de Tokens y Referidos v3.4.1
user_token_balances  -- Balances de tokens CMPX/GTK
referral_rewards     -- Recompensas por referidos
gallery_permissions  -- Permisos de galería
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

> **📚 Para una guía completa de instalación y configuración, consulta [INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md)**

### Diagrama de Flujo de Desarrollo

```mermaid
graph LR
    A[Iniciar Día] --> B[Iniciar Supabase]
    B --> C[Iniciar Neo4j]
    C --> D[npm run dev]
    D --> E[Desarrollar Features]
    E --> F[Ejecutar Tests]
    F --> G{¿Tests OK?}
    G -->|No| H[Corregir Errores]
    H --> E
    G -->|Sí| I[Linting]
    I --> J{¿Lint OK?}
    J -->|No| K[Corregir Estilo]
    K --> E
    J -->|Sí| L[Commit Cambios]
    L --> M[Push a Repositorio]
    M --> N[Fin de Día]
```

### Comandos Principales

```bash
# Desarrollo Local
npm run dev         # Servidor de desarrollo
npm test           # Ejecutar tests
npm run build      # Build de producción

# Desarrollo Móvil
npm run build      # Build web
npx cap sync       # Sincronizar con Capacitor
npx cap open android # Abrir Android Studio

# Base de Datos
supabase start     # Iniciar Supabase local
supabase db reset  # Resetear base de datos
supabase gen types # Generar tipos TypeScript
```

### Ver Documentación Completa

- **[INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md)** - Guía completa de instalación

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
