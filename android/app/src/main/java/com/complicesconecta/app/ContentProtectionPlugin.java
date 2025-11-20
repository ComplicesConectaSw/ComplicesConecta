package com.complicesconecta.app;

import android.view.WindowManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

/**
 * =====================================================
 * CONTENT PROTECTION PLUGIN - LEY OLIMPIA COMPLIANCE
 * =====================================================
 * Plugin nativo Android para protección de contenido
 * Cumplimiento: Ley Olimpia (México) Arts. 259 Ter/Quáter/Quinquies
 * Fecha: 19 Nov 2025
 * Versión: v3.6.6
 * =====================================================
 */

@CapacitorPlugin(name = "ContentProtection")
public class ContentProtectionPlugin extends Plugin {

    private static final String TAG = "ContentProtection";

    /**
     * Habilita protección de pantalla (anti-screenshot, anti-recording)
     */
    @PluginMethod
    public void enableScreenProtection(PluginCall call) {
        getBridge().getActivity().runOnUiThread(() -> {
            try {
                // FLAG_SECURE previene screenshots y grabación de pantalla
                getBridge().getActivity().getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_SECURE,
                    WindowManager.LayoutParams.FLAG_SECURE
                );
                
                if (call != null) {
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    ret.put("message", "Screen protection enabled");
                    call.resolve(ret);
                }
            } catch (Exception e) {
                if (call != null) {
                    call.reject("Error enabling screen protection", e);
                }
            }
        });
    }

    /**
     * Deshabilita protección de pantalla (solo para moderadores/admin)
     */
    @PluginMethod
    public void disableScreenProtection(PluginCall call) {
        getBridge().getActivity().runOnUiThread(() -> {
            try {
                getBridge().getActivity().getWindow().clearFlags(
                    WindowManager.LayoutParams.FLAG_SECURE
                );
                
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "Screen protection disabled");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Error disabling screen protection", e);
            }
        });
    }

    /**
     * Verifica si modo desarrollador está habilitado
     */
    @PluginMethod
    public void checkDeveloperMode(PluginCall call) {
        getBridge().getActivity().runOnUiThread(() -> {
            try {
                int developerMode = android.provider.Settings.Secure.getInt(
                    getBridge().getActivity().getContentResolver(),
                    android.provider.Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                    0
                );
                
                boolean isDeveloperMode = developerMode != 0;
                
                JSObject ret = new JSObject();
                ret.put("enabled", isDeveloperMode);
                ret.put("message", isDeveloperMode ? 
                    "Developer mode is enabled" : 
                    "Developer mode is disabled");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Error checking developer mode", e);
            }
        });
    }

    /**
     * Verifica estado de protección actual
     */
    @PluginMethod
    public void getProtectionStatus(PluginCall call) {
        getBridge().getActivity().runOnUiThread(() -> {
            try {
                int flags = getBridge().getActivity().getWindow().getAttributes().flags;
                boolean isProtected = (flags & WindowManager.LayoutParams.FLAG_SECURE) != 0;
                
                JSObject ret = new JSObject();
                ret.put("protected", isProtected);
                ret.put("message", isProtected ? 
                    "Screen protection is active" : 
                    "Screen protection is inactive");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Error getting protection status", e);
            }
        });
    }
}
