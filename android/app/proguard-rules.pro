# =====================================================
# PROGUARD RULES - COMPLICES CONECTA
# =====================================================
# Protección de código y ofuscación
# Versión: v3.6.6
# Fecha: 19 Nov 2025
# =====================================================

# ===== PROTECCIÓN DE CONTENIDO (LEY OLIMPIA) =====
# Mantener clases de protección de contenido
-keep class com.complicesconecta.app.ContentProtectionPlugin { *; }
-keep class com.complicesconecta.app.MainActivity { *; }

# ===== CAPACITOR =====
# Mantener todas las clases de Capacitor
-keep public class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Mantener plugins de Capacitor
-keep class * extends com.getcapacitor.Plugin { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# ===== JAVASCRIPT INTERFACES =====
# Mantener interfaces JavaScript para WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===== ANNOTATIONS =====
# Mantener anotaciones para debugging
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes Exceptions

# ===== PROTECCIÓN CONTRA INGENIERÍA INVERSA =====
# Mantener información de excepciones
-keep public class * extends java.lang.Exception

# Ofuscar nombres de paquetes
-repackageclasses ''
-allowaccessmodification

# ===== SUPABASE =====
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# ===== ANDROIDX =====
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**

# ===== KOTLINX =====
-keep class kotlinx.** { *; }
-dontwarn kotlinx.**

# ===== GSON / JSON =====
-keep class com.google.gson.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ===== OKHTTP / RETROFIT =====
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }
-dontwarn okhttp3.**
-dontwarn retrofit2.**

# ===== SECURITY =====
# No exponer información sensible en logs
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# ===== PERFORMANCE =====
# Optimizar código
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# ===== DEBUGGING (SOLO PRODUCCIÓN) =====
# Renombrar archivo fuente para ofuscar
-renamesourcefileattribute SourceFile
