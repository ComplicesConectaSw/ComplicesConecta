# AUDITORÍA COMPLETA v3.6.3 MEJORADA
- Fecha: 09 nov 2025 06:02
- Ruta: C:\Users\conej\Documents\conecta-social-comunidad-main
- Alias configurado: @/ → ./src/

## 1. ESTRUCTURA (excluye: node_modules, .git, build, dist, android, ios, public, .vite, coverage, bck)
- Directorios: 224
- Archivos: 1245

## DIRECTORIOS VACÍOS (1)
- \.backup-working-v3.6.3\docs\tests

## ARCHIVOS DUPLICADOS (8)
- AILayerService.test.ts (13408 bytes)
  → \.backup-working-v3.6.3\src\tests\AILayerService.test.ts
  → \src\tests\unit\AILayerService.test.ts
- invitations.test.ts (5604 bytes)
  → \.backup-working-v3.6.3\src\tests\invitations.test.ts
  → \src\tests\unit\invitations.test.ts
- package-lock.json (711875 bytes)
  → \package-lock.json
  → \.backup-working-v3.6.3\package-lock.json
- package.json (7738 bytes)
  → \package.json
  → \.backup-working-v3.6.3\package.json
- PyTorchScoringModel.test.ts (11264 bytes)
  → \.backup-working-v3.6.3\src\tests\PyTorchScoringModel.test.ts
  → \src\tests\unit\PyTorchScoringModel.test.ts
- supabase-integration.test.ts (9777 bytes)
  → \.backup-working-v3.6.3\src\tests\supabase-integration.test.ts
  → \src\tests\integration\supabase-integration.test.ts
- vercel.json (296 bytes)
  → \vercel.json
  → \.backup-working-v3.6.3\vercel.json
- vite.config.ts (899 bytes)
  → \vite.config.ts
  → \.backup-working-v3.6.3\vite.config.ts

## ARCHIVOS GRANDES (>10MB) (1)
- sentry-wizard.exe (82.5 MB) → 

## ARCHIVOS VACÍOS (0)

## ARCHIVOS CORRUPTOS (2)
- \src\components\accessibility\ContrastFixer.tsx
- \src\services\ConsentVerificationService.ts

## ARCHIVOS OBSOLETOS (10)
- \.backup-working-v3.6.3\README_BACKUP.md
- \.backup-working-v3.6.3\restore-backup.ps1
- \.vercel\output\static\placeholder.svg
- \docs\supabase-backup-info.txt
- \docs-unified\legacy-docs-unified\email\SUPABASE_EMAIL_SETUP_OLD.md
- \scripts\consolidar-backup-migraciones.ps1
- \scripts\crear-backup-migraciones.ps1
- \src\lib\backup-system.ts
- \src\profiles\shared\ProfileImagePlaceholder.tsx
- \supabase\backup_info.txt

## ARCHIVOS MAL UBICADOS (1)
- \src\styles\components.css

## ARCHIVOS HUÉRFANOS (149)
- src/app/(admin)/AdminDashboard.tsx
- src/components/accessibility/AccessibilityAudit.tsx
- src/components/accessibility/AccessibilityProvider.tsx
- src/components/admin/AdvancedModerationPanel.tsx
- src/components/admin/AnalyticsDashboard.tsx
- src/components/admin/ReportsManagement.tsx
- src/components/admin/SecurityDashboard.tsx
- src/components/ai/ContentModerationModal.tsx
- src/components/ai/SmartMatchingModal.tsx
- src/components/analytics/AdvancedAnalyticsDashboard.tsx
- src/components/android/AndroidOptimizedApp.tsx
- src/components/android/LazyImageLoader.tsx
- src/components/animations/EnhancedComponents.tsx
- src/components/animations/GlobalAnimations.tsx
- src/components/auth/EmailValidation.tsx
- src/components/auth/EmailVerification.tsx
- src/components/auth/ThemeInfoModal.tsx
- src/components/auth/WorldIDButton.tsx
- src/components/cache/CacheDashboard.tsx
- src/components/chat/ChatContainer.tsx

