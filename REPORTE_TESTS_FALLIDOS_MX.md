# 🔍 Reporte Detallado de Tests Fallidos

**Generado:** 27/9/2025, 2:33:26 a.m.
**Duración del análisis:** 8 segundos
**Sistema:** Node.js en Windows
**Comando ejecutado:** `npx vitest run --reporter=verbose --no-coverage`

## 📋 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Archivos de test con fallos | 0 |
| Total de errores capturados | 0 |
| Patrones de error identificados | 0 |
| Código de salida | 1 |

## 📝 Salida Completa del Comando

### Errores del Sistema (stderr)

```
[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2msendInvitation[2m > [22m[2mshould send a gallery invitation successfully
[22m[39m[ERROR] ❌ Error en sendInvitation: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2msendInvitation[2m > [22m[2mshould send a chat invitation successfully
[22m[39m[ERROR] ❌ Error en sendInvitation: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mrespondInvitation[2m > [22m[2mshould accept an invitation successfully
[22m[39m[ERROR] ❌ Error en sendInvitation: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/PerformanceMonitoringService.test.ts[2m > [22m[2mPerformanceMonitoringService[2m > [22m[2mrecordMetric[2m > [22m[2mshould handle metric recording errors
[22m[39m[ERROR] Error registrando métrica: {
  "error": "Test error",
  "type": "response_time",
  "value": 150
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mrespondInvitation[2m > [22m[2mshould accept an invitation successfully
[22m[39m[ERROR] ❌ Error en acceptInvitation: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mrespondInvitation[2m > [22m[2mshould reject an invitation successfully
[22m[39m[ERROR] ❌ Error en sendInvitation: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mrespondInvitation[2m > [22m[2mshould reject an invitation successfully
[22m[39m[ERROR] ❌ Error en declineInvitation: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mhasGalleryAccess[2m > [22m[2mshould return false when no access granted
[22m[39m[ERROR] ❌ Error en hasGalleryAccess: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mhasGalleryAccess[2m > [22m[2mshould return true after accepting gallery invitation
[22m[39m[ERROR] ❌ Error en hasGalleryAccess: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mhasChatAccess[2m > [22m[2mshould return false when no access granted
[22m[39m[ERROR] ❌ Error en hasChatAccess: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mhasChatAccess[2m > [22m[2mshould return true after accepting chat invitation
[22m[39m[ERROR] ❌ Error en sendInvitation: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mhasChatAccess[2m > [22m[2mshould return true after accepting chat invitation
[22m[39m[ERROR] ❌ Error en acceptInvitation: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mhasChatAccess[2m > [22m[2mshould return true after accepting chat invitation
[22m[39m[WARN] ⚠️ UUIDs inválidos para hasChatAccess, usando fallback: {
  "user1": "user2",
  "user2": "user1"
}

[90mstderr[2m | src/tests/unit/PerformanceMonitoringService.test.ts[2m > [22m[2mPerformanceMonitoringService[2m > [22m[2mmonitoring[2m > [22m[2mshould not start monitoring if already active
[22m[39m[WARN] El monitoreo ya está activo 

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mgetInvitations[2m > [22m[2mshould return empty arrays for new user
[22m[39m[ERROR] ❌ Error en getInvitations: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mgetInvitations[2m > [22m[2mshould return received invitations
[22m[39m[ERROR] ❌ Error en getInvitations: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/invitations.test.ts[2m > [22m[2mInvitations System[2m > [22m[2mgetInvitations[2m > [22m[2mshould return sent invitations
[22m[39m[ERROR] ❌ Error en getInvitations: {
  "error": "Mock Supabase error"
}

[90mstderr[2m | src/tests/unit/emailService.test.ts[2m > [22m[2mEmailService - Variables de Entorno[2m > [22m[2mdebe manejar errores de Edge Function correctamente
[22m[39m[ERROR] ❌ Error HTTP en send-email: 500 
[ERROR] ❌ Error enviando email con template confirmation: {
  "error": {}
}

[90mstderr[2m | src/tests/unit/ProfileReportsPanel.test.tsx[2m > [22m[2mProfileReportsPanel[2m > [22m[2mdebería mostrar spinner de carga inicialmente
[22m[39mWarning: An update to ProfileReportsPan
```

### Salida Principal (stdout - últimos 15,000 caracteres)

