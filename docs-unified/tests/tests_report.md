# Plan de Pruebas Automatizadas - ComplicesConecta

## Estrategia de Testing

### Pirámide de Pruebas
```
    E2E Tests (10%)
   ┌─────────────────┐
   │ Flujos críticos │
   └─────────────────┘
  
  Integration Tests (20%)
 ┌─────────────────────┐
 │ APIs + Components   │
 └─────────────────────┘

Unit Tests (70%)
┌─────────────────────────┐
│ Funciones + Servicios   │
└─────────────────────────┘
```

## Configuración de Testing

### Dependencias Requeridas
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "vitest": "^0.34.6",
    "jsdom": "^22.1.0",
    "msw": "^1.3.2",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

### Configuración Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

## Pruebas Unitarias (70%)

### 1. Servicios Core

#### ProfileImageService Tests
```typescript
// src/lib/__tests__/storage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfileImageService } from '../storage'

describe('ProfileImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateFile', () => {
    it('should accept valid image files', () => {
      const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      expect(() => ProfileImageService.validateFile(validFile)).not.toThrow()
    })

    it('should reject files over size limit', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      })
      expect(() => ProfileImageService.validateFile(largeFile))
        .toThrow('File size must be less than 5MB')
    })

    it('should reject invalid file types', () => {
      const invalidFile = new File([''], 'test.txt', { type: 'text/plain' })
      expect(() => ProfileImageService.validateFile(invalidFile))
        .toThrow('Invalid file type')
    })
  })

  describe('resizeImage', () => {
    it('should resize image to specified dimensions', async () => {
      // Mock canvas and context
      const mockCanvas = document.createElement('canvas')
      const mockContext = {
        drawImage: vi.fn(),
        canvas: mockCanvas
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas)
      vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext)

      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const resized = await ProfileImageService.resizeImage(file, 200, 200)
      
      expect(resized).toBeInstanceOf(File)
      expect(mockContext.drawImage).toHaveBeenCalled()
    })
  })
})
```

#### RequestsService Tests
```typescript
// src/lib/__tests__/requests.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RequestsService } from '../requests'
import { supabase } from '../../integrations/supabase/client'

vi.mock('../../integrations/supabase/client')

describe('RequestsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendRequest', () => {
    it('should send connection request successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ 
        data: { id: 'test-id' }, 
        error: null 
      })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await RequestsService.sendRequest('receiver-id', 'Hello!')
      
      expect(mockInsert).toHaveBeenCalledWith({
        receiver_id: 'receiver-id',
        message: 'Hello!',
        status: 'pending'
      })
      expect(result.data).toEqual({ id: 'test-id' })
    })

    it('should handle duplicate request error', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value' }
      })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await RequestsService.sendRequest('receiver-id')
      
      expect(result.error?.message).toContain('Ya tienes una solicitud pendiente')
    })
  })

  describe('respondToRequest', () => {
    it('should accept request successfully', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ 
        data: { status: 'accepted' }, 
        error: null 
      })
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: vi.fn().mockReturnThis()
      } as any)

      const result = await RequestsService.respondToRequest('request-id', 'accepted')
      
      expect(mockUpdate).toHaveBeenCalledWith({ 
        status: 'accepted', 
        updated_at: expect.any(String) 
      })
      expect(result.data?.status).toBe('accepted')
    })
  })
})
```

### 2. Componentes React

#### ImageUpload Component Tests
```typescript
// src/components/__tests__/ImageUpload.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUpload } from '../ImageUpload'

describe('ImageUpload', () => {
  const mockOnUpload = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render upload area', () => {
    render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />)
    
    expect(screen.getByText(/drag.*drop.*image/i)).toBeInTheDocument()
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument()
  })

  it('should handle file selection', async () => {
    const user = userEvent.setup()
    render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/upload image/i)
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(expect.any(String))
    })
  })

  it('should show error for invalid file', async () => {
    const user = userEvent.setup()
    render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />)
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/upload image/i)
    
    await user.upload(input, file)
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Invalid file type'))
    })
  })

  it('should show upload progress', async () => {
    render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />)
    
    // Simulate upload in progress
    fireEvent.change(screen.getByLabelText(/upload image/i), {
      target: { files: [new File(['test'], 'test.jpg', { type: 'image/jpeg' })] }
    })
    
    expect(screen.getByText(/uploading/i)).toBeInTheDocument()
  })
})
```

