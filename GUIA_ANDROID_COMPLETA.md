# 📱 GUÍA COMPLETA ANDROID - v3.6.6

**Fecha:** 19 de Noviembre, 2025  
**Versión:** v3.6.6  
**Framework:** Capacitor 6 + Android SDK 35

---

## 📋 PRE-REQUISITOS

### **Software Requerido:**
```
[ ] Android Studio (última versión)
[ ] JDK 17+ (recomendado JDK 21)
[ ] Android SDK 35
[ ] Node.js 20+
[ ] Capacitor CLI
```

### **Instalación Android Studio:**
```
1. Descargar de: https://developer.android.com/studio
2. Instalar con SDK Tools incluidos
3. Configurar Android SDK:
   - SDK Platform 35 (Android 15)
   - SDK Build-Tools 35.0.0
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools
4. Configurar variables de entorno:
   ANDROID_HOME=C:\Users\tu_usuario\AppData\Local\Android\Sdk
   PATH += %ANDROID_HOME%\platform-tools
   PATH += %ANDROID_HOME%\tools
```

---

## ✅ PASO 1: ACTUALIZAR VERSIÓN (COMPLETADO)

### **Archivos Actualizados:**
- ✅ `android/app/build.gradle` → versionCode: 366, versionName: "3.6.6"
- ✅ `capacitor.config.ts` → appendUserAgent: 'ComplicesConecta/3.6.6'

---

## 🔄 PASO 2: SINCRONIZAR WEB → ANDROID

### **Build Web + Sync:**
```bash
# Desde la raíz del proyecto
cd c:\Users\conej\Documents\conecta-social-comunidad-main

# 1. Build web app
npm run build

# 2. Sincronizar con Capacitor
npx cap sync android

# Esto copia:
# - dist/ → android/app/src/main/assets/public/
# - Actualiza plugins
# - Sincroniza configuración
```

### **Verificar Sincronización:**
```bash
npx cap ls

# Debe mostrar:
# ✔ android 
# ✔ Plugins instalados: Camera, Geolocation, Push Notifications, etc.
```

---

## 🔐 PASO 3: PROTECCIÓN LEY OLIMPIA EN ANDROID

### **3.1 Crear Plugin Nativo**

Crear archivo: `android/app/src/main/java/com/complicesconecta/app/ContentProtectionPlugin.java`

```java
package com.complicesconecta.app;

import android.view.WindowManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ContentProtection")
public class ContentProtectionPlugin extends Plugin {

    @PluginMethod
    public void enableScreenProtection(PluginCall call) {
        getBridge().getActivity().runOnUiThread(() -> {
            // Bloquear screenshots y grabación de pantalla
            getBridge().getActivity().getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            );
            call.resolve();
        });
    }

    @PluginMethod
    public void disableScreenProtection(PluginCall call) {
        getBridge().getActivity().runOnUiThread(() -> {
            getBridge().getActivity().getWindow().clearFlags(
                WindowManager.LayoutParams.FLAG_SECURE
            );
            call.resolve();
        });
    }

    @PluginMethod
    public void checkDeveloperMode(PluginCall call) {
        getBridge().getActivity().runOnUiThread(() -> {
            boolean isDeveloperMode = android.provider.Settings.Secure.getInt(
                getBridge().getActivity().getContentResolver(),
                android.provider.Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                0
            ) != 0;
            
            call.resolve(new com.getcapacitor.JSObject().put("enabled", isDeveloperMode));
        });
    }
}
```

### **3.2 Registrar Plugin**

Editar: `android/app/src/main/java/com/complicesconecta/app/MainActivity.java`

```java
package com.complicesconecta.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Registrar plugin de protección
        registerPlugin(ContentProtectionPlugin.class);
        
        // Habilitar protección automáticamente al iniciar
        try {
            ContentProtectionPlugin plugin = new ContentProtectionPlugin();
            plugin.setBridge(this.bridge);
            plugin.enableScreenProtection(null);
        } catch (Exception e) {
            // Log error
        }
    }
}
```

### **3.3 Actualizar Manifest**

Editar: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        ...
        android:allowBackup="false"
        android:hardwareAccelerated="true"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            
            <!-- PROTECCIÓN LEY OLIMPIA -->
            <meta-data 
                android:name="android.allow_screenshot" 
                android:value="false" />
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

    <!-- Permisos necesarios -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Features opcionales -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