```

[1m[46m RUN [49m[22m [36mv3.2.4 [39m[90mC:/Users/conej/Documents/conecta-social-comunidad-main[39m

 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mValidación de roles de administrador[2m > [22mdebería identificar correctamente un perfil de administrador[32m 3[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mValidación de roles de administrador[2m > [22mdebería rechazar perfiles no administradores[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mValidación de roles de administrador[2m > [22mdebe validar rol demo correctamente[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mPermisos por Rol[2m > [22mdebe permitir acciones de admin[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mPermisos por Rol[2m > [22mdebe permitir acciones de usuario regular[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mPermisos por Rol[2m > [22mdebe limitar acciones de usuario demo[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mPermisos por Rol[2m > [22mdebe denegar acciones no autorizadas[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mGestión de Roles[2m > [22mdebe crear perfil con rol por defecto[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mGestión de Roles[2m > [22mdebe actualizar rol de usuario[32m 2[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mGestión de Roles[2m > [22mdebe validar emails de admin en producción[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mSeparación Demo/Producción[2m > [22mdebe identificar perfiles demo por email[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mSeparación Demo/Producción[2m > [22mdebe aislar datos demo de producción[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mValidación de Integridad[2m > [22mdebe validar consistencia de roles[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/roles.test.ts[2m > [22mRoles y Permisos[2m > [22mValidación de Integridad[2m > [22mdebe validar estructura de enum roles[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/useToast.test.ts[2m > [22museToast Hook[2m > [22mshould call toast function with correct parameters[32m 20[2mms[22m[39m
 [32m✓[39m src/tests/unit/useToast.test.ts[2m > [22museToast Hook[2m > [22mshould handle success toast[32m 3[2mms[22m[39m
 [32m✓[39m src/tests/unit/useToast.test.ts[2m > [22museToast Hook[2m > [22mshould handle error toast[32m 2[2mms[22m[39m
 [32m✓[39m src/tests/unit/useToast.test.ts[2m > [22museToast Hook[2m > [22mshould call dismiss function[32m 2[2mms[22m[39m
 [32m✓[39m src/tests/unit/TokenAnalyticsService.test.ts[2m > [22mTokenAnalyticsService[2m > [22mgetInstance[2m > [22mshould return singleton instance[32m 3[2mms[22m[39m
 [32m✓[39m src/tests/unit/TokenAnalyticsService.test.ts[2m > [22mTokenAnalyticsService[2m > [22mgenerateCurrentMetrics[2m > [22mshould generate current token metrics[32m 4[2mms[22m[39m
 [32m✓[39m src/tests/unit/TokenAnalyticsService.test.ts[2m > [22mTokenAnalyticsService[2m > [22msaveAnalytics[2m > [22mshould save analytics for a period[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/TokenAnalyticsService.test.ts[2m > [22mTokenAnalyticsService[2m > [22mgetHistoricalAnalytics[2m > [22mshould get historical analytics[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/TokenAnalyticsService.test.ts[2m > [22mTokenAnalyticsService[2m > [22mgenerateAutomaticReport[2m > [22mshould generate automatic report[32m 2[2mms[22m[39m
 [32m✓[39m src/tests/unit/TokenAnalyticsService.test.ts[2m > [22mTokenAnalyticsService[2m > [22mgenerateAutomaticReport[2m > [22mshould not generate report if already generating[32m 2[2mms[22m[39m
 [32m✓[39m src/tests/unit/TokenAnalyticsService.test.ts[2m > [22mTokenAnalyticsService[2m > [22mautomatic analytics[2m > [22mshould start and stop automatic analytics[32m 2[2mms[22m[39m
[90mstdout[2m | src/tests/unit/localStorage-migration.test.ts
[22m[39m[INFO] 🔧 Configuración de aplicación: {
  "mode": "production",
  "supabaseUrl": "✅ Configurada",
  "supabaseKey": "✅ Configurada"
}
[INFO] 🚀 ComplicesConecta iniciado {
  "modo": "production"
}
[INFO] 🔐 Modo producción activo - autenticación real requerida 
[INFO] 🏢 Credenciales producción: {
  "email": "complicesconectasw@outlook.es"
}

[90mstdout[2m | src/tests/unit/PerformanceMonitoringService.test.ts[2m > [22m[2mPerformanceMonitoringService[2m > [22m[2mrecordMetric[2m > [22m[2mshould record a metric successfully
[22m[39m[DEBUG] Métrica registrada exitosamente: {
  "type": "response_time",
  "value": 150,
  "unit": "ms"
}

[90mstdout[2m | src/tests/unit/PerformanceMonitoringService.test.ts[2m > [22m[2mPerformanceMonitoringService[2m > [22m[2mcollectCurrentMetrics[2m > [22m[2mshould collect current system metrics
[22m[39m[DEBUG] Métricas recolectadas: {
  "metrics": {
    "responseTime": 248.2560357413288,
    "queryCount": 15,
    "errorRate": 4.676035715065057,
    "activeUsers": 0,
    "tokenTransactions": 0,
    "reportActivity": 0,
    "memoryUsage": 59672039.472723834,
    "cpuUsage": 41.46134991009447
  },
  "collectionTime": "1.409400000000005ms"
}

[90mstdout[2m | src/tests/unit/localStorage-migration.test.ts[2m > [22m[2mlocalStorage Migration Tests[2m > [22m[2mConfiguración de modo de aplicación[2m > [22m[2mdebe determinar correctamente el uso de Supabase real
[22m[39m[INFO] 🔍 shouldUseRealSupabase {
  "modo": "production",
  "demoAuth": null
}
[INFO] 🏢 Modo producción - usando Supabase real siempre 
[INFO] 🔍 shouldUseRealSupabase {
  "modo": "production",
  "demoAuth": null
}
[INFO] 🏢 Modo producción - usando Supabase real siempre 

[90mstdout[2m | src/tests/unit/localStorage-migration.test.ts[2m > [22m[2mlocalStorage Migration Tests[2m > [22m[2mManejo de sesiones demo[2m > [22m[2mdebe crear sesión demo sin almacenar datos sensibles
[22m[39m[INFO] ❌ Email no es credencial demo: {
  "email": "demo@example.com"
}

[90mstdout[2m | src/tests/unit/localStorage-migration.test.ts[2m > [22m[2mlocalStorage Migration Tests[2m > [22m[2mManejo de sesiones demo[2m > [22m[2mdebe limpiar correctamente sesiones demo
[22m[39m[INFO] 🧹 Sesión demo limpiada 

[90mstdout[2m | src/tests/unit/localStorage-migration.test.ts[2m > [22m[2mlocalStorage Migration Tests[2m > [22m[2mCompatibilidad hacia atrás[2m > [22m[2mdebe manejar datos legacy sin romper la aplicación
[22m[39m[INFO] 🔍 shouldUseRealSupabase {
  "modo": "production",
  "demoAuth": null
}
[INFO] 🏢 Modo producción - usando Supabase real siempre 

[90mstdout[2m | src/tests/unit/ProfileReportService.test.ts[2m > [22m[2mProfileReportService[2m > [22m[2mcreateProfileReport[2m > [22m[2mdebería crear un reporte exitosamente
[22m[39m
🧪 [TEST START] ProfileReportService - createProfileReport success

[90mstdout[2m | src/tests/unit/ProfileReportService.test.ts[2m > [22m[2mProfileReportService[2m > [22m[2mcreateProfileReport[2m > [22m[2mdebería crear un reporte exitosamente
[22m[39m
🗄️ [SUPABASE MOCK] insert on profile_reports
📝 Data: {
  "reportedUserId": "reported-user-123",
  "reason": "harassment",
  "description": "Test description"
}

[90mstdout[2m | src/tests/unit/ProfileReportService.test.ts[2m > [22m[2mProfileReportService[2m > [22m[2mcreateProfileReport[2m > [22m[2mdebería crear un reporte exitosamente
[22m[39m
✅ [TEST END] ProfileReportService - createProfileReport success
📊 Result: {
  "success": true,
  "data": {
    "id": "report-123"
  }
}

[90mstdout[2m | src/tests/unit/PushNotificationService.test.ts[2m > [22m[2mPushNotificationService[2m > [22m[2mregisterDeviceToken[2m > [22m[2mshould register device token successfully
[22m[39m
🧪 [TEST START] PushNotificationService - registerDeviceToken

[90mstdout[2m | src/tests/unit/PushNotificationService.test.ts[2m > [22m[2mPushNotificationService[2m > [22m[2mregisterDeviceToken[2m > [22m[2mshould register device token successfully
[22m[39m
✅ [TEST END] PushNotificationService - registerDeviceToken
📊 Result: {
  "success": true,
  "token": {
    "id": "1",
    "token": "device_token_123"
  }
}

[90mstdout[2m | src/tests/unit/localStorage-migration.test.ts[2m > [22m[2mlocalStorage Migration Tests[2m > [22m[2mCompatibilidad hacia atrás[2m > [22m[2mdebe migrar gradualmente sin pérdida de funcionalidad
[22m[39m[INFO] 🔍 shouldUseRealSupabase {
  "modo": "production",
  "demoAuth": null
}
[INFO] 🏢 Modo producción - usando Supabase real siempre 

 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mcreateReport[2m > [22mdebería crear un reporte exitosamente[32m 3[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mcreateReport[2m > [22mdebería fallar si el usuario no está autenticado[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mcreateReport[2m > [22mdebería fallar si el usuario intenta reportarse a sí mismo[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mgetUserReports[2m > [22mdebería obtener reportes del usuario[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mgetPendingReports[2m > [22mdebería obtener reportes pendientes[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mresolveReport[2m > [22mdebería resolver un reporte exitosamente[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mgetUserReportStats[2m > [22mdebería obtener estadísticas de reportes del usuario[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mgetReportNotifications[2m > [22mdebería obtener notificaciones de reportes[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22misContentBlocked[2m > [22mdebería verificar si el contenido está bloqueado[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/ReportService.test.ts[2m > [22mReportService[2m > [22mgetReportStatistics[2m > [22mdebería obtener estadísticas generales de reportes[32m 1[2mms[22m[39m
[90mstdout[2m | src/tests/unit/PerformanceMonitoringService.test.ts[2m > [22m[2mPerformanceMonitoringService[2m > [22m[2mmonitoring[2m > [22m[2mshould start and stop monitoring
[22m[39m[INFO] Iniciando monitoreo de performance {
  "intervalMinutes": 1
}
[INFO] Monitoreo de performance detenido 

[90mstdout[2m | src/tests/unit/PerformanceMonitoringService.test.ts[2m > [22m[2mPerformanceMonitoringService[2m > [22m[2mmonitoring[2m > [22m[2mshould not start monitoring if already active
[22m[39m[INFO] Iniciando monitoreo de performance {
  "intervalMinutes": 1
}
[INFO] Monitoreo de performance detenido 

 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mMigración de datos de perfil[2m > [22mNO debe almacenar datos completos de perfil en localStorage[32m 2[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mMigración de datos de perfil[2m > [22mDEBE mantener solo flags de sesión mínimos[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mMigración de datos de perfil[2m > [22mcheckDemoSession debe retornar null para forzar recreación[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mAutenticación de usuario especial (Apoyo)[2m > [22mdebe mantener solo flag de autenticación para usuario Apoyo[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mAutenticación de usuario especial (Apoyo)[2m > [22mdebe limpiar datos obsoletos de usuario Apoyo[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mConfiguración de modo de aplicación[2m > [22mdebe determinar correctamente el uso de Supabase real[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mConfiguración de modo de aplicación[2m > [22mdebe identificar correctamente admins de producción[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mManejo de sesiones demo[2m > [22mdebe crear sesión demo sin almacenar datos sensibles[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mManejo de sesiones demo[2m > [22mdebe limpiar correctamente sesiones demo[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mCompatibilidad hacia atrás[2m > [22mdebe manejar datos legacy sin romper la aplicación[32m 3[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mCompatibilidad hacia atrás[2m > [22mdebe migrar gradualmente sin pérdida de funcionalidad[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mSeguridad de datos[2m > [22mNO debe exponer datos sensibles en localStorage[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mSeguridad de datos[2m > [22mdebe validar integridad de flags de sesión[32m 0[2mms[22m[39m
 [32m✓[39m src/tests/unit/localStorage-migration.test.ts[2m > [22mlocalStorage Migration Tests[2m > [22mPerformance y cache[2m > [22mdebe evitar almacenamiento excesivo en localStorage[32m 1[2mms[22m[39m
 [32m✓[39m src/tests/unit/PerformanceMonitoringService.test.ts[2m > [22mPerformanceMonitoringService[2m > [22mgetInstance[2m > [22mshould return singleton instance[32m 2[2mms[22m[39m
 [32m✓[39m src/tests/unit/Performanc
```