## IMPORTS ROTOS (27)
- StoryViewer.tsx:18 → './StoryTypes'
- StoryViewer.tsx:19 → './StoryService'
- postsService.ts:3 → './PerformanceMonitoringService'
- androidSecurity.test.ts:7 → '../../utils/androidSecurity'
- auth.test.ts:4 → '../setup/test-utils'
- mobile.test.ts:14 → '../../utils/mobile'
- performance.test.ts:7 → '../../services/postsService'
- performance.test.ts:8 → '../../services/PerformanceMonitoringService'
- performance.test.ts:9 → '../../services/TokenAnalyticsService'
- performance.test.ts:10 → '../../tests/mocks/performance'
- system-integration.test.ts:4 → '@/lib/ml-matching'
- TokenAnalyticsService.test.ts:6 → '../../services/TokenAnalyticsService'
- webVitals.test.ts:7 → '../../utils/webVitals'
- main.tsx:95 → './styles/global.css'
- AdminAnalytics.tsx:13 → '@/components/admin/Analyticsdíashboard'
- Navigation.tsx:5 → '@/components/navigation/NavigationEnhanced'
- AlertConfigPanel.tsx:33 → '@/services/ErroRaúlertService'
- AnalyticsDashboard.tsx:23 → '@/services/ErroRaúlertService'
- index.ts:23 → '@/entities/profile'
- Index.tsx:17 → '@/styles/animations.css'
- Tokens.tsx:12 → '@/components/tokens/Tokendíashboard'
- DesktopNotificationService.ts:12 → './ErroRaúlertService'
- IntegrationTester.ts:11 → './ReferRaúlTokensService'
- TokenService.ts:22 → '@/services/ReferRaúlTokensService'
- TokenDashboard.test.tsx:4 → '@/components/tokens/Tokendíashboard'
- system-integration.test.ts:4 → '@/lib/ml-matching'
- reportExport.ts:12 → '@/services/ErroRaúlertService'

## DEPENDENCIAS FALTANTES (77)
@capacitor/android
@capacitor/app
@capacitor/browser
@capacitor/camera
@capacitor/cli
@capacitor/clipboard
@capacitor/core
@capacitor/device
@capacitor/filesystem
@capacitor/geolocation
@capacitor/haptics
@capacitor/ios
@capacitor/keyboard
@capacitor/local-notifications
@capacitor/network
@capacitor/push-notifications
@capacitor/share
@capacitor/splash-screen
@capacitor/status-bar
@capacitor/toast
@datadog/browser-logs
@datadog/browser-rum
@heroicons/react
@hookform/resolvers
@huggingface/inference
@huggingface/transformers
@radix-ui/react-accordion
@radix-ui/react-alert-dialog
@radix-ui/react-aspect-ratio
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-collapsible
@radix-ui/react-context-menu
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-hover-card
@radix-ui/react-label
@radix-ui/react-menubar
@radix-ui/react-navigation-menu
@radix-ui/react-popover
@radix-ui/react-progress
@radix-ui/react-radio-group
@radix-ui/react-scroll-area
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slider
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-toast
@radix-ui/react-toggle
@radix-ui/react-toggle-group
@radix-ui/react-tooltip
@rollup/wasm-node
@sentry/react
@sentry/vite-plugin
@solana/web3.js
@supabase/supabase-js
@tailwindcss/postcss
@tanstack/react-query
@tensorflow/tfjs
@types/qrcode
@types/speakeasy
@types/uuid
@vitejs/plugin-react
@worldcoin/idkit
@eslint/js
@playwright/test
@tailwindcss/typography
@testing-library/dom
@testing-library/jest-dom
@testing-library/react
@testing-library/user-event
@types/node
@types/react
@types/react-dom
@vitest/coverage-v8

## POSIBLES SECRETOS (15)
- POSIBLE SECRETO: \.backup-working-v3.6.3\src\tests\auth.e2e.test.ts
- POSIBLE SECRETO: \.backup-working-v3.6.3\src\tests\emailService.test.ts
- POSIBLE SECRETO: \.backup-working-v3.6.3\src\tests\PushNotificationService.test.ts
- POSIBLE SECRETO: \.backup-working-v3.6.3\src\tests\send-email.test.ts
- POSIBLE SECRETO: \.vercel\output\static\assets\js\Chat.js
- POSIBLE SECRETO: \.vercel\output\static\assets\js\index.js
- POSIBLE SECRETO: \src\app\(auth)\Auth.tsx
- POSIBLE SECRETO: \src\examples\hcaptcha-example.tsx
- POSIBLE SECRETO: \src\tests\e2e\auth.e2e.test.ts
- POSIBLE SECRETO: \src\tests\integration\send-email.test.ts
- POSIBLE SECRETO: \src\tests\unit\emailService.test.ts
- POSIBLE SECRETO: \src\tests\unit\PushNotificationService.test.ts
- POSIBLE SECRETO: \tests\e2e-playwright\auth-flows\auth-flows-improved.spec.ts
- POSIBLE SECRETO: \tests\e2e-playwright\fixtures\auth-fixtures.ts
- POSIBLE SECRETO: \tests\e2e-playwright\helpers\EnhancedAuthHelper.ts

