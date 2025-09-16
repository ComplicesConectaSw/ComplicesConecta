package com.complicesconecta.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Habilitar WebView debugging
        WebView.setWebContentsDebuggingEnabled(true);
        
        // Configuración WebView para evitar pantalla en blanco
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().getSettings().setJavaScriptEnabled(true);
            getBridge().getWebView().getSettings().setDomStorageEnabled(true);
            getBridge().getWebView().getSettings().setAllowFileAccess(true);
            getBridge().getWebView().getSettings().setAllowContentAccess(true);
        }
    }
}
