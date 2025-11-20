package com.complicesconecta.app;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

/**
 * =====================================================
 * MAIN ACTIVITY - COMPLICES CONECTA
 * =====================================================
 * Activity principal con protección Ley Olimpia activada
 * Fecha: 19 Nov 2025
 * Versión: v3.6.6
 * =====================================================
 */

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Registrar plugin de protección de contenido
        registerPlugin(ContentProtectionPlugin.class);
        
        // Habilitar FLAG_SECURE automáticamente (Ley Olimpia)
        // Previene screenshots y grabación de pantalla
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