</manifest>
```

### **3.4 Agregar ProGuard Rules**

Editar: `android/app/proguard-rules.pro`

```proguard
# Protección de contenido - Ofuscar clases sensibles
-keep class com.complicesconecta.app.ContentProtectionPlugin { *; }

# Proteger contra ingeniería inversa
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Capacitor
-keep public class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Supabase
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**
```

---

## 🛠️ PASO 4: BUILD APK

### **4.1 Build Debug (Testing):**
```bash
# Opción 1: Desde terminal
cd android
./gradlew assembleDebug

# APK generado en:
# android/app/build/outputs/apk/debug/app-debug.apk

# Opción 2: Desde Android Studio
1. Abrir proyecto: android/
2. Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### **4.2 Build Release (Producción):**

#### **A. Crear Keystore (Primera vez):**
```bash
# Generar keystore
keytool -genkey -v -keystore complicesconecta-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias complicesconecta

# Responder preguntas:
# Password keystore: [TU_PASSWORD_SEGURO]
# Password key alias: [MISMO_PASSWORD]
# Nombre: ComplicesConecta
# Organización: ComplicesConecta SW
# Ciudad: [TU_CIUDAD]
# Estado: [TU_ESTADO]
# País: MX

# GUARDAR ESTE ARCHIVO EN LUGAR SEGURO (NO COMMITEAR A GIT)
```

#### **B. Configurar Keystore:**

Crear: `android/keystore.properties`

```properties
storeFile=complicesconecta-release.jks
storePassword=TU_PASSWORD_KEYSTORE
keyAlias=complicesconecta
keyPassword=TU_PASSWORD_KEY
```

**⚠️ IMPORTANTE:**
```bash
# Agregar a .gitignore
echo "android/keystore.properties" >> .gitignore
echo "android/*.jks" >> .gitignore
```

#### **C. Build Release:**
```bash
cd android
./gradlew assembleRelease

# O con bundle (para Google Play):
./gradlew bundleRelease

# APK generado en:
# android/app/build/outputs/apk/release/app-release.apk

# Bundle generado en:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🧪 PASO 5: TESTING

### **5.1 Instalar en Dispositivo (USB):**
```bash
# Habilitar "Depuración USB" en dispositivo Android:
# Ajustes > Acerca del teléfono > Tocar 7 veces "Número de compilación"
# Ajustes > Opciones de desarrollador > Depuración USB (ON)

# Verificar conexión
adb devices

# Instalar APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Ver logs en tiempo real
adb logcat | grep -i "ComplicesConecta"
```

### **5.2 Testing Protección Ley Olimpia:**

**Checklist en dispositivo:**
```
[ ] 1. Abrir app
[ ] 2. Intentar screenshot (botones físicos)
    → Debe mostrar pantalla negra o bloquear
    → Mensaje: "No se pueden tomar capturas de pantalla"
[ ] 3. Intentar grabación de pantalla
    → Debe mostrar pantalla negra en grabación
[ ] 4. Verificar modo desarrollador activo
    → App debe detectar y alertar (opcional: cerrar app)
[ ] 5. Verificar watermarks en imágenes
    → Debe aparecer ID + timestamp
```

### **5.3 Testing Features Principales:**
```
[ ] Login funciona
[ ] Perfil se muestra correctamente
[ ] Chat envía mensajes
[ ] Emojis funcionan
[ ] Upload de imágenes funciona
[ ] Notificaciones push (si configuradas)
[ ] Geolocalización funciona
[ ] Cámara funciona para fotos de perfil
[ ] Dark mode se aplica
[ ] IDs únicos visibles (SNG/CPL)
[ ] Sistema de reportes funcional
```

---

## 📦 PASO 6: PUBLICAR EN GOOGLE PLAY (OPCIONAL)

### **6.1 Preparar Assets:**
```
Requeridos para Google Play Console:
[ ] Icon: 512x512 PNG
[ ] Feature Graphic: 1024x500 PNG
[ ] Screenshots: Mínimo 2 (hasta 8)
    - Phone: 320-3840px (16:9 a 2:1)
    - Tablet (opcional): 1200-7680px
[ ] Privacy Policy URL
[ ] Categoría: Lifestyle / Social
[ ] Clasificación de contenido: +18 (Adultos)
```

### **6.2 Google Play Console:**
```
1. Ir a: https://play.google.com/console
2. Crear aplicación > "ComplicesConecta"
3. Completar ficha de Play Store:
   - Título: ComplicesConecta
   - Descripción corta (80 caracteres)
   - Descripción completa (4000 caracteres)
   - Screenshots
   - Feature Graphic
   - Categoría: Lifestyle
   - Clasificación contenido: +18
