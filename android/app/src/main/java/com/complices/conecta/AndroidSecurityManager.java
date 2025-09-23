package com.complices.conecta;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Debug;
import android.provider.Settings;
import android.view.WindowManager;
import java.io.File;

/**
 * Gestor de seguridad avanzada para Android APK
 * Implementa protección anti-root, anti-developer y bloqueo de screenshots
 */
public class AndroidSecurityManager {
    
    private static AndroidSecurityManager instance;
    private final Context context;
    private static final String PREFS_NAME = "security_prefs";
    private static final String KEY_ROOT_DETECTED = "root_detected";
    private static final String KEY_DEBUG_DETECTED = "debug_detected";
    
    // Apps conocidas de grabación de pantalla
    private static final String[] SCREEN_RECORDER_APPS = {
        "com.mobizen.mirroring.uimode",
        "com.kimcy929.screenrecorder",
        "com.hecorat.screenrecorder.free",
        "com.nll.screenrecorder",
        "com.icecoldapps.screenrecorder",
        "com.orpheusdroid.screenrecorder",
        "com.kimcy929.screenrecorder",
        "com.capture.screenshot",
        "com.androidfung.dumpster",
        "com.duapps.recorder",
        "com.mobizen.mirroring"
    };
    
    // Archivos y directorios que indican root
    private static final String[] ROOT_INDICATORS = {
        "/system/app/Superuser.apk",
        "/sbin/su",
        "/system/bin/su",
        "/system/xbin/su",
        "/data/local/xbin/su",
        "/data/local/bin/su",
        "/system/sd/xbin/su",
        "/system/bin/failsafe/su",
        "/data/local/su",
        "/su/bin/su",
        "/system/xbin/busybox",
        "/system/bin/busybox",
        "/data/local/xbin/busybox",
        "/data/local/bin/busybox",
        "/system/xbin/daemonsu",
        "/system/etc/init.d/99SuperSUDaemon",
        "/dev/com.koushikdutta.superuser.daemon/"
    };
    
    private AndroidSecurityManager(Context context) {
        this.context = context.getApplicationContext();
    }
    
    public static synchronized AndroidSecurityManager getInstance(Context context) {
        if (instance == null) {
            instance = new AndroidSecurityManager(context);
        }
        return instance;
    }
    
    /**
     * Aplica todas las medidas de seguridad disponibles
     */
    public SecurityResult applySecurityMeasures(Activity activity) {
        SecurityResult result = new SecurityResult();
        
        // Verificar root
        if (isDeviceRooted()) {
            result.rootDetected = true;
            result.threats.add("Dispositivo rooteado detectado");
            saveSecurityEvent(KEY_ROOT_DETECTED, true);
        }
        
        // Verificar modo desarrollador
        if (isDeveloperModeEnabled()) {
            result.developerModeDetected = true;
            result.threats.add("Modo desarrollador activado");
            saveSecurityEvent(KEY_DEBUG_DETECTED, true);
        }
        
        // Verificar depuración
        if (isDebuggingEnabled()) {
            result.debuggingDetected = true;
            result.threats.add("Depuración USB habilitada");
        }
        
        // Verificar apps de grabación
        if (isScreenRecordingDetected()) {
            result.screenRecordingDetected = true;
            result.threats.add("Aplicación de grabación de pantalla detectada");
        }
        
        // Aplicar bloqueo de screenshots si no hay amenazas críticas
        if (!result.hasHighRiskThreats()) {
            enableScreenshotBlocking(activity);
            result.screenshotBlocked = true;
        }
        
        return result;
    }
    
    /**
     * Detecta si el dispositivo está rooteado
     */
    public boolean isDeviceRooted() {
        return checkRootMethod1() || checkRootMethod2() || checkRootMethod3();
    }
    
