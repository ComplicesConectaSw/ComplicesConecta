[33mcommit 6c2627ab7a596a49138a428f28ed005f42fc9d30[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmaster[m[33m)[m
Author: ComplicesConectaSw <ComplicesConectaSw@outlook.es>
Date:   Sun Nov 9 00:06:19 2025 -0600

    fix: Eliminar directivas eslint-disable-next-line no-console innecesarias en showEnvInfo.ts v3.6.3
    
    - Eliminadas 8 directivas innecesarias (líneas 92, 96, 112, 116, 145, 147, 149, 151)
    - ESLint no reporta problemas de no-console en estas líneas
    - Estado: 0 errores ESLint, 0 warnings

[1mdiff --git a/src/utils/showEnvInfo.ts b/src/utils/showEnvInfo.ts[m
[1mindex 52ac6df..16c9e16 100644[m
[1m--- a/src/utils/showEnvInfo.ts[m
[1m+++ b/src/utils/showEnvInfo.ts[m
[36m@@ -89,11 +89,9 @@[m [mif (typeof window !== 'undefined') {[m
         value: (key: string) => {[m
           const value = import.meta.env[key];[m
           if (value) {[m
[31m-            // eslint-disable-next-line no-console[m
             console.log(`🔐 ${key}:`, value);[m
             return value;[m
           } else {[m
[31m-            // eslint-disable-next-line no-console[m
             console.warn(`⚠️ Variable ${key} no encontrada`);[m
             return null;[m
           }[m
[36m@@ -109,11 +107,9 @@[m [mif (typeof window !== 'undefined') {[m
       (window as unknown as Record<string, unknown>).getPassword = (key: string) => {[m
         const value = import.meta.env[key];[m
         if (value) {[m
[31m-          // eslint-disable-next-line no-console[m
           console.log(`🔐 ${key}:`, value);[m
           return value;[m
         } else {[m
[31m-          // eslint-disable-next-line no-console[m
           console.warn(`⚠️ Variable ${key} no encontrada`);[m
           return null;[m
         }[m
[36m@@ -142,13 +138,9 @@[m [mif (typeof window !== 'undefined') {[m
   if (import.meta.env.DEV) {[m
     setTimeout(() => {[m
       if ((window as unknown as Record<string, unknown>).showEnvInfo) {[m
[31m-        // eslint-disable-next-line no-console[m
         console.log('✅ Utilidad de variables de entorno cargada');[m
[31m-        // eslint-disable-next-line no-console[m
         console.log('💡 Usa showEnvInfo() en la consola para ver información');[m
[31m-        // eslint-disable-next-line no-console[m
         console.log('💡 Usa window.env para acceder a todas las variables');[m
[31m-        // eslint-disable-next-line no-console[m
         console.log('💡 Usa getPassword("VITE_XXX") para ver una contraseña específica');[m
       }[m
     }, 100);[m
