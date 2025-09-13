# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ===== OPTIMIZACIONES PARA COMPONENTES ANIMADOS v2.4.0 =====

# Mantener clases de Framer Motion para animaciones
-keep class com.framer.motion.** { *; }
-keep class * extends com.framer.motion.** { *; }

# Preservar métodos de animación y transición
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Optimizaciones para WebView y componentes React
-keep class * extends android.webkit.WebViewClient { *; }
-keep class * extends android.webkit.WebChromeClient { *; }

# Mantener interfaces JavaScript para componentes móviles
-keepclassmembers class * {
    public *;
}

# Preservar anotaciones para debugging de animaciones
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Optimización para touch events y gestos
-keep class android.view.** { *; }
-keep class android.webkit.** { *; }

# Mantener clases de Capacitor para plugins móviles
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
