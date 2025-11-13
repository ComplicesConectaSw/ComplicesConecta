# 🧪 ComplicesConecta - Testing Guide v2.0.0

## 📋 Testing Strategy

### 🔧 Setup Testing Environment

#### 1. Install Testing Dependencies

```bash
# Unit Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event @vitest/ui

# E2E Testing
npm install -D @playwright/test

# Coverage
npm install -D @vitest/coverage-v8
```

#### 2. Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

#### 3. Configure Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 🧪 Unit Tests

#### 1. Hook Testing Example

```typescript
// tests/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle login success', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
```

#### 2. Component Testing Example

```typescript
// tests/ProfileCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileCard } from '@/components/ProfileCard';

const mockProfile = {
  id: '1',
  first_name: 'Test',
  last_name: 'User',
  age: 25,
  bio: 'Test bio',
  user_type: 'single' as const,
  is_verified: true,
  location: 'Test City'
};

describe('ProfileCard Component', () => {
  it('should render profile information', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('25 años')).toBeInTheDocument();
    expect(screen.getByText('Test bio')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ProfileCard profile={mockProfile} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockProfile);
  });

  it('should show verification badge for verified users', () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});
```

### 🌐 E2E Tests

#### 1. Authentication Flow

```typescript
// tests/auth-flow.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete registration and login flow', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');

    // Switch to registration
    await page.click('text=Regístrate');

    // Fill registration form
    await page.fill('[name="first_name"]', 'E2E');
    await page.fill('[name="last_name"]', 'Test');
    await page.fill('[name="email"]', 'e2e@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="age"]', '25');

    // Select user type
    await page.click('text=👤 Single');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success or error handling
    await expect(page.locator('[data-testid="auth-result"]')).toBeVisible();
  });
});
```

#### 2. Chat Functionality

```typescript
// tests/chat.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as demo user
    await page.goto('/auth');
    await page.fill('[type="email"]', 'single@outlook.es');
    await page.fill('[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/discover');
  });

  test('should send and receive messages', async ({ page }) => {
    // Navigate to chat
    await page.goto('/chat');

    // Select public room
    await page.click('[data-testid="public-room"]');

    // Send message
    const messageText = `Test message ${Date.now()}`;
    await page.fill('[data-testid="message-input"]', messageText);
    await page.press('[data-testid="message-input"]', 'Enter');

    // Verify message appears
    await expect(page.locator(`text=${messageText}`)).toBeVisible();
  });
});
```

### 🔧 API Testing

#### 1. Edge Function Testing

```typescript
// tests/api/hcaptcha.test.ts
import { describe, it, expect } from 'vitest';

describe('hCaptcha Edge Function', () => {
  const EDGE_FUNCTION_URL = 'https://your-project.supabase.co/functions/v1/hcaptcha-verify';

  it('should reject invalid token', async () => {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        token: 'invalid-token'
      })
    });

    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should handle missing token', async () => {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({})
    });

    expect(response.status).toBe(400);
  });
});
```

### 📊 Performance Testing

#### 1. Load Testing with Artillery

```yaml
# artillery.yml
config:
  target: 'http://localhost:5173'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"

scenarios:
  - name: "User journey"
    weight: 70
    requests:
      - get:
          url: "/"
      - get:
          url: "/auth"
      - get:
          url: "/discover"

  - name: "API calls"
    weight: 30
    requests:
      - post:
          url: "/api/profiles"
          json:
            limit: 10
```

#### 2. Lighthouse Performance

```typescript
// tests/performance.test.ts
import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test('should meet performance benchmarks', async ({ page }) => {
  await page.goto('/');
  
  await playAudit({
    page,
    thresholds: {
      performance: 90,
      accessibility: 90,
      'best-practices': 90,
      seo: 80,
    },
  });
});
```

### 🛡️ Security Testing

#### 1. XSS Prevention

```typescript
// tests/security/xss.test.ts
import { test, expect } from '@playwright/test';

test('should prevent XSS attacks', async ({ page }) => {
  await page.goto('/auth');
  
  // Try to inject script
  const maliciousScript = '<script>alert("XSS")</script>';
  await page.fill('[name="first_name"]', maliciousScript);
  
  // Verify script is not executed
  page.on('dialog', () => {
    throw new Error('XSS vulnerability detected!');
  });
  
  await page.click('button[type="submit"]');
  
  // Verify input is sanitized
  const inputValue = await page.inputValue('[name="first_name"]');
  expect(inputValue).not.toContain('<script>');
});
```

### 📝 Test Scripts

#### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:api": "vitest tests/api",
    "test:performance": "artillery run artillery.yml",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### 🚀 Running Tests

#### Local Development

```bash
# Unit tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance
```

#### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 📊 Test Coverage Goals

| Component Type | Coverage Target |
|----------------|-----------------|
| Hooks | 90%+ |
| Components | 80%+ |
| Pages | 70%+ |
| Utils | 95%+ |
| API Functions | 85%+ |

### 🔍 Debugging Tests

#### 1. Visual Debugging

```bash
# Run tests in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test --debug auth.e2e.test.ts
```

#### 2. Test Artifacts

```typescript
// Save screenshots on failure
test('should login successfully', async ({ page }) => {
  await page.goto('/auth');
  // ... test steps
  
  // Take screenshot on failure
  await page.screenshot({ 
    path: 'test-results/login-failure.png',
    fullPage: true 
  });
});
```

### ✅ Testing Checklist

- [ ] Unit tests for critical hooks
- [ ] Component tests for UI components
- [ ] E2E tests for user journeys
- [ ] API tests for Edge Functions
- [ ] Performance tests for key pages
- [ ] Security tests for input validation
- [ ] Accessibility tests
- [ ] Mobile responsiveness tests
- [ ] Cross-browser compatibility
- [ ] Error handling scenarios