## VULNERABILIDADES (105)
- ⚠️  Posible SQL Injection: \vite-plugin-react-order.ts
- ⚠️  localStorage sin validación: \.backup-working-v3.6.3\src\AdminProduction.tsx
- ⚠️  localStorage sin validación: \.backup-working-v3.6.3\src\StoryViewer.tsx
- ⚠️  localStorage sin validación: \.backup-working-v3.6.3\src\services\InvitationsService.ts
- ⚠️  localStorage sin validación: \.backup-working-v3.6.3\src\services\postsService.ts
- ⚠️  localStorage sin validación: \.backup-working-v3.6.3\src\tests\Chat.test.tsx
- ⚠️  localStorage sin validación: \.backup-working-v3.6.3\src\tests\localStorage-migration.test.ts
- ⚠️  localStorage sin validación: \.backup-working-v3.6.3\src\tests\system-integration.test.ts
- ⚠️  localStorage sin validación: \.backup-working-v3.6.3\src\utils\clearStorage.ts
- ⚠️  Posible SQL Injection: \.vercel\output\static\assets\js\AdminAnalytics.js
- ⚠️  Posible SQL Injection: \.vercel\output\static\assets\js\AdminCareerApplications.js
- ⚠️  Posible SQL Injection: \.vercel\output\static\assets\js\AdminModerators.js
- ⚠️  Posible SQL Injection: \.vercel\output\static\assets\js\AdminPartners.js
- ⚠️  Posible XSS (innerHTML): \.vercel\output\static\assets\js\AreaChart.js
- ⚠️  Posible SQL Injection: \.vercel\output\static\assets\js\AreaChart.js
- ⚠️  Posible SQL Injection: \.vercel\output\static\assets\js\Chat.js
- ⚠️  Posible SQL Injection: \.vercel\output\static\assets\js\Clubs.js
- ⚠️  Posible XSS (innerHTML): \.vercel\output\static\assets\js\Dashboard.js
- ⚠️  Posible SQL Injection: \.vercel\output\static\assets\js\Dashboard.js
- ⚠️  localStorage sin validación: \.vercel\output\static\assets\js\Dashboard.js

## ERRORES DE CÓDIGO (40)
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 35, col 5, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 82, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 93, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 95, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 97, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 99, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 101, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 103, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 105, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 111, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\server.js: line 117, col 3, Warning - Unused eslint-disable directive (no problems were reported from 'no-console').
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\App.tsx: line 72, col 7, Warning - 'd├¡ashboard' is assigned a value but never used. Allowed unused vars must match /^_/u. (unused-imports/no-unused-vars)
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\App.tsx: line 72, col 38, Error - Unable to resolve path to module '@/pages/d├¡ashboard'. (import/no-unresolved)
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\App.tsx: line 120, col 47, Error - Unable to resolve path to module '@/pages/Moderatord├¡ashboard'. (import/no-unresolved)
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\app\(admin)\AdminAnalytics.tsx: line 13, col 37, Error - Unable to resolve path to module '@/components/admin/Analyticsd├¡ashboard'. (import/no-unresolved)
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\app\(admin)\AdminPartners.tsx: line 190, col 40, Error - Parsing error: ',' expected.
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\app\(clubs)\Clubs.tsx: line 92, col 38, Error - Parsing error: ',' expected.
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\components\RequestCard.tsx: line 84, col 29, Error - Parsing error: ';' expected.
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\components\admin\AlertConfigPanel.tsx: line 250, col 35, Error - Parsing error: ',' expected.
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\components\admin\AnalyticsDashboard.tsx: line 23, col 32, Error - Unable to resolve path to module '@/services/ErroRa├║lertService'. (import/no-unresolved)
- Lint:    35:5  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:    82:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:    93:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:    95:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:    97:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:    99:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:   101:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:   103:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:   105:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:   111:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:   117:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
- Lint:    72:7   warning  'd├¡ashboard' is assigned a value but never used. Allowed unused vars must match /^_/u  unused-imports/no-unused-vars
- Lint:    72:38  error    Unable to resolve path to module '@/pages/d├¡ashboard'                                  import/no-unresolved
- Lint:   120:47  error    Unable to resolve path to module '@/pages/Moderatord├¡ashboard'                         import/no-unresolved
- Lint:   13:37  error  Unable to resolve path to module '@/components/admin/Analyticsd├¡ashboard'  import/no-unresolved
- Lint:   190:40  error  Parsing error: ',' expected
- Lint:   92:38  error  Parsing error: ',' expected
- Lint:   84:29  error  Parsing error: ';' expected
- Lint:   250:35  error  Parsing error: ',' expected
- Lint:   23:32  error  Unable to resolve path to module '@/services/ErroRa├║lertService'  import/no-unresolved

## USO DE 'as any' O 'null' CON TABLAS (4)
- backup-system.ts:251 → .from(table as any)
- backup-system.ts:301 → .from(tableName as any)
- VirtualEventsService.ts:140 → .from('event_participations' as any)
- VirtualEventsService.ts:164 → .from('event_participations' as any)

## PROBLEMAS ANDROID (0)
- ✅ Configuración Android correcta

## RESUMEN FINAL
- Duración: 02:53
- Archivos escaneados: 1245
- Directorios vacíos: 1
- Duplicados: 8
- Archivos vacíos: 0
- Archivos corruptos: 2
- Archivos obsoletos: 10
- Archivos mal ubicados: 1
- Archivos huérfanos: 149
- Imports rotos: 27
- Deps faltantes: 77
- Posibles secretos: 15
- Vulnerabilidades: 105
- Errores de código: 40
- Uso problemático de tablas: 4
