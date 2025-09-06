# 🚀 README_DEV.md - ComplicesConecta

**Guía Completa para Desarrolladores**  
**Versión:** 2.1.0  
**Fecha:** 06 de septiembre de 2025

## 📋 Índice

1. [Setup del Proyecto](#setup-del-proyecto)
2. [Variables de Entorno](#variables-de-entorno)
3. [Comandos de Desarrollo](#comandos-de-desarrollo)
4. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Guías de Contribución](#guías-de-contribución)
8. [CI/CD](#cicd)

## 🛠️ Setup del Proyecto

### Requisitos Previos

- **Node.js:** v18.0.0 o superior
- **npm:** v9.0.0 o superior (o pnpm v8.0.0+)
- **Git:** Última versión
- **Supabase CLI:** v1.100.0+ (opcional)

### Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/ComplicesConecta/conecta-social-comunidad.git
cd conecta-social-comunidad

# 2. Instalar dependencias
npm install
# o con pnpm
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Verificar instalación
npm run type-check
npm run lint
```

### Configuración IDE (Recomendado)

**VS Code Extensions:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "@typescript-eslint.typescript-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

**VS Code Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🔐 Variables de Entorno

### Archivo `.env.local`

```bash
# === SUPABASE CONFIGURATION ===
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === AUTHENTICATION ===
VITE_WORLDCOIN_APP_ID=app_your_worldcoin_id
VITE_WORLDCOIN_ACTION=verify_human

# === MONITORING ===
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENABLE_LOGGING=true

# === PAYMENTS (STRIPE) ===
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret

# === DEVELOPMENT ===
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK_DATA=true

# === CAPACITOR (MOBILE) ===
CAPACITOR_SERVER_URL=http://localhost:5173
```

### Variables Críticas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clave pública de Supabase | ✅ |
| `VITE_SENTRY_DSN` | Monitoreo de errores | 🟡 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Pagos Premium | 🟡 |
| `VITE_WORLDCOIN_APP_ID` | Verificación World ID | 🟡 |

## ⚡ Comandos de Desarrollo

### Desarrollo Local

```bash
# Servidor de desarrollo
npm run dev
# Puerto: http://localhost:5173

# Desarrollo con HTTPS (para testing mobile)
npm run dev -- --host --https

# Build de desarrollo
npm run build:dev
```

### Testing

```bash
# Unit tests (Vitest)
npm run test
npm run test:watch
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug

# Tests completos
npm run test:all
```

### Calidad de Código

```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
npm run type-check:watch

# Formateo
npm run format
```

### Build y Deploy

```bash
# Build de producción
npm run build

# Preview del build
npm run preview

# Análisis del bundle
npm run analyze

# Deploy a Vercel
npm run deploy
```

### Mobile (Capacitor)

```bash
# Sincronizar con Capacitor
npm run cap:sync

# Build Android
npm run cap:android

# Build iOS
npm run cap:ios

# Ejecutar en dispositivo
npm run cap:run:android
npm run cap:run:ios
```

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── auth/           # Componentes de autenticación
│   ├── chat/           # Sistema de chat
│   └── invitations/    # Sistema de invitaciones
├── pages/              # Páginas principales
├── hooks/              # Custom hooks
├── lib/                # Utilidades y configuraciones
│   ├── supabase.ts     # Cliente Supabase
│   ├── sentry.ts       # Configuración Sentry
│   └── utils.ts        # Utilidades generales
├── types/              # Definiciones TypeScript
├── assets/             # Recursos estáticos
└── integrations/       # Integraciones externas
    └── supabase/       # Tipos generados de Supabase
```

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS + shadcn/ui
- React Router v6
- Zustand (Estado global)

**Backend:**
- Supabase (BaaS)
- PostgreSQL + Row Level Security
- Edge Functions (Deno)
- Realtime subscriptions

**Testing:**
- Vitest (Unit tests)
- Playwright (E2E tests)
- Testing Library

**Mobile:**
- Capacitor
- Android/iOS builds

**Monitoring:**
- Sentry (Error tracking)
- Custom logging system

### Patrones de Arquitectura

**1. Componentes:**
```typescript
// Estructura estándar de componente
interface ComponentProps {
  // Props tipadas
}

export const Component = ({ prop }: ComponentProps) => {
  // Hooks
  // Estados locales
  // Efectos
  // Handlers
  // Render
};
```

**2. Custom Hooks:**
```typescript
// Hook personalizado
export const useCustomHook = () => {
  // Lógica reutilizable
  return { data, loading, error };
};
```

**3. Servicios:**
```typescript
// Servicios para lógica de negocio
export const serviceAPI = {
  async getData() {
    // Implementación
  }
};
```

## 🧪 Testing

### Unit Tests (Vitest)

**Configuración:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov']
    }
  }
});
```

**Ejemplo de Test:**
```typescript
// src/components/__tests__/Component.test.tsx
import { render, screen } from '@testing-library/react';
import { Component } from '../Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

