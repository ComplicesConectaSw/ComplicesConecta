# 📋 Tracker de Lint Crítico

> Actualiza las casillas únicamente cuando cada bloque esté 100% corregido y validado por `pnpm run lint`.

## Fase 1 · Errores Críticos

- [ ] **UI Base**
  - [x] `BetaBanner`
  - [x] `DecorativeHearts`
  - [ ] `HCaptchaWidget`
  - [ ] `ProtectedRoute`
  - [ ] `WelcomeModal`
  - [ ] `AccessibilityProvider`
  - [ ] `AndroidThemeProvider`
  - [ ] `LazyImageLoader`

- [ ] **Panel Admin**
  - [ ] `AlertConfigPanel`
  - [ ] `AnalyticsDashboard`
  - [ ] `HistoricalCharts`
  - [ ] `ModerationMetrics`
  - [ ] `PerformancePanel`
  - [ ] `TokenSystemPanel`
  - [ ] `UserManagementPanel`
  - [ ] `WebhookConfigPanel`

- [ ] **Funciones/Servicios**
  - [ ] Supabase Functions (`claim-tokens`, `process-club-flyer-image`, `sync-neo4j`, etc.)
  - [ ] Servicios críticos (`SmartMatchingService`, `TokenAnalyticsService`, `S2Service`, etc.)

- [ ] **Tests Críticos**
  - [ ] `tests/integration/supabase-integration.test.ts`
  - [ ] Supabase edge functions y utilidades relacionadas

## Fase 2 · Warnings

> Iniciar solo después de completar la Fase 1.

- [ ] Eliminar `any` no tipados
- [ ] `react-refresh/only-export-components`
- [ ] `@ts-ignore` → `@ts-expect-error`
- [ ] Fast Refresh en tests/utils
- [ ] Limpieza general de warnings en servicios/tests