    /**
     * Método 1: Verificar archivos de root comunes
     */
    private boolean checkRootMethod1() {
        for (String path : ROOT_INDICATORS) {
            if (new File(path).exists()) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Método 2: Verificar apps de root instaladas
     */
    private boolean checkRootMethod2() {
        String[] rootApps = {
            "com.noshufou.android.su",
            "com.noshufou.android.su.elite",
            "eu.chainfire.supersu",
            "com.koushikdutta.superuser",
            "com.thirdparty.superuser",
            "com.yellowes.su",
            "com.koushikdutta.rommanager",
            "com.koushikdutta.rommanager.license",
            "com.dimonvideo.luckypatcher",
            "com.chelpus.lackypatch",
            "com.ramdroid.appquarantine",
            "com.ramdroid.appquarantinepro"
        };
        
        PackageManager pm = context.getPackageManager();
        for (String app : rootApps) {
            try {
                pm.getPackageInfo(app, 0);
                return true; // App encontrada
            } catch (PackageManager.NameNotFoundException e) {
                // App no encontrada, continuar
            }
        }
        return false;
    }
    
    /**
     * Método 3: Verificar propiedades del sistema
     */
    private boolean checkRootMethod3() {
        String buildTags = Build.TAGS;
        return buildTags != null && buildTags.contains("test-keys");
    }
    
    /**
     * Detecta si el modo desarrollador está habilitado
     */
    public boolean isDeveloperModeEnabled() {
        return Settings.Secure.getInt(
            context.getContentResolver(),
            Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0
        ) != 0;
    }
    
    /**
     * Detecta si la depuración USB está habilitada
     */
    public boolean isDebuggingEnabled() {
        return Settings.Secure.getInt(
            context.getContentResolver(),
            Settings.Global.ADB_ENABLED, 0
        ) != 0;
    }
    
    /**
     * Detecta si hay un debugger conectado
     */
    public boolean isDebuggerConnected() {
        return Debug.isDebuggerConnected() || Debug.waitingForDebugger();
    }
    
    /**
     * Detecta si la app está siendo ejecutada en un emulador
     */
    public boolean isEmulator() {
        return Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || "google_sdk".equals(Build.PRODUCT);
    }
    
    /**
     * Detecta aplicaciones de grabación de pantalla
     */
    public boolean isScreenRecordingDetected() {
        PackageManager pm = context.getPackageManager();
        for (String app : SCREEN_RECORDER_APPS) {
            try {
                ApplicationInfo appInfo = pm.getApplicationInfo(app, 0);
                if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                    // Es una app de terceros instalada
                    return true;
                }
            } catch (PackageManager.NameNotFoundException e) {
                // App no encontrada, continuar
            }
        }
        return false;
    }
    
    /**
     * Habilita el bloqueo de screenshots
     */
    public void enableScreenshotBlocking(Activity activity) {
        if (activity != null) {
            activity.getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            );
        }
    }
    
    /**
     * Deshabilita el bloqueo de screenshots
     */
    public void disableScreenshotBlocking(Activity activity) {
        if (activity != null) {
            activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
        }
    }
    
    /**
     * Obtiene el nivel de riesgo de seguridad
     */
    public SecurityLevel getSecurityLevel() {
        int riskScore = 0;
        
        if (isDeviceRooted()) riskScore += 40;
        if (isDeveloperModeEnabled()) riskScore += 20;
        if (isDebuggingEnabled()) riskScore += 15;
        if (isDebuggerConnected()) riskScore += 25;
        if (isEmulator()) riskScore += 30;
        if (isScreenRecordingDetected()) riskScore += 10;
        
        if (riskScore >= 60) return SecurityLevel.HIGH_RISK;
        if (riskScore >= 30) return SecurityLevel.MEDIUM_RISK;
        if (riskScore >= 10) return SecurityLevel.LOW_RISK;
        return SecurityLevel.SECURE;
    }
    
    /**
     * Guarda eventos de seguridad
     */
    private void saveSecurityEvent(String key, boolean detected) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
             .putBoolean(key, detected)
             .putLong(key + "_timestamp", System.currentTimeMillis())
             .apply();
    }
    
    /**
     * Obtiene el historial de eventos de seguridad
     */
    public SecurityHistory getSecurityHistory() {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        SecurityHistory history = new SecurityHistory();
        history.rootDetected = prefs.getBoolean(KEY_ROOT_DETECTED, false);
        history.rootDetectedAt = prefs.getLong(KEY_ROOT_DETECTED + "_timestamp", 0);
        history.debugDetected = prefs.getBoolean(KEY_DEBUG_DETECTED, false);
        history.debugDetectedAt = prefs.getLong(KEY_DEBUG_DETECTED + "_timestamp", 0);
        
        return history;
    }
    
    /**
     * Clase para resultado de verificación de seguridad
     */
    public static class SecurityResult {
        public boolean rootDetected = false;
        public boolean developerModeDetected = false;
        public boolean debuggingDetected = false;
        public boolean screenRecordingDetected = false;
        public boolean screenshotBlocked = false;
        public java.util.List<String> threats = new java.util.ArrayList<>();
        
        public boolean hasHighRiskThreats() {
            return rootDetected || debuggingDetected;
        }
        
        public boolean hasAnyThreats() {
            return !threats.isEmpty();
        }
        
        public String getThreatsDescription() {
            return String.join(", ", threats);
        }
    }
    
    /**
     * Niveles de seguridad
     */
    public enum SecurityLevel {
        SECURE("Seguro"),
        LOW_RISK("Riesgo Bajo"),
        MEDIUM_RISK("Riesgo Medio"),
        HIGH_RISK("Riesgo Alto");
        
        private final String description;
        
        SecurityLevel(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    /**
     * Historial de eventos de seguridad
     */
    public static class SecurityHistory {
        public boolean rootDetected;
        public long rootDetectedAt;
        public boolean debugDetected;
        public long debugDetectedAt;
    }
}