## 🎯 Plan de Acción Recomendado

### Prioridad Alta 🔥

1. **Corregir mocks de Supabase**
   - Implementar métodos faltantes (.from(), .select(), .eq(), .single())
   - Asegurar que las cadenas de métodos funcionen correctamente
   - Verificar que los mocks devuelvan datos con estructura esperada

2. **Envolver actualizaciones de estado en act()**
   - Identificar componentes que actualizan estado durante tests
   - Envolver renders y eventos en act(() => { ... })
   - Usar waitFor() para operaciones asíncronas

### Prioridad Media 📋

3. **Verificar elementos DOM en tests**
   - Confirmar que los textos y elementos esperados se rendericen
   - Ajustar selectores de elementos si es necesario
   - Considerar usar data-testid para elementos específicos

4. **Optimizar timeouts de tests**
   - Reducir tiempo de resolución en mocks
   - Simplificar lógica asíncrona innecesaria
   - Aumentar timeout solo si es absolutamente necesario

## 🛠️ Comandos Útiles para Depuración

### Ejecutar test específico
```bash
npx vitest run src/tests/unit/[nombre-test].test.ts --reporter=verbose
```

### Ejecutar test en modo watch
```bash
npx vitest src/tests/unit/[nombre-test].test.ts
```

### Ejecutar todos los tests
```bash
npm test
```

### Re-ejecutar este análisis
```bash
node scripts/depurador-tests-mx.cjs
```


---
*Reporte generado automáticamente por DepuradorTestsMX*
*Fecha: 2025-09-27T08:33:26.054Z*
*Duración: 8 segundos*