#### RequestCard Component Tests
```typescript
// src/components/__tests__/RequestCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RequestCard } from '../RequestCard'

const mockRequest = {
  id: 'test-id',
  sender_id: 'sender-id',
  receiver_id: 'receiver-id',
  message: 'Hello!',
  status: 'pending' as const,
  created_at: '2025-01-03T10:00:00Z',
  sender_profile: {
    id: 'sender-id',
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: null
  }
}

describe('RequestCard', () => {
  const mockOnAccept = vi.fn()
  const mockOnDecline = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render request information', () => {
    render(
      <RequestCard 
        request={mockRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    )
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Hello!')).toBeInTheDocument()
    expect(screen.getByText(/hace/)).toBeInTheDocument()
  })

  it('should show accept and decline buttons for pending requests', () => {
    render(
      <RequestCard 
        request={mockRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    )
    
    expect(screen.getByText('Aceptar')).toBeInTheDocument()
    expect(screen.getByText('Rechazar')).toBeInTheDocument()
  })

  it('should call onAccept when accept button is clicked', () => {
    render(
      <RequestCard 
        request={mockRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    )
    
    fireEvent.click(screen.getByText('Aceptar'))
    expect(mockOnAccept).toHaveBeenCalledWith('test-id')
  })

  it('should show status for non-pending requests', () => {
    const acceptedRequest = { ...mockRequest, status: 'accepted' as const }
    render(
      <RequestCard 
        request={acceptedRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />
    )
    
    expect(screen.getByText('Aceptada')).toBeInTheDocument()
    expect(screen.queryByText('Aceptar')).not.toBeInTheDocument()
  })
})
```

## Pruebas de Integración (20%)

### 1. API Integration Tests

#### Supabase Integration Tests
```typescript
// src/test/integration/supabase.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Test database configuration
const testSupabase = createClient(
  process.env.VITE_SUPABASE_TEST_URL!,
  process.env.VITE_SUPABASE_TEST_ANON_KEY!
)

describe('Supabase Integration', () => {
  let testUserId: string
  let testProfileId: string

  beforeAll(async () => {
    // Create test user
    const { data: authData } = await testSupabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    testUserId = authData.user!.id

    // Create test profile
    const { data: profileData } = await testSupabase
      .from('profiles')
      .insert({
        user_id: testUserId,
        first_name: 'Test',
        last_name: 'User'
      })
      .select()
      .single()
    testProfileId = profileData.id
  })

  afterAll(async () => {
    // Cleanup test data
    await testSupabase.from('profiles').delete().eq('id', testProfileId)
    await testSupabase.auth.admin.deleteUser(testUserId)
  })

  describe('Connection Requests', () => {
    it('should create and retrieve connection requests', async () => {
      // Create request
      const { data: createData, error: createError } = await testSupabase
        .from('connection_requests')
        .insert({
          sender_id: testProfileId,
          receiver_id: testProfileId, // Self-request for testing
          message: 'Test request'
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(createData.message).toBe('Test request')

      // Retrieve request
      const { data: retrieveData, error: retrieveError } = await testSupabase
        .from('connection_requests')
        .select('*')
        .eq('id', createData.id)
        .single()

      expect(retrieveError).toBeNull()
      expect(retrieveData.message).toBe('Test request')
    })

    it('should prevent duplicate pending requests', async () => {
      // First request
      await testSupabase
        .from('connection_requests')
        .insert({
          sender_id: testProfileId,
          receiver_id: testProfileId,
          message: 'First request'
        })

      // Duplicate request should fail
      const { error } = await testSupabase
        .from('connection_requests')
        .insert({
          sender_id: testProfileId,
          receiver_id: testProfileId,
          message: 'Duplicate request'
        })

      expect(error).toBeTruthy()
      expect(error?.code).toBe('23505') // Unique constraint violation
    })
  })

  describe('RLS Policies', () => {
    it('should enforce profile visibility policies', async () => {
      // Test that users can only see their own profiles
      const { data, error } = await testSupabase
        .from('profiles')
        .select('*')
        .eq('user_id', testUserId)

      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data[0].user_id).toBe(testUserId)
    })
  })
})
```

### 2. Component Integration Tests

#### Auth Flow Integration
```typescript
// src/test/integration/auth-flow.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Auth } from '../../pages/Auth'

const AuthWithRouter = () => (
  <BrowserRouter>
    <Auth />
  </BrowserRouter>
)

describe('Auth Flow Integration', () => {
  it('should handle demo login flow', async () => {
    // Mock environment for demo mode
    vi.stubEnv('VITE_APP_MODE', 'demo')
    
    render(<AuthWithRouter />)
    
    // Fill demo credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'single@outlook.es' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'demo123' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    // Should redirect to profile page
    await waitFor(() => {
      expect(window.location.pathname).toBe('/profile-single')
    })
  })

  it('should show error for invalid credentials', async () => {
    render(<AuthWithRouter />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
    })
  })
})
```

## Pruebas End-to-End (10%)

### 1. Flujos Críticos