**Configuración:**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
});
```

**Ejemplo de E2E:**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.click('[data-testid="login-btn"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de Instalación de Dependencias

**Síntoma:**
```bash
npm ERR! peer dep missing
```

**Solución:**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. Errores de TypeScript

**Síntoma:**
```
Type 'unknown' is not assignable to type 'string'
```

**Solución:**
```typescript
// Usar type guards
if (typeof value === 'string') {
  // value es string aquí
}

// O type assertion con validación
const stringValue = value as string;
```

#### 3. Problemas de Supabase Connection

**Síntoma:**
```
Failed to fetch from Supabase
```

**Solución:**
```bash
# Verificar variables de entorno
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verificar conectividad
curl -I $VITE_SUPABASE_URL/rest/v1/
```

#### 4. Build Failures

**Síntoma:**
```
Build failed with errors
```

**Solución:**
```bash
# Verificar tipos
npm run type-check

# Verificar lint
npm run lint

# Build limpio
rm -rf dist
npm run build
```

#### 5. Mobile Build Issues

**Síntoma:**
```
Capacitor sync failed
```

**Solución:**
```bash
# Limpiar y resincronizar
npx cap clean
npm run build
npx cap sync
```

### Debugging

#### 1. React DevTools

```bash
# Instalar extensión del navegador
# Chrome/Firefox: React Developer Tools
```

#### 2. Supabase Debugging

```typescript
// Habilitar logs detallados
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

#### 3. Network Issues

```typescript
// Interceptar requests
import { setupInterceptors } from './lib/debug';

if (process.env.NODE_ENV === 'development') {
  setupInterceptors();
}
```

### Performance

#### 1. Bundle Analysis

```bash
# Analizar tamaño del bundle
npm run analyze

# Identificar dependencias pesadas
npx webpack-bundle-analyzer dist/assets/*.js
```

#### 2. React Performance

```typescript
// Usar React.memo para componentes pesados
export const HeavyComponent = React.memo(({ data }) => {
  // Componente optimizado
});

// Lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

## 👥 Guías de Contribución

### Workflow de Git

```bash
# 1. Crear branch desde main
git checkout main
git pull origin main
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push y crear PR
git push origin feature/nueva-funcionalidad
# Crear Pull Request en GitHub
```

### Convenciones de Commits

**Formato:**
```
tipo(scope): descripción

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo, sin cambios de código
- `refactor`: Refactoring de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```bash
feat(auth): agregar autenticación con World ID
fix(chat): corregir envío de mensajes en tiempo real
docs(readme): actualizar guía de instalación
```

### Code Review

**Checklist:**
- [ ] Código sigue las convenciones del proyecto
- [ ] Tests incluidos y pasando
- [ ] Documentación actualizada
- [ ] No hay console.logs en producción
- [ ] Performance considerada
- [ ] Accesibilidad verificada

### Estándares de Código

**TypeScript:**
```typescript
// ✅ Bueno
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// ❌ Evitar
const user: any = {};
```

**React:**
```typescript
// ✅ Bueno
const Component = ({ title, onAction }: ComponentProps) => {
  const [state, setState] = useState<StateType>(initialState);
  
  const handleClick = useCallback(() => {
    onAction?.();
  }, [onAction]);

  return <div>{title}</div>;
};

// ❌ Evitar
const Component = (props: any) => {
  // Lógica sin tipos
};
```

## 🚀 CI/CD

### GitHub Actions

**Workflow Principal:**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Deployment

**Vercel (Automático):**
- Push a `main` → Deploy a producción
- Push a `develop` → Deploy a staging
- Pull Requests → Preview deployments

**Manual Deploy:**
```bash
# Deploy a Vercel
npm run deploy

# Deploy Android APK
npm run build:android
```

### Environment Variables en CI

```bash
# GitHub Secrets requeridos
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SENTRY_DSN
STRIPE_SECRET_KEY
```

## 📚 Recursos Adicionales

### Documentación

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Herramientas

- [VS Code](https://code.visualstudio.com/)
- [Supabase Studio](https://supabase.com/dashboard)
- [Sentry Dashboard](https://sentry.io/)
- [Vercel Dashboard](https://vercel.com/dashboard)

### Comunidad

- [Discord del Proyecto](https://discord.gg/complicesconecta)
- [GitHub Issues](https://github.com/ComplicesConecta/conecta-social-comunidad/issues)
- [Documentación Interna](./docs/)

---

**Última actualización:** 06/09/2025 03:25 AM  
**Mantenido por:** Equipo ComplicesConecta  
**Versión del documento:** 1.0.0

¿Preguntas? Crear un issue en GitHub o contactar al equipo de desarrollo.