4. Configurar política de privacidad
5. Subir AAB:
   - Producción > Crear versión
   - Subir: app-release.aab
   - Versión: 366 (3.6.6)
   - Notas de versión
6. Enviar a revisión
```

### **Tiempos de Revisión:**
- Primera app: 7-14 días
- Actualizaciones: 1-3 días
- Apps +18: Revisión más exhaustiva

---

## 🐛 TROUBLESHOOTING

### **Error: "SDK location not found"**
```bash
# Crear: android/local.properties
sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```

### **Error: "Execution failed for task ':app:mergeDebugResources'"**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### **Error: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"**
```bash
# Desinstalar versión anterior primero
adb uninstall com.complicesconecta.app
# Luego instalar nueva
adb install app-debug.apk
```

### **Error: "Cleartext HTTP traffic not permitted"**
```
Ya configurado en AndroidManifest.xml:
android:usesCleartextTraffic="true"

Para producción, usar solo HTTPS.
```

### **Protección no funciona:**
```
Verificar:
1. FLAG_SECURE está en onCreate de MainActivity
2. AndroidManifest tiene android:allow_screenshot="false"
3. Testeando en dispositivo real (no emulador)
4. Build es Release (no Debug)
```

---

## 📊 COMANDOS ÚTILES

### **Capacitor:**
```bash
# Ver configuración
npx cap ls

# Sincronizar cambios
npx cap sync android

# Copiar solo assets (sin sync plugins)
npx cap copy android

# Abrir en Android Studio
npx cap open android

# Actualizar Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest
npm install @capacitor/android@latest
npx cap sync
```

### **Gradle:**
```bash
cd android

# Limpiar build
./gradlew clean

# Build debug
./gradlew assembleDebug

# Build release
./gradlew assembleRelease

# Bundle release (Google Play)
./gradlew bundleRelease

# Ver dependencias
./gradlew dependencies

# Ver tasks disponibles
./gradlew tasks
```

### **ADB:**
```bash
# Ver dispositivos conectados
adb devices

# Instalar APK
adb install path/to/app.apk

# Desinstalar app
adb uninstall com.complicesconecta.app

# Ver logs
adb logcat

# Ver logs filtrados
adb logcat | grep "ComplicesConecta"

# Limpiar logs
adb logcat -c

# Screenshot del dispositivo
adb shell screencap /sdcard/screen.png
adb pull /sdcard/screen.png

# Grabar pantalla (testing protección)
adb shell screenrecord /sdcard/demo.mp4
adb pull /sdcard/demo.mp4
```

---

## ✅ CHECKLIST FINAL ANDROID

### **Pre-Build:**
```
[ ] npm run build exitoso
[ ] npx cap sync android sin errores
[ ] Versión actualizada (3.6.6)
[ ] Plugin ContentProtection creado
[ ] Manifest actualizado
[ ] ProGuard configurado
```

### **Build:**
```
[ ] Debug APK generado
[ ] Release APK firmado
[ ] APK instalado en dispositivo
[ ] App inicia sin crashes
```

### **Testing:**
```
[ ] Protección screenshot funciona
[ ] Protección grabación funciona
[ ] Features principales funcionan
[ ] Performance aceptable
[ ] No memory leaks
```

### **Release:**
```
[ ] Keystore respaldado en lugar seguro
[ ] APK firmado con certificado release
[ ] ProGuard habilitado
[ ] Versión incrementada
[ ] Changelog actualizado
```

---

## 🎯 PRÓXIMOS PASOS

```
1. [ ] Crear plugin ContentProtection (30 min)
2. [ ] Sync y build debug (15 min)
3. [ ] Testing en dispositivo (30 min)
4. [ ] Configurar keystore release (15 min)
5. [ ] Build APK firmado (10 min)
6. [ ] Testing final (20 min)
7. [ ] (Opcional) Subir a Google Play

Total: ~2 horas
```

---

## 📞 RECURSOS

**Documentación:**
- Capacitor: https://capacitorjs.com/docs
- Android Developers: https://developer.android.com
- Google Play Console: https://play.google.com/console

**Soporte:**
- Capacitor Discord: https://discord.gg/UPYYRhtyzp
- Stack Overflow: android + capacitor tags

---

**Última Actualización:** 19 Nov 2025, 23:55 PM  
**Versión Documento:** 1.0  
**Estado:** ✅ READY TO BUILD

---

**Fin de Guía Android Completa**
