# 🧩 ComplicesConecta - Componentes UI v2.0.0

## 📋 Componentes Críticos

### 🔐 Autenticación

#### `HCaptchaWidget.tsx`
Widget de verificación hCaptcha con backend seguro
- **Ubicación:** `src/components/HCaptchaWidget.tsx`
- **Props:** `siteKey`, `onVerify`, `onError`, `theme`, `size`
- **Funcionalidad:** Verificación server-side con Edge Function
- **Uso:** Formularios de registro y login

#### `AuthForm.tsx`
Formulario de autenticación unificado
- **Ubicación:** `src/components/auth/AuthForm.tsx`
- **Props:** `mode`, `onSuccess`, `onError`
- **Funcionalidad:** Login/registro con validación
- **Uso:** Página `/auth`

### 👤 Perfiles

#### `ProfileCard.tsx`
Tarjeta de perfil para listados
- **Ubicación:** `src/components/ProfileCard.tsx`
- **Props:** `profile`, `onClick`, `showActions`
- **Funcionalidad:** Vista previa de perfil con acciones
- **Uso:** Discover, Matches, Profiles

#### `SingleCard.tsx`
Tarjeta específica para perfiles individuales
- **Ubicación:** `src/components/discover/SingleCard.tsx`
- **Props:** `profile`, `onLike`, `onSuperLike`, `onInvite`
- **Funcionalidad:** Acciones de matching y invitaciones
- **Uso:** Página Discover

#### `CoupleCard.tsx`
Tarjeta específica para parejas
- **Ubicación:** `src/components/discover/CoupleCard.tsx`
- **Props:** `profile`, `onLike`, `onSuperLike`, `onInvite`
- **Funcionalidad:** Vista dual con información de ambos partners
- **Uso:** Página Discover

### 🖼️ Gestión de Imágenes

#### `ImageUpload.tsx`
Componente de subida de imágenes
- **Ubicación:** `src/components/ImageUpload.tsx`
- **Props:** `onUpload`, `maxSize`, `acceptedTypes`
- **Funcionalidad:** Drag & drop, validación, preview
- **Uso:** Edición de perfiles

#### `ImageGallery.tsx`
Galería de imágenes con permisos
- **Ubicación:** `src/components/ImageGallery.tsx`
- **Props:** `images`, `canEdit`, `onDelete`
- **Funcionalidad:** Vista grid, modal preview, gestión
- **Uso:** Perfiles, galerías privadas

### 💬 Chat

#### `ChatList.tsx`
Lista de conversaciones
- **Ubicación:** `src/components/chat/ChatList.tsx`
- **Props:** `rooms`, `onRoomSelect`, `currentRoom`
- **Funcionalidad:** Lista de salas con estado online
- **Uso:** Página Chat

#### `MessageList.tsx`
Lista de mensajes en tiempo real
- **Ubicación:** `src/components/chat/MessageList.tsx`
- **Props:** `roomId`, `messages`, `onNewMessage`
- **Funcionalidad:** Scroll automático, timestamps, burbujas
- **Uso:** Chat rooms

#### `MessageInput.tsx`
Input de mensajes con funciones avanzadas
- **Ubicación:** `src/components/chat/MessageInput.tsx`
- **Props:** `onSend`, `placeholder`, `disabled`
- **Funcionalidad:** Envío por Enter, emojis, archivos
- **Uso:** Chat activo

### 🔗 Invitaciones

#### `RequestCard.tsx`
Tarjeta de solicitud de conexión
- **Ubicación:** `src/components/RequestCard.tsx`
- **Props:** `invitation`, `onAccept`, `onDecline`
- **Funcionalidad:** Vista de invitación con acciones
- **Uso:** Página Requests

#### `SendRequestDialog.tsx`
Modal para enviar invitaciones
- **Ubicación:** `src/components/invitations/SendRequestDialog.tsx`
- **Props:** `recipientId`, `onSend`, `onClose`
- **Funcionalidad:** Formulario con mensaje personalizado
- **Uso:** Perfiles, discover

### ⚙️ Navegación

#### `Header.tsx`
Header principal con navegación
- **Ubicación:** `src/components/Header.tsx`
- **Props:** `user`, `onLogout`
- **Funcionalidad:** Navegación responsive, detección APK
- **Uso:** Layout global

#### `Navigation.tsx`
Bottom tab bar para móvil
- **Ubicación:** `src/components/Navigation.tsx`
- **Props:** `currentPath`, `user`
- **Funcionalidad:** Navegación táctil, estados activos
- **Uso:** Layout móvil

#### `Sidebar.tsx`
Sidebar para desktop
- **Ubicación:** `src/components/Sidebar.tsx`
- **Props:** `isOpen`, `onClose`, `user`
- **Funcionalidad:** Menú colapsible, filtros
- **Uso:** Layout desktop

### 🎛️ UI Base (shadcn/ui)

