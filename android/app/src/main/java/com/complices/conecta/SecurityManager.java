package com.complices.conecta;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.view.WindowManager;
import androidx.annotation.NonNull;
import androidx.biometric.BiometricPrompt;
import androidx.biometric.BiometricManager;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;
import java.io.File;
import java.util.concurrent.Executor;

/**
 * Gestor de seguridad avanzada para Android APK
 * Implementa bloqueo de screenshots, grabación de pantalla y autenticación biométrica
 */
public class SecurityManager {
    
    private static SecurityManager instance;
    private Context context;
    private BiometricPrompt biometricPrompt;
    private boolean biometricEnabled = false;
    
    private SecurityManager(Context context) {
        this.context = context;
    }
    
    public static SecurityManager getInstance(Context context) {
        if (instance == null) {
            instance = new SecurityManager(context);
        }
        return instance;
    }
    
    /**
     * Activar FLAG_SECURE para bloquear screenshots y grabación de pantalla
     */
    public void enableScreenshotBlocking(Activity activity) {
        if (activity != null) {
            activity.getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            );
            
            // Log de seguridad
            android.util.Log.i("SecurityManager", "Screenshot blocking enabled for activity: " + 
                activity.getClass().getSimpleName());
        }
    }
    
    /**
     * Desactivar bloqueo de screenshots (para actividades no sensibles)
     */
    public void disableScreenshotBlocking(Activity activity) {
        if (activity != null) {
            activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            android.util.Log.i("SecurityManager", "Screenshot blocking disabled for activity: " + 
                activity.getClass().getSimpleName());
        }
    }
    
    /**
     * Verificar si la autenticación biométrica está disponible
     */
    public boolean isBiometricAvailable() {
        BiometricManager biometricManager = BiometricManager.from(context);
        
        switch (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)) {
            case BiometricManager.BIOMETRIC_SUCCESS:
                return true;
            case BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE:
                android.util.Log.w("SecurityManager", "No biometric hardware available");
                return false;
            case BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE:
                android.util.Log.w("SecurityManager", "Biometric hardware unavailable");
                return false;
            case BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED:
                android.util.Log.w("SecurityManager", "No biometric credentials enrolled");
                return false;
            default:
                return false;
        }
    }
    
    /**
     * Configurar autenticación biométrica
     */
    public void setupBiometricAuthentication(androidx.fragment.app.FragmentActivity activity, 
                                           BiometricAuthCallback callback) {
        if (!isBiometricAvailable()) {
            callback.onError("Autenticación biométrica no disponible");
            return;
        }
        
        Executor executor = ContextCompat.getMainExecutor(context);
        
        biometricPrompt = new androidx.biometric.BiometricPrompt(activity, executor, 
            new androidx.biometric.BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                    super.onAuthenticationError(errorCode, errString);
                    callback.onError("Error de autenticación: " + errString);
                }
                
                @Override
                public void onAuthenticationSucceeded(@NonNull androidx.biometric.BiometricPrompt.AuthenticationResult result) {
                    super.onAuthenticationSucceeded(result);
                    callback.onSuccess();
                }
                
                @Override
                public void onAuthenticationFailed() {
                    super.onAuthenticationFailed();
                    callback.onError("Autenticación fallida");
                }
            });
    }
    
    /**
     * Mostrar prompt de autenticación biométrica
     */
    public void showBiometricPrompt() {
        if (biometricPrompt == null) {
            android.util.Log.e("SecurityManager", "BiometricPrompt not initialized");
            return;
        }
        
        androidx.biometric.BiometricPrompt.PromptInfo promptInfo = 
            new androidx.biometric.BiometricPrompt.PromptInfo.Builder()
                .setTitle("Autenticación Biométrica")
                .setSubtitle("Usa tu huella dactilar o reconocimiento facial")
                .setDescription("Confirma tu identidad para acceder a la aplicación")
                .setNegativeButtonText("Cancelar")
                .build();
        
        biometricPrompt.authenticate(promptInfo);
    }
    
    /**
     * Detectar aplicaciones de grabación de pantalla
     */
    public boolean isScreenRecordingDetected() {
        try {
            PackageManager pm = context.getPackageManager();
            
            // Lista de aplicaciones conocidas de grabación de pantalla
            String[] screenRecorderApps = {
                "com.hecorat.screenrecorder.free",
                "com.kimcy929.screenrecorder",
                "com.nll.screenrecorder",
                "com.mobizen.mirroring.uibc.lite",
                "com.sec.android.app.capturepicture"
            };
            
            for (String packageName : screenRecorderApps) {
                try {
                    pm.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES);
                    android.util.Log.w("SecurityManager", "Screen recorder detected: " + packageName);
                    return true;
                } catch (PackageManager.NameNotFoundException e) {
                    // App no instalada, continuar
                }
            }
            
            return false;
        } catch (Exception e) {
            android.util.Log.e("SecurityManager", "Error detecting screen recording apps", e);
            return false;
        }
    }
    
    /**
     * Configurar estado de biometría desde preferencias del usuario
     */
    public void setBiometricEnabled(boolean enabled) {
        this.biometricEnabled = enabled;
        
        // Guardar en SharedPreferences
        context.getSharedPreferences("security_prefs", Context.MODE_PRIVATE)
            .edit()
            .putBoolean("biometric_enabled", enabled)
            .apply();
        
        android.util.Log.i("SecurityManager", "Biometric authentication " + 
            (enabled ? "enabled" : "disabled"));
    }
    
    /**
     * Obtener estado de biometría
     */
    public boolean isBiometricEnabled() {
        return context.getSharedPreferences("security_prefs", Context.MODE_PRIVATE)
            .getBoolean("biometric_enabled", false);
    }
    
    /**
     * Verificar si la aplicación está en modo debug
     */
    public boolean isDebuggable() {
        return (context.getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }
    
    /**
     * Aplicar todas las medidas de seguridad a una actividad
     */
    public void applySecurityMeasures(Activity activity) {
        // Bloquear screenshots en actividades sensibles
        enableScreenshotBlocking(activity);
        
        // Detectar grabación de pantalla
        if (isScreenRecordingDetected()) {
            showSecurityWarning(activity, "Se ha detectado una aplicación de grabación de pantalla");
        }
        
        // Verificar modo debug
        if (isDebuggable()) {
            android.util.Log.w("SecurityManager", "App running in debug mode - security measures may be limited");
        }
    }
    
    /**
     * Mostrar advertencia de seguridad
     */
    private void showSecurityWarning(Activity activity, String message) {
        if (activity != null) {
            new android.app.AlertDialog.Builder(activity)
                .setTitle("⚠️ Advertencia de Seguridad")
                .setMessage(message)
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setPositiveButton("Entendido", null)
                .show();
        }
    }
    
    /**
     * Interface para callbacks de autenticación biométrica
     */
    public interface BiometricAuthCallback {
        void onSuccess();
        void onError(String error);
    }
}
