# 🛡️ FUNCIONALIDADES DE SEGURIDAD AVANZADA

## Resumen General

Este documento describe las funcionalidades de seguridad implementadas en la plataforma Complices Conecta, incluyendo bloqueo de descargas multimedia, protección contra capturas de pantalla y autenticación biométrica configurable.

## 📋 Tabla de Contenidos

1. [Bloqueo de Descargas Multimedia](#bloqueo-de-descargas-multimedia)
2. [Protección contra Screenshots](#protección-contra-screenshots)
3. [Autenticación Biométrica](#autenticación-biométrica)
4. [Watermarks Dinámicos](#watermarks-dinámicos)
5. [Configuración por Roles](#configuración-por-roles)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [Pruebas de Validación](#pruebas-de-validación)
8. [Limitaciones Conocidas](#limitaciones-conocidas)

---

## 🔒 Bloqueo de Descargas Multimedia

### Descripción
Sistema de URLs firmadas temporales que controla el acceso a contenido multimedia basado en permisos de usuario y roles.

### Componentes Implementados

#### `SecureMediaService` (`src/lib/secureMediaService.ts`)
- **URLs Firmadas**: Genera URLs temporales con expiración de 1 hora
- **Validación de Permisos**: Verifica roles antes de generar URLs
- **Auditoría**: Registra todos los accesos en `media_access_logs`

#### `ProtectedMedia` (`src/components/security/ProtectedMedia.tsx`)
- **Componente React**: Renderiza media con protecciones integradas
- **Controles de Descarga**: Botón de descarga solo para usuarios autorizados
- **Bloqueo de Clic Derecho**: Previene menú contextual en imágenes
- **Watermark Integrado**: Muestra ID de usuario y estado de protección

### Permisos por Rol

| Rol | Vista | Descarga | Notas |
|-----|-------|----------|-------|
| **Propietario** | ✅ | ✅ | Acceso completo a su contenido |
| **Administrador** | ✅ | ✅ | Acceso completo a todo el contenido |
| **Moderador** | ✅ | ❌ | Solo vista para moderación |
| **Usuario** | ✅* | ❌ | Solo contenido público |

*Contenido público según configuración de privacidad del propietario

### Uso Básico

```tsx
import { ProtectedMedia } from '@/components/security/ProtectedMedia';

<ProtectedMedia
  mediaPath="user-photos/image.jpg"
  mediaOwnerId="owner-profile-id"
  mediaType="image"
  alt="Foto protegida"
  showDownloadButton={true}
  watermarkText="Contenido Privado"
/>
```

---

## 📱 Protección contra Screenshots

### Android APK (`SecurityManager.java`)

#### Funcionalidades Implementadas
- **FLAG_SECURE**: Bloquea screenshots y grabación de pantalla
- **Detección de Apps**: Identifica aplicaciones de screen recording
- **Modo Debug**: Detecta si la app está en modo desarrollo

#### Métodos Principales

```java
// Activar protección
SecurityManager.getInstance(context).enableScreenshotBlocking(activity);

// Aplicar todas las medidas de seguridad
SecurityManager.getInstance(context).applySecurityMeasures(activity);

// Verificar apps de grabación
boolean isRecording = SecurityManager.getInstance(context).isScreenRecordingDetected();
```

### Web (`useScreenshotProtection.ts`)

#### Protecciones Implementadas
- **Teclas Bloqueadas**: Print Screen, Ctrl+S, F12, Ctrl+Shift+I
- **Clic Derecho**: Bloqueado en elementos multimedia
- **DevTools**: Detección de herramientas de desarrollo abiertas
- **Arrastrar**: Previene drag & drop de imágenes

#### Uso del Hook

```tsx
import { useScreenshotProtection } from '@/hooks/useScreenshotProtection';

const MyComponent = () => {
  useScreenshotProtection({
    enabled: true,
    showWarnings: true,
    logAttempts: true,
    onAttemptDetected: (method) => console.log(`Intento detectado: ${method}`)
  });

  return <div>Contenido protegido</div>;
};
```

---

## 🔐 Autenticación Biométrica

### Base de Datos

#### Tabla `profiles`
```sql
-- Nueva columna para habilitar/deshabilitar biometría
ALTER TABLE profiles ADD COLUMN biometric_enabled BOOLEAN DEFAULT FALSE;
```

#### Tabla `biometric_sessions`
```sql
-- Gestión de sesiones biométricas activas
CREATE TABLE biometric_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT UNIQUE,
    device_id TEXT,
    biometric_type TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Hook `useBiometricAuth`

#### Funcionalidades
- **Verificar Disponibilidad**: Detecta soporte de WebAuthn
- **Registro**: Crear credenciales biométricas
- **Autenticación**: Validar con huella/FaceID
- **Gestión de Sesiones**: Crear y validar sesiones activas

#### Ejemplo de Uso

```tsx
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

const BiometricSettings = () => {
  const {
    isEnabled,
    setBiometricEnabled,
    registerBiometric,
    authenticateWithBiometric
  } = useBiometricAuth();

  const handleToggleBiometric = async () => {
    if (!isEnabled) {
      const result = await registerBiometric();
      if (result.success) {
        await setBiometricEnabled(true);
      }
    } else {
      await setBiometricEnabled(false);
    }
  };

  return (
    <button onClick={handleToggleBiometric}>
      {isEnabled ? 'Desactivar' : 'Activar'} Biometría
    </button>
  );
};
```

### Android Integration

#### Configuración en MainActivity
```java
public class MainActivity extends BridgeActivity {
    private SecurityManager securityManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        securityManager = SecurityManager.getInstance(this);
        
        // Aplicar medidas de seguridad
        securityManager.applySecurityMeasures(this);
        
        // Verificar si biometría está habilitada
        if (securityManager.isBiometricEnabled()) {
            showBiometricPrompt();
        }
    }
    
    private void showBiometricPrompt() {
        securityManager.setupBiometricAuthentication(this, new SecurityManager.BiometricAuthCallback() {
            @Override
            public void onSuccess() {
                // Continuar con la aplicación
            }
            
            @Override
            public void onError(String error) {
                // Manejar error
            }
        });
        
        securityManager.showBiometricPrompt();
    }
}
```

---

## 🏷️ Watermarks Dinámicos

### Componente `DynamicWatermark`

#### Características
- **Patrón Repetido**: Watermark invisible que cubre toda la superficie
- **Información Dinámica**: ID de usuario, timestamp, texto personalizado
- **Intensidades**: Light, Medium, Heavy
- **Protección DOM**: Detecta y previene manipulación

#### Uso

```tsx
import { DynamicWatermark } from '@/components/security/DynamicWatermark';

<DynamicWatermark 
  intensity="medium"
  showUserId={true}
  showTimestamp={true}
  customText="CONFIDENCIAL"
>
  <img src="sensitive-content.jpg" alt="Contenido sensible" />
</DynamicWatermark>
```

#### Hook `useWatermark`

```tsx
import { useWatermark } from '@/components/security/DynamicWatermark';

const MyComponent = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  
  useWatermark(imageRef, { 
    intensity: 'heavy',
    showUserId: true 
  });

  return <img ref={imageRef} src="protected-image.jpg" />;
};
```

---

## 👥 Configuración por Roles

### Matriz de Permisos

| Funcionalidad | Admin | Moderador | Usuario | Propietario |
|---------------|-------|-----------|---------|-------------|
| Ver contenido | ✅ Todo | ✅ Todo | ✅ Público | ✅ Propio |
| Descargar | ✅ Todo | ❌ | ❌ | ✅ Propio |
| Configurar biometría | ✅ | ✅ | ✅ | ✅ |
| Ver logs de acceso | ✅ Todo | ❌ | ✅ Propios | ✅ Propios |
| Revocar accesos | ✅ | ✅ Reportados | ❌ | ✅ Propios |

### Configuración de Privacidad

```json
{
  "privacy_settings": {
    "media_public": true,
    "allow_downloads": false,
    "watermark_intensity": "medium",
    "screenshot_protection": true
  }
}
```

---

## ⚙️ Instalación y Configuración

### 1. Base de Datos

```bash
# Ejecutar migración
supabase migration up 20250923_add_biometric_security.sql
```

### 2. Android APK

#### Dependencias en `build.gradle`
```gradle
dependencies {
    implementation 'androidx.biometric:biometric:1.1.0'
    implementation 'androidx.fragment:fragment:1.5.0'
}
```

#### Permisos en `AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

### 3. Web Frontend

#### Importar Componentes
```tsx
// En tu componente principal
import { useScreenshotProtection } from '@/hooks/useScreenshotProtection';
import { ProtectedMedia } from '@/components/security/ProtectedMedia';
import { DynamicWatermark } from '@/components/security/DynamicWatermark';

// Activar protección global
const App = () => {
  useScreenshotProtection({ enabled: true });
  return <YourAppContent />;
};
```

---

## 🧪 Pruebas de Validación

### Checklist de Seguridad

#### ✅ Bloqueo de Descargas
- [ ] Propietario puede descargar su contenido
- [ ] Administrador puede descargar todo el contenido
- [ ] Moderador NO puede descargar (solo vista)
- [ ] Usuario normal NO puede descargar contenido privado
- [ ] URLs firmadas expiran después de 1 hora

#### ✅ Protección Screenshots
- [ ] Android APK bloquea screenshots con FLAG_SECURE
- [ ] Web detecta y bloquea Print Screen
- [ ] Web detecta y bloquea Ctrl+S
- [ ] Web detecta apertura de DevTools
- [ ] Clic derecho bloqueado en imágenes

#### ✅ Autenticación Biométrica
- [ ] Usuario puede activar/desactivar desde perfil
- [ ] APK solicita biometría si está habilitada
- [ ] Web usa WebAuthn cuando está disponible
- [ ] Sesiones expiran correctamente
- [ ] Fallback a login normal si biometría falla

#### ✅ Watermarks
- [ ] Watermark visible en esquina
- [ ] Patrón invisible cubre toda la superficie
- [ ] Información de usuario incluida
- [ ] Timestamp actualizado dinámicamente
- [ ] Protección contra manipulación DOM

### Scripts de Prueba

#### Ejecutar Migración SQL
```sql
-- Ejecutar en Supabase SQL Editor
\i supabase/migrations/20250923_add_biometric_security.sql
```

#### Probar URLs Firmadas
```bash
# Generar URL firmada
curl -X POST /api/secure-media \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mediaPath": "test.jpg", "requestType": "view"}'

# Verificar expiración
sleep 3601 # Esperar más de 1 hora
curl -I $SIGNED_URL # Debería retornar 403
```

#### Probar Biometría Web
```javascript
// En consola del navegador
navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array(32),
    rp: { name: "Test", id: "localhost" },
    user: { id: new Uint8Array(16), name: "test", displayName: "Test" },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }]
  }
}).then(console.log).catch(console.error);
```

---

## ⚠️ Limitaciones Conocidas

### Web Browser
- **Screenshots**: No se pueden bloquear completamente en navegadores
- **DevTools**: Usuarios avanzados pueden deshabilitar JavaScript
- **Watermarks**: Pueden ser removidos con herramientas de desarrollo
- **WebAuthn**: No disponible en todos los navegadores

### Android APK
- **Root**: Dispositivos rooteados pueden bypasear FLAG_SECURE
- **Screen Recording**: Apps con permisos de sistema pueden grabar
- **Emuladores**: Protecciones limitadas en entornos virtuales

### General
- **Performance**: Watermarks dinámicos pueden afectar rendimiento
- **UX**: Protecciones excesivas pueden degradar experiencia de usuario
- **Compatibilidad**: Funciones biométricas varían entre dispositivos

---

## 📞 Soporte y Mantenimiento

### Logs de Seguridad

```sql
-- Ver intentos de acceso denegados
SELECT * FROM media_access_logs 
WHERE action = 'denied' 
ORDER BY created_at DESC;

-- Ver sesiones biométricas activas
SELECT * FROM biometric_sessions 
WHERE is_active = true 
AND expires_at > NOW();
```

### Monitoreo Recomendado
- **Alertas**: Configurar alertas para múltiples intentos denegados
- **Auditoría**: Revisar logs de acceso semanalmente
- **Limpieza**: Ejecutar `cleanup_expired_biometric_sessions()` diariamente

### Contacto
Para soporte técnico o reportar vulnerabilidades:
- **Email**: security@complicesconecta.com
- **Documentación**: Ver `RELEASE_NOTES_v3.x.md` para actualizaciones

---

*Documento actualizado: 23 de septiembre de 2025*
*Versión: 1.0.0*

# 🔐 SECURITY FEATURES - ComplicesConecta v3.3.0

**Fecha:** 23 de Septiembre, 2025 - 10:42 hrs  
**Versión:** 3.3.0  
**Estado de Seguridad:** ✅ **ENTERPRISE GRADE**

---

## 🆕 **NUEVAS CARACTERÍSTICAS DE SEGURIDAD v3.3.0**

### 🔐 **Sistema de Auditoría Avanzada**
- **Tabla audit_logs**: Registro completo de todas las acciones del sistema
- **IP Tracking**: Monitoreo de direcciones IP sospechosas
- **Session Monitoring**: Seguimiento completo de sesiones de usuario
- **Risk Scoring**: Puntuación automática de riesgo por acción
- **Fraud Detection**: Detección automática de actividad fraudulenta

### 🛡️ **Autenticación de Dos Factores (2FA)**
- **Tabla user_2fa_settings**: Configuración TOTP por usuario
- **TOTP Support**: Compatibilidad con Google Authenticator, Authy
- **Backup Codes**: Códigos de recuperación seguros
- **Recovery System**: Sistema de recuperación de cuenta

### 📊 **Logs de Moderación**
- **Tabla moderation_logs**: Registro de todas las acciones de moderación
- **Estado Anterior/Posterior**: Tracking completo de cambios
- **Metadatos de Contexto**: Información adicional por acción
- **Auditoría de Moderadores**: Seguimiento de acciones por moderador

### 🔔 **Seguridad en Notificaciones**
- **Token Validation**: Validación de tokens FCM
- **Device Tracking**: Seguimiento de dispositivos registrados
- **Notification History**: Historial completo de notificaciones
- **Preference Security**: Seguridad en preferencias de usuario

### 📈 **Monitoreo de Seguridad**
- **Performance Monitoring**: Detección de anomalías en performance
- **Error Rate Monitoring**: Alertas por tasas de error elevadas
- **User Activity Monitoring**: Seguimiento de actividad sospechosa
- **System Health**: Monitoreo de salud del sistema