#### `Button.tsx`
Botón base del sistema de diseño
- **Ubicación:** `src/components/ui/button.tsx`
- **Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Sizes:** `default`, `sm`, `lg`, `icon`
- **Uso:** Acciones primarias y secundarias

#### `Card.tsx`
Contenedor base para contenido
- **Ubicación:** `src/components/ui/card.tsx`
- **Componentes:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`
- **Uso:** Perfiles, estadísticas, formularios

#### `Dialog.tsx`
Modal base del sistema
- **Ubicación:** `src/components/ui/dialog.tsx`
- **Componentes:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- **Uso:** Confirmaciones, formularios, previews

#### `Input.tsx`
Campo de entrada base
- **Ubicación:** `src/components/ui/input.tsx`
- **Props:** `type`, `placeholder`, `disabled`, `error`
- **Uso:** Formularios, búsquedas, filtros

#### `Tabs.tsx`
Sistema de pestañas
- **Ubicación:** `src/components/ui/tabs.tsx`
- **Componentes:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Uso:** Navegación de contenido, filtros

### 📊 Estadísticas

#### `StatsCard.tsx`
Tarjeta de estadística
- **Ubicación:** `src/components/analytics/StatsCard.tsx`
- **Props:** `title`, `value`, `icon`, `trend`
- **Funcionalidad:** Métricas con gradientes temáticos
- **Uso:** Dashboard, admin

#### `MetricsChart.tsx`
Gráfico de métricas
- **Ubicación:** `src/components/analytics/MetricsChart.tsx`
- **Props:** `data`, `type`, `colors`
- **Funcionalidad:** Visualización de datos
- **Uso:** Panel admin

### 🎭 Modales

#### `FeatureModal.tsx`
Modal informativo de funcionalidades
- **Ubicación:** `src/components/modals/FeatureModal.tsx`
- **Props:** `feature`, `isOpen`, `onClose`
- **Funcionalidad:** Información de características
- **Uso:** Index, ayuda contextual

#### `ConfirmDialog.tsx`
Modal de confirmación
- **Ubicación:** `src/components/modals/ConfirmDialog.tsx`
- **Props:** `title`, `message`, `onConfirm`, `onCancel`
- **Funcionalidad:** Confirmaciones críticas
- **Uso:** Eliminaciones, acciones importantes

### 🪙 Tokens

#### `TokenBalance.tsx`
Visualizador de balance de tokens
- **Ubicación:** `src/components/tokens/TokenBalance.tsx`
- **Props:** `balance`, `tokenType`, `showActions`
- **Funcionalidad:** Balance CMPX/GTK con acciones
- **Uso:** Header, dashboard

#### `WorldIDButton.tsx`
Botón de verificación World ID
- **Ubicación:** `src/components/tokens/WorldIDButton.tsx`
- **Props:** `onSuccess`, `onError`
- **Funcionalidad:** Verificación humana con recompensas
- **Uso:** Registro, perfil

## 🎨 Patrones de Diseño

### Colores Temáticos
```css
/* Gradientes principales */
.bg-hero-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.bg-card-gradient { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.bg-premium-gradient { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
```

### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Estados de Carga
```tsx
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
);
```

## 📱 Responsividad

### Breakpoints
- **Mobile:** `< 768px`
- **Tablet:** `768px - 1024px`
- **Desktop:** `> 1024px`

### Grid Layouts
```css
/* Mobile-first approach */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}
```

## 🔧 Hooks Personalizados

### `useAuth.ts`
Hook de autenticación
- **Funciones:** `login`, `logout`, `register`, `user`, `loading`
- **Uso:** Componentes que requieren autenticación

### `useToast.ts`
Hook de notificaciones
- **Funciones:** `toast`, `success`, `error`, `warning`
- **Uso:** Feedback de acciones del usuario

### `useGeolocation.ts`
Hook de geolocalización
- **Funciones:** `getCurrentPosition`, `watchPosition`, `coordinates`
- **Uso:** Matching por proximidad

### `useFeatures.ts`
Hook de feature flags
- **Funciones:** `isEnabled`, `getPhase`, `features`
- **Uso:** Control de funcionalidades por fase

## 📝 Convenciones

### Nomenclatura
- Componentes: `PascalCase`
- Props: `camelCase`
- Archivos: `PascalCase.tsx`
- Hooks: `use + PascalCase`

### Estructura de Archivos
```
components/
├── ui/           # Componentes base (shadcn/ui)
├── auth/         # Autenticación
├── chat/         # Mensajería
├── discover/     # Descubrimiento
├── modals/       # Modales
└── [feature]/    # Agrupados por funcionalidad
```

### Props Interface
```tsx
interface ComponentProps {
  // Props requeridas primero
  id: string;
  title: string;
  
  // Props opcionales después
  className?: string;
  disabled?: boolean;
  
  // Callbacks al final
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
}
```