#### Complete User Journey
```typescript
// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test('should complete registration and profile setup', async ({ page }) => {
    // Navigate to app
    await page.goto('/')
    
    // Go to auth page
    await page.click('text=Iniciar Sesión')
    
    // Switch to demo mode for testing
    await page.fill('[data-testid="email-input"]', 'single@outlook.es')
    await page.fill('[data-testid="password-input"]', 'demo123')
    await page.click('[data-testid="login-button"]')
    
    // Should redirect to profile page
    await expect(page).toHaveURL('/profile-single')
    
    // Edit profile
    await page.click('text=Editar Perfil')
    await page.fill('[data-testid="bio-input"]', 'This is my test bio')
    await page.click('[data-testid="save-button"]')
    
    // Should show success message
    await expect(page.locator('text=Perfil actualizado')).toBeVisible()
  })

  test('should send and respond to connection requests', async ({ page, context }) => {
    // Create two browser contexts for two users
    const page1 = page
    const page2 = await context.newPage()
    
    // User 1 login
    await page1.goto('/auth')
    await page1.fill('[data-testid="email-input"]', 'single@outlook.es')
    await page1.fill('[data-testid="password-input"]', 'demo123')
    await page1.click('[data-testid="login-button"]')
    
    // User 2 login
    await page2.goto('/auth')
    await page2.fill('[data-testid="email-input"]', 'pareja@outlook.es')
    await page2.fill('[data-testid="password-input"]', 'demo123')
    await page2.click('[data-testid="login-button"]')
    
    // User 1 sends request to User 2
    await page1.goto('/discover')
    await page1.click('[data-testid="send-request-button"]')
    await page1.fill('[data-testid="request-message"]', 'Hello, let\'s connect!')
    await page1.click('[data-testid="send-request-confirm"]')
    
    // User 2 receives and accepts request
    await page2.goto('/requests')
    await expect(page2.locator('text=Hello, let\'s connect!')).toBeVisible()
    await page2.click('[data-testid="accept-request-button"]')
    
    // Both users should see connection established
    await expect(page2.locator('text=Solicitud aceptada')).toBeVisible()
  })
})
```

#### Image Upload Flow
```typescript
// e2e/image-upload.spec.ts
import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Image Upload Flow', () => {
  test('should upload profile image successfully', async ({ page }) => {
    // Login
    await page.goto('/auth')
    await page.fill('[data-testid="email-input"]', 'single@outlook.es')
    await page.fill('[data-testid="password-input"]', 'demo123')
    await page.click('[data-testid="login-button"]')
    
    // Go to edit profile
    await page.goto('/edit-profile-single')
    
    // Upload image
    const fileInput = page.locator('[data-testid="image-upload-input"]')
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-image.jpg'))
    
    // Wait for upload to complete
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible()
    
    // Save profile
    await page.click('[data-testid="save-profile-button"]')
    
    // Verify image is displayed
    await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible()
  })

  test('should handle upload errors gracefully', async ({ page }) => {
    await page.goto('/edit-profile-single')
    
    // Try to upload invalid file
    const fileInput = page.locator('[data-testid="image-upload-input"]')
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'invalid-file.txt'))
    
    // Should show error message
    await expect(page.locator('text=Invalid file type')).toBeVisible()
  })
})
```

## Scripts de Testing

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e"
  }
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    env:
      VITE_SUPABASE_TEST_URL: ${{ secrets.SUPABASE_TEST_URL }}
      VITE_SUPABASE_TEST_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## Métricas de Cobertura

### Objetivos de Cobertura
- **Funciones críticas:** 95%+
- **Servicios:** 90%+
- **Componentes:** 85%+
- **Cobertura general:** 80%+

### Archivos Críticos para Testing
1. `src/lib/storage.ts` - Sistema de imágenes
2. `src/lib/requests.ts` - Sistema de solicitudes
3. `src/pages/Auth.tsx` - Autenticación
4. `src/pages/EditProfileSingle.tsx` - Edición de perfiles
5. `src/components/ImageUpload.tsx` - Carga de imágenes
6. `src/components/RequestCard.tsx` - Tarjetas de solicitudes

## Implementación Gradual

### Fase 1: Setup y Unit Tests (Semana 1)
- Configurar Vitest y Testing Library
- Tests para servicios críticos (storage, requests)
- Tests para componentes básicos

### Fase 2: Integration Tests (Semana 2)
- Tests de integración con Supabase
- Tests de flujos de autenticación
- Tests de RLS policies

### Fase 3: E2E Tests (Semana 3)
- Setup de Playwright
- Tests de flujos críticos de usuario
- Tests de upload de imágenes
- Tests de sistema de solicitudes

### Fase 4: CI/CD y Optimización (Semana 4)
- Configurar pipeline de CI/CD
- Optimizar performance de tests
- Reportes de cobertura
- Documentación final

## Criterios de Aceptación

### ✅ Tests Unitarios
- Cobertura >85% en servicios críticos
- Todos los edge cases cubiertos
- Tests rápidos (<100ms cada uno)

### ✅ Tests de Integración
- APIs de Supabase funcionando
- RLS policies validadas
- Flujos de autenticación probados

### ✅ Tests E2E
- Flujos críticos de usuario funcionando
- Upload de imágenes validado
- Sistema de solicitudes probado

### ✅ CI/CD
- Pipeline automatizado funcionando
- Tests ejecutándose en cada PR
- Reportes de cobertura generados
