
              Cómplices Conecta (Beta v3.8.16) 🚀
⚠️ NOTA DE DESARROLLO: Proyecto en Beta activa con despliegues semanales. Revisa `master` para la versión auditada más reciente.


📋 Descripción
Plataforma social AI-Native diseñada para comunidades privadas, integrando verificación de identidad, economía de tokens (Web3) y algoritmos de matching social avanzados.
🛠️ Stack Tecnológico
Frontend: React, TypeScript, Vite, TailwindCSS.
Backend: Supabase (Auth, DB, Realtime), Edge Functions.
Data Science: Neo4j (Graph DB) para conexiones sociales y recomendaciones.


AI: Integración para moderación y resúmenes de chat.
Testing: Playwright (E2E) y Jest.

## 📋 **ÍNDICE DE CONTENIDOS**

### 🚀 **Funcionalidades Principales v3.8.x**
- [🎛️ Dashboard Administrativo Enterprise](#-estado-de-auditoría-v364)
- [📊 Búsqueda Global + Neo4j Predictivo](#-ai-native-platform---production-ready-enterprise)
- [🔔 Notificaciones + ConsentGuard IA](#-ai-native-platform---production-ready-enterprise)
- [📈 Tokens CMPX/GTK + NFTs](#-ai-native-platform---production-ready-enterprise)
- [🔐 Seguridad y Consentimiento Ley Olimpia](#-ai-native-platform---production-ready-enterprise)
- [📱 Experiencia Responsive + Control Parental Glass](#-ai-native-platform---production-ready-enterprise)

### 🛠️ **Desarrollo y Arquitectura**
- [📊 Métricas del Proyecto](#-estadísticas-del-proyecto)
- [🏗️ Estructura del Monorepo](#️-estructura-del-proyecto-resumen)
- [🔧 Instalación y Configuración](#-inicio-rápido)
- [🚀 Despliegue](#-build--deployment)
- [🧪 Testing](#-testing)

### 📚 **Documentación**
- [📖 Guías de Usuario / Roles](#-navegación-rápida)
- [🔒 Seguridad y Privacidad](#-ai-native-platform---production-ready-enterprise)
- [⚖️ Aspectos Legales](#-ai-native-platform---production-ready-enterprise)
- [🤝 Contribución](./CONTRIBUTING.md)

### 🔗 **Enlaces Importantes**
- [📱 Descargar APK Android](https://github.com/ComplicesConectaSw/ComplicesConecta/releases)
- [🌐 Aplicación Web](https://complicesconecta.netlify.app)
- [📋 Notas de Lanzamiento](RELEASE_NOTES_v3.4.1.md)
- [📊 Estado del Proyecto](PROJECT_STATUS_UNIFIED.md)

---

## 🚧 Estado del Proyecto
Actualmente estoy trabajando en:
[ ] Paridad completa ProfileSingle/ProfileCouple (nuevos componentes v3.8.x).
[ ] Optimización visual Tokens Page + Matches Page.
[ ] Limpieza de código legacy previo a consolidar documentación final.
[x] Control Parental + Modal Glass aplicado en ambos perfiles.
[x] Búsqueda global real (`search_unified`) con índices `pg_trgm`.

### 📅 Bitácora 26 Nov – 29 Nov 2025
- **FloatingNav renovada**: Glassmorphism oscuro, jerarquía pública (Inicio, Explorar, NFTs, Tokens + menú "Más") y CTA único de registro.
- **Páginas informativas** (`ChatInfo.tsx` / `StoriesInfo.tsx`): tema dark + glass, CTA directo a `/auth` y storytelling IA/privacidad.
- **Búsqueda global real**: Migración `20251126_create_global_search.sql` (pg_trgm + RPC `search_unified`) integrada a `GlobalSearchService`/`VanishSearchInput`.
- **Control Parental full**: Modal glass + niveles Soft/Medium/Strict con auto-lock 5 min y PIN sincronizado en ProfileSingle/ProfileCouple.
- **UI Tokens v3.8.16**: HeaderNav minimalista, grid NFTs 2x4, modal glass con blur dinámico, animaciones globales en botones.
💡 Nota para Reclutadores / Reviewers


Este repositorio es un "laboratorio vivo" donde experimento con tecnologías complejas. La arquitectura demuestra la capacidad de integrar Grafos + SQL + Blockchain + IA en un producto funcional listo para demos con inversores.

📆 Próxima limpieza de código muerto/comentarios legacy + documentación raíz:
        
                 📅 08 de diciembre del 2025









# 🎯 ComplicesConecta - Plataforma Swinger Premium v3.7.2

<div align="center">

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Android](https://img.shields.io/badge/Android-Ready-brightgreen.svg)](android/)
[![+18](https://img.shields.io/badge/Contenido-+18-red.svg)](#aviso-legal)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](src/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen.svg)](#deployment)
[![AI Native](https://img.shields.io/badge/AI-Native-purple.svg)](#ai-native-layer)
[![Tests E2E](https://img.shields.io/badge/Tests_E2E-198_Passing-brightgreen.svg)](#testing)

### 📱 ¡Descarga la App Ahora!

<a href="https://github.com/ComplicesConectaSw/ComplicesConecta/releases/latest" target="_blank">
  <img src="https://img.shields.io/badge/📱_Descargar_APK-v3.6.6-3DDC84?style=for-the-badge&logo=android&logoColor=white&labelColor=1976D2" alt="Descargar APK" />
</a>

**SHA256:** `Verificado - Build v3.7.2 - Sistema Legal Enterprise + Protocolo de Disolución Ready`

*🔒 Aplicación segura y verificada para Android - Disponible en [GitHub Releases](https://github.com/ComplicesConectaSw/ComplicesConecta/releases/latest)*

</div>

---

## 📚 Tabla de Contenidos

1.  [**Estado de Auditoría v3.6.4**](#-estado-de-auditoría-v364)
2.  [**Índice de Documentación**](#-índice-de-documentación)
3.  [**AI-Native Platform**](#-ai-native-platform---production-ready-enterprise)
4.  [**Inicio Rápido**](#-inicio-rápido)
5.  [**Estructura del Proyecto**](#️-estructura-del-proyecto-resumen)
6.  [**Testing**](#-testing)
7.  [**Build & Deployment**](#-build--deployment)
8.  [**Estadísticas del Proyecto**](#-estadísticas-del-proyecto)
9.  [**Equipo y Contacto Legal**](#-equipo)
10. [**Licencia y Aviso Legal**](#️-licencia)

---

## 🏆 ESTADO DE AUDITORÍA v3.6.4

### 🎉 **NUEVO: Tests E2E Completos (15 Nov 2025)**
- **✅ 198 Tests E2E Funcionales** - Registro, Chat, Matches, Galerías, Tokens
- **✅ 273 Tests Unitarios** - 100% pasando
- **✅ 471 Tests Totales** - Cobertura exhaustiva
- **📚 Documentación Completa** - [TESTS_README.md](./TESTS_README.md)

## 🏆 ESTADO DE AUDITORÍA v3.6.3

### ✅ **PROYECTO 100% AUDITADO Y OPTIMIZADO**
- **📊 Análisis Completo**: [REPORTE_ANALISIS_COMPLETO_v3.6.3.md](./REPORTE_ANALISIS_COMPLETO_v3.6.3.md)
- **🎯 Auditoría Finalizada**: [AUDITORIA_FINALIZADA_v3.6.3.md](./AUDITORIA_FINALIZADA_v3.6.3.md)
- **📋 Plan de Optimización**: [PLAN_ACCION_OPTIMIZACION_v3.6.3.md](./PLAN_ACCION_OPTIMIZACION_v3.6.3.md)

### 📊 **Métricas de Calidad**
- **TypeScript**: ✅ 0 errores (100% tipado)
- **ESLint**: ✅ 0 errores críticos
- **Arquitectura**: ✅ 9/10 (Excelente)
- **Performance**: ✅ 8/10 (Optimizada)
- **Seguridad**: ✅ Validada y auditada
- **Puntuación General**: **8.5/10** 🏆

### 🔍 **Análisis Detallado**
- **Directorios analizados**: 213
- **Archivos de código**: 654
- **Líneas de código**: ~180,000
- **Estado**: **Enterprise Ready** 🚀

---

## 📚 Índice de Documentación

### 🗂️ Mapa rápido de Documentación

- **Root**
  - [README principal](./README.md)
  - [README IA](./README_IA.md)
  - [README DevOps](./README_DEVOPS.md)
  - [Notas de Lanzamiento](./RELEASE_NOTES_v3.4.1.md)
  - [Changelog](./CHANGELOG.md)
  - [Estructura del Proyecto](./project-structure-tree.md)
  - [Presentación Pública](./COMPLICESCONECTA_PRESENTACION_PUBLICA.md)
  - [Guía de Contribución](./CONTRIBUTING.md)
  - [Plataforma Swing (Resumen Estratégico)](./%23%20🎯%20ComplicesConecta%20-%20Plataforma%20Swing.md)

- **`docs/` (índice general y guías clave)**
  - [Índice general de documentación](./docs/README.md)
  - [Guía NFTs](./docs/GUIA_NFTS.md)
  - [Guía Tokens](./docs/GUIA_TOKENS.md)
  - [Staking Competitivo v3.7.0](./docs/STAKING_COMPETITIVO_v3.7.0.md)
  - [Manual Usuario v3.7.1](./docs/MANUAL_USUARIO_v3.7.1.md)
  - [Auditoría Técnica 29/11/2025](./docs/AUDITORIA29112025.md)
  - [Actualización Páginas Inversores v3.6.3](./docs/ACTUALIZACION_PAGINAS_INVERSORES_v3.6.3.md)

- **Subdirectorios `docs/`**
  - [Legal (índice)](./docs/legal/README.md)
  - [Legal Policy (índice)](./docs/legal/Legal-Policy/README.md)
  - [Inversores](./docs/Inversores/README.md)
  - [Moderadores](./docs/Moderadores/README.md)
  - [Clubs](./docs/Clubs/README.md)
  - [Strategy](./docs/strategy/README.md)

### **📋 Documentación Técnica**

- **[🔧 Guía de Instalación](./INSTALACION_SETUP_v3.5.0.md)** - Guía completa paso a paso de instalación y configuración
- **[🚀 Inicio Rápido Túnel](./QUICK_START_TUNNEL.md)** - Configuración rápida de túnel para desarrollo
- **[🏗️ Estructura del Proyecto](./project-structure-tree.md)** - Árbol detallado del monorepo
- **[📝 Notas de Lanzamiento](./RELEASE_NOTES_v3.4.1.md)** - Historial completo de versiones y cambios
- **[📋 Changelog](./CHANGELOG.md)** - Registro detallado de cambios por versión
- **[⚙️ DevOps Guide](./README_DEVOPS.md)** - Guía de operaciones y deployment
- **[🤖 IA Integration Guide](./README_IA.md)** - Estrategia de desarrollo con IA
- **[🔄 Diagramas de Flujos](./DIAGRAMAS_FLUJOS_v3.5.0.md)** - Diagramas técnicos y flujos de trabajo
- **[🤝 Guía de Contribución](./CONTRIBUTING.md)** - Cómo contribuir al proyecto
- **[📄 Presentación Pública](./COMPLICESCONECTA_PRESENTACION_PUBLICA.md)** - Presentación pública del proyecto

### **📖 Índice completo `docs/`**

#### Archivos en la raíz de `docs/`
- [ACTUALIZACION_PAGINAS_INVERSORES_v3.6.3.md](./docs/ACTUALIZACION_PAGINAS_INVERSORES_v3.6.3.md)
- [COMPONENTS.md](./docs/COMPONENTS.md)
- [GUIA_NFTS.md](./docs/GUIA_NFTS.md)
- [GUIA_TOKENS.md](./docs/GUIA_TOKENS.md)
- [INSTALACION_SETUP_v3.5.0.md](./docs/INSTALACION_SETUP_v3.5.0.md)
- [INTERESES_LIFESTYLE.md](./docs/INTERESES_LIFESTYLE.md)
- [MANUAL_USUARIO_v3.7.1.md](./docs/MANUAL_USUARIO_v3.7.1.md)
- [QUICK_START_TUNNEL.md](./docs/QUICK_START_TUNNEL.md)
- [README.md](./docs/README.md)
- [STAKING_COMPETITIVO_v3.7.0.md](./docs/STAKING_COMPETITIVO_v3.7.0.md)
- [📋 Checklist Legal para Complicie.md](./docs/%F0%9F%93%8B%20Checklist%20Legal%20para%20Complicie.md)

#### Directorio `archive/`
- [logs/VERCEL_ERRORS_NOV16.md](./docs/archive/logs/VERCEL_ERRORS_NOV16.md)
- [milestones/HITO_SABADO.md](./docs/archive/milestones/HITO_SABADO.md)
- [sessions/MEMORIA_SESION_19NOV2025.md](./docs/archive/sessions/MEMORIA_SESION_19NOV2025.md)
- [sessions/MEMORIA_SESION_21NOV2025.md](./docs/archive/sessions/MEMORIA_SESION_21NOV2025.md)

#### Directorio `audit/`
- [ANALISIS_COMPLETO.json](./docs/audit/ANALISIS_COMPLETO.json)
- [FINAL_AUDIT.json](./docs/audit/FINAL_AUDIT.json)

#### Directorio `Auditoria/`
- Archivos principales:
  - [ARCHIVOS_HUERFANOS_v3.6.3.md](./docs/Auditoria/ARCHIVOS_HUERFANOS_v3.6.3.md)
  - [AUDITORIA_COMPLETA_PROYECTO_FINAL.md](./docs/Auditoria/AUDITORIA_COMPLETA_PROYECTO_FINAL.md)
  - [AUDITORIA_NUEVA_COMPLETA_EXHAUSTIVA.md](./docs/Auditoria/AUDITORIA_NUEVA_COMPLETA_EXHAUSTIVA.md)
  - [AUDITORIA_PROFESIONAL_COMPLETA.md](./docs/Auditoria/AUDITORIA_PROFESIONAL_COMPLETA.md)
  - [AUDIT_202509.md](./docs/Auditoria/AUDIT_202509.md)
  - [LISTA_ARCHIVOS_HUERFANOS_v3.6.3.txt](./docs/Auditoria/LISTA_ARCHIVOS_HUERFANOS_v3.6.3.txt)
  - [LISTA_COMPLETA_ARCHIVOS_HUERFANOS_v3.6.3.md](./docs/Auditoria/LISTA_COMPLETA_ARCHIVOS_HUERFANOS_v3.6.3.md)
  - [PERFORMANCE_SCRIPT_MAESTRO_v3.6.3.md](./docs/Auditoria/PERFORMANCE_SCRIPT_MAESTRO_v3.6.3.md)
  - [PLAN_ACCION_AUDITORIA_v3.6.3.md](./docs/Auditoria/PLAN_ACCION_AUDITORIA_v3.6.3.md)
  - [PLAN_ACCION_CORRECCION_v3.6.3.md](./docs/Auditoria/PLAN_ACCION_CORRECCION_v3.6.3.md)
  - [README.md](./docs/Auditoria/README.md)
  - [REPORTE_CONSOLIDADO.md](./docs/Auditoria/REPORTE_CONSOLIDADO.md)
  - [REPORTE_ERRORES_SRC_v3.6.3.md](./docs/Auditoria/REPORTE_ERRORES_SRC_v3.6.3.md)
  - [REPORTE_FINAL_CONSOLIDADO_SCRIPT_MAESTRO_v3.6.3.md](./docs/Auditoria/REPORTE_FINAL_CONSOLIDADO_SCRIPT_MAESTRO_v3.6.3.md)
  - [REPORTE_SCRIPTS.md](./docs/Auditoria/REPORTE_SCRIPTS.md)
  - [SEGURIDAD_SCRIPT_MAESTRO_v3.6.3.md](./docs/Auditoria/SEGURIDAD_SCRIPT_MAESTRO_v3.6.3.md)
- Subdirectorios:
  - [analisis-codigo/ANALISIS_CODIGO_SCRIPT_MAESTRO_v3.6.3.md](./docs/Auditoria/analisis-codigo/ANALISIS_CODIGO_SCRIPT_MAESTRO_v3.6.3.md)
  - [analytics/REPORTE_ANALYTICS.md](./docs/Auditoria/analytics/REPORTE_ANALYTICS.md)
  - [autenticacion/REPORTE_AUTENTICACION.md](./docs/Auditoria/autenticacion/REPORTE_AUTENTICACION.md)
  - [base-datos/REPORTE_BASE_DATOS.md](./docs/Auditoria/base-datos/REPORTE_BASE_DATOS.md)
  - [cache/REPORTE_CACHE.md](./docs/Auditoria/cache/REPORTE_CACHE.md)
  - [chat/REPORTE_CHAT.md](./docs/Auditoria/chat/REPORTE_CHAT.md)
  - [componentes/REPORTE_COMPONENTES.md](./docs/Auditoria/componentes/REPORTE_COMPONENTES.md)
  - [couple/REPORTE_COUPLE.md](./docs/Auditoria/couple/REPORTE_COUPLE.md)
  - [directorios/README.md](./docs/Auditoria/directorios/README.md)
  - [errores/ERRORES_CRITICOS_SCRIPT_MAESTRO_v3.6.3.md](./docs/Auditoria/errores/ERRORES_CRITICOS_SCRIPT_MAESTRO_v3.6.3.md)
  - [final/REPORTE_UNIFICADO_COMPLETO_FINAL.md](./docs/Auditoria/final/REPORTE_UNIFICADO_COMPLETO_FINAL.md)
  - [matching/REPORTE_MATCHING.md](./docs/Auditoria/matching/REPORTE_MATCHING.md)
  - [mejores-practicas/MEJORES_PRACTICAS_SCRIPT_MAESTRO_v3.6.3.md](./docs/Auditoria/mejores-practicas/MEJORES_PRACTICAS_SCRIPT_MAESTRO_v3.6.3.md)
  - [moderation/REPORTE_MODERACION.md](./docs/Auditoria/moderation/REPORTE_MODERACION.md)
  - [notificaciones/REPORTE_NOTIFICACIONES.md](./docs/Auditoria/notificaciones/REPORTE_NOTIFICACIONES.md)
  - [optimizaciones/REPORTE_OPTIMIZACIONES.md](./docs/Auditoria/optimizaciones/REPORTE_OPTIMIZACIONES.md)
  - [public/REPORTE_PUBLIC.md](./docs/Auditoria/public/REPORTE_PUBLIC.md)
  - [seguridad/SECURITY_AUDIT_OVERVIEW.md](./docs/Auditoria/seguridad/SECURITY_AUDIT_OVERVIEW.md)
  - [servicios/REPORTE_SERVICIOS.md](./docs/Auditoria/servicios/REPORTE_SERVICIOS.md)
  - [vercel/REPORTE_VERCEL.md](./docs/Auditoria/vercel/REPORTE_VERCEL.md)
  - [web3/REPORTE_WEB3.md](./docs/Auditoria/web3/REPORTE_WEB3.md)

#### Directorio `audits/`
- [ANALISIS_CSS_DUPLICADOS_20251108_011845.json](./docs/audits/ANALISIS_CSS_DUPLICADOS_20251108_011845.json)
- [ANALISIS_CSS_DUPLICADOS_20251108_011955.json](./docs/audits/ANALISIS_CSS_DUPLICADOS_20251108_011955.json)
- [ANALISIS_CSS_DUPLICADOS_20251108_012153.json](./docs/audits/ANALISIS_CSS_DUPLICADOS_20251108_012153.json)
- [AUDITORIA_20251108_012932.json](./docs/audits/AUDITORIA_20251108_012932.json)
- [AUDITORIA_COMPLETA_20251108_005757.json](./docs/audits/AUDITORIA_COMPLETA_20251108_005757.json)
- [README.md](./docs/audits/README.md)

#### Directorio `Clubs/`
- [GUIA_CLUBS.md](./docs/Clubs/GUIA_CLUBS.md)
- [README.md](./docs/Clubs/README.md)

#### Directorio `Inversores/`
- [GUIA_INVERSORES.md](./docs/Inversores/GUIA_INVERSORES.md)
- [MANIFIESTO_FINTECH_ESTRATEGIA_NEGOCIO.md](./docs/Inversores/MANIFIESTO_FINTECH_ESTRATEGIA_NEGOCIO.md)
- [README.md](./docs/Inversores/README.md)

#### Directorio `Moderadores/`
- [GUIA_MODERADORES.md](./docs/Moderadores/GUIA_MODERADORES.md)
- [README.md](./docs/Moderadores/README.md)

#### Directorio `legal/`
- Archivos principales:
  - [⚖️ Cumplimiento Legal - Ley Olim.md](./docs/legal/%E2%9A%96%EF%B8%8F%20Cumplimiento%20Legal%20-%20Ley%20Olim.md)
  - [📋 Checklist Legal para Complicie.md](./docs/legal/%F0%9F%93%8B%20Checklist%20Legal%20para%20Complicie.md)
  - [ANALYSIS_REPORT_202509.md](./docs/legal/ANALYSIS_REPORT_202509.md)
  - [API.md](./docs/legal/API.md)
  - [CHANGELOG.md](./docs/legal/CHANGELOG.md)
  - [CONTRIBUTING.md](./docs/legal/CONTRIBUTING.md)
  - [DESLINDE_RESPONSABILIDAD.md](./docs/legal/DESLINDE_RESPONSABILIDAD.md)
  - [DISCLAIMER.md](./docs/legal/DISCLAIMER.md)
  - [DPA_VERCEL_v3.6.3.md](./docs/legal/DPA_VERCEL_v3.6.3.md)
  - [DPIA_v3.6.3.md](./docs/legal/DPIA_v3.6.3.md)
  - [index.html](./docs/legal/index.html)
  - [INDEX.md](./docs/legal/INDEX.md)
  - [INTERNAL_AUDIT_TEMPLATE_v3.6.3.md](./docs/legal/INTERNAL_AUDIT_TEMPLATE_v3.6.3.md)
  - [ISMS_POLICY.md](./docs/legal/ISMS_POLICY.md)
  - [LEGAL_COMPLIANCE_MEXICO.md](./docs/legal/LEGAL_COMPLIANCE_MEXICO.md)
  - [LEGAL_SUMMARY_REPORT.md](./docs/legal/LEGAL_SUMMARY_REPORT.md)
  - [LEY_OLIMPIA.md](./docs/legal/LEY_OLIMPIA.md)
  - [NFT_CONDITIONS.md](./docs/legal/NFT_CONDITIONS.md)
  - [POLITICA_PRIVACIDAD.md](./docs/legal/POLITICA_PRIVACIDAD.md)
  - [README.md](./docs/legal/README.md)
  - [RISK_LOG_v3.6.3.md](./docs/legal/RISK_LOG_v3.6.3.md)
  - [SUPPLIER_SECURITY_POLICY.md](./docs/legal/SUPPLIER_SECURITY_POLICY.md)
  - [Terminos de NTF-Tokens.pagos.md](./docs/legal/Terminos%20de%20NTF-Tokens.pagos.md)
  - [TERMINOS_Y_CONDICIONES.md](./docs/legal/TERMINOS_Y_CONDICIONES.md)
  - [TERMS_OF_SERVICE-BLOCKCHAIN.md](./docs/legal/TERMS_OF_SERVICE-BLOCKCHAIN.md)
  - [TERMS_OF_SERVICE.md](./docs/legal/TERMS_OF_SERVICE.md)
  - [TOKENS_LEGAL.md](./docs/legal/TOKENS_LEGAL.md)
- Subdirectorio `Legal-Policy/`:
  - [ACCESS_CONTROL_POLICY.md](./docs/legal/Legal-Policy/ACCESS_CONTROL_POLICY.md)
  - [CHANGE_MANAGEMENT_POLICY.md](./docs/legal/Legal-Policy/CHANGE_MANAGEMENT_POLICY.md)
  - [ENCRYPTION_POLICY.md](./docs/legal/Legal-Policy/ENCRYPTION_POLICY.md)
  - [INCIDENT_RESPONSE_POLICY.md](./docs/legal/Legal-Policy/INCIDENT_RESPONSE_POLICY.md)
  - [INTERNAL_AUDIT_POLICY.md](./docs/legal/Legal-Policy/INTERNAL_AUDIT_POLICY.md)
  - [NON_CONFORMITY_POLICY.md](./docs/legal/Legal-Policy/NON_CONFORMITY_POLICY.md)
  - [Política de Privacidad — Complici.md](./docs/legal/Legal-Policy/Pol%C3%ADtica%20de%20Privacidad%20%E2%80%94%20Complici.md)
  - [PRIVACY_POLICY.md](./docs/legal/Legal-Policy/PRIVACY_POLICY.md)
  - [README.md](./docs/legal/Legal-Policy/README.md)
  - [USER_CONSENT_POLICY.md](./docs/legal/Legal-Policy/USER_CONSENT_POLICY.md)

#### Directorio `Moderadores/`
- [GUIA_MODERADORES.md](./docs/Moderadores/GUIA_MODERADORES.md)
- [README.md](./docs/Moderadores/README.md)

#### Directorio `strategy/`
- [PREMIUM_STRATEGY.md](./docs/strategy/PREMIUM_STRATEGY.md)

*[⬅️ Volver al README principal](./README.md)*

### **📌 Documentación Estratégica (Investor Ready)**

- **[📄 Visión Estratégica](./docs/strategy/VISION.md)**
- **[💳 Estrategia Premium Post-Beta](./docs/strategy/PREMIUM_STRATEGY.md)**

### **🧾 Auditorías Técnicas y Análisis de Calidad**

- **[📊 Análisis Completo del Proyecto](./docs/audit/ANALISIS_COMPLETO.json)**
- **[✅ Auditoría Final del Proyecto](./docs/audit/FINAL_AUDIT.json)**

> **📚 Documentación Técnica (Uso Interno):**  
> La documentación técnica completa está en `docs-unified/` (no se sube a Git):
> - `docs-unified/DOCUMENTACION_MAESTRA_UNIFICADA_v3.6.3.md` - Documentación técnica completa
> - `docs-unified/MEMORIAS_SESIONES_UNIFICADAS_v3.6.3.md` - Memorias consolidadas
> - `docs-unified/REPORTES_ANALISIS_UNIFICADOS_v3.6.3.md` - Reportes consolidados

### **🎯 Navegación Rápida**

#### Para Desarrolladores
1. Lee primero: [Documentación Maestra Unificada](./docs/DOCUMENTACION_MAESTRA_UNIFICADA_v3.6.3.md)
2. Revisa: [Estructura del Proyecto](./project-structure-tree.md)
3. Consulta: [Guía de Instalación](./INSTALACION_SETUP_v3.5.0.md)
4. Testing: [Guía de Testing](./docs/TESTING.md)

#### Para Stakeholders/Inversores
1. Lee primero: [Guía para Inversores](./docs/Inversores/GUIA_INVERSORES.md)
2. Estrategia FinTech: [Manifiesto FinTech](./docs/Inversores/MANIFIESTO_FINTECH_ESTRATEGIA_NEGOCIO.md)
3. Revisa: [Presentación Pública](./COMPLICESCONECTA_PRESENTACION_PUBLICA.md)
4. Consulta: Sección "Modelo de Negocio" en [documentación maestra](./docs/DOCUMENTACION_MAESTRA_UNIFICADA_v3.6.3.md)

#### Para Moderadores
1. Lee primero: [Guía para Moderadores](./docs/GUIA_MODERADORES.md)
2. Revisa: Sección "Sistema de Moderación 24/7" en [documentación maestra](./docs/DOCUMENTACION_MAESTRA_UNIFICADA_v3.6.3.md)
3. Consulta: Flujo de moderación y pagos en [diagramas](./DIAGRAMAS_FLUJOS_v3.5.0.md)

#### Para Partners/Clubs
1. Lee primero: [Guía para Clubs](./docs/GUIA_CLUBS.md)
2. Revisa: Sección "Sistema de Clubs Verificados" en [documentación maestra](./docs/DOCUMENTACION_MAESTRA_UNIFICADA_v3.6.3.md)
3. Consulta: Flujo de verificación y check-ins en [diagramas](./DIAGRAMAS_FLUJOS_v3.5.0.md)

---

## 🏆 AI-NATIVE PLATFORM - Production Ready Enterprise

**Estado:** ✅ **PRODUCTION READY - AI-NATIVE - ENTERPRISE GRADE - REFACTORIZADO v3.7.1 - NEO4J OPERATIVO - VERCEL DEPLOYMENT FIXED - FUNCIONES GLOBALES FIXED - CIRCLE CI FIXED** 🏆  
**Última Actualización:** 20 de Noviembre, 2025  
**Versión:** 3.7.1 - AI-Native + Refactorización Completa + CSS Optimizado + React Fixes + Chat con Privacidad + Correcciones Críticas + Docker Build Successful + Neo4j Correcciones + Campos de Registro + Análisis de Estilos Completo + Estructura Modular + Vercel Deployment Fixed + Funciones Globales Fixed + CircleCI Fixed

> **La primera plataforma swinger con IA nativa de México +18**

### 🎉 NUEVAS FUNCIONALIDADES v3.6.3

#### 🗄️ Migraciones de Base de Datos y Análisis de Tablas ✅ (08 Nov 2025)
- ✅ **4 Migraciones Creadas**: `user_device_tokens`, `user_tokens`, `chat_rooms` (columnas), `profiles` (full_name)
- ✅ **Análisis de Tablas**: 67 tablas en LOCAL, 79 tablas usadas en código
- ✅ **Script de Alineación**: `scripts/alinear-y-verificar-todo.ps1` para verificar y alinear tablas
- ✅ **Documentación**: `docs/ANALISIS_TABLAS_ALINEACION_v3.6.3.md` con análisis detallado
- ✅ **Correcciones de Tipos**: Eliminado `as any` en `AdminDashboard.tsx` y `simpleChatService.ts`

#### 🔧 Refactorización Completa de Estructura (v3.6.0 - v3.6.3)
- ✅ **Organización de Perfiles:** `src/profiles/` con subdirectorios `single/`, `couple/`, `shared/`
- ✅ **Organización de Features:** `src/features/` con subdirectorios `auth/`, `profile/`, `clubs/`, `chat/`
- ✅ **Organización de Shared:** `src/shared/` con subdirectorios `ui/`, `lib/`
- ✅ **Organización de Entities:** `src/entities/` con tipos de dominio
- ✅ **Organización de Estilos:** `src/styles/` con subdirectorios organizados
- ✅ **Unificación de Hooks:** Todos los hooks en `src/hooks/`
- ✅ **Organización de App:** `src/app/` con subdirectorios `(admin)/`, `(clubs)/`, `(discover)/`, `(auth)/`
- ✅ **Script Maestro:** `# SCRIPT MAESTRO - REFACTOR Y ACTUALIZACION.ps1` consolidando 14 scripts

#### 🧠 AI-Native Layer (COMPLETADO 100%)
- ✅ **ML Compatibility Scoring** - PyTorch/TensorFlow.js
- ✅ **Chat Summaries ML** - GPT-4, BART, Fallback
- ✅ **Feature Extraction** - 11 features (likes, proximity, interests)
- ✅ **Hybrid Scoring** - AI + Legacy fallback automático
- ✅ **Opciones Gratuitas** - HuggingFace API (100% gratis)
- ✅ **Rate Limiting** - 10 resúmenes/día por usuario
- ✅ **Cache Inteligente** - 1h para scores, 24h para resúmenes
- ✅ **IA Consent Verification** - Verificación real-time de consentimiento en chats con NLP (Ley Olimpia MX)
- ✅ **Predictive Matching** - Matching predictivo con Neo4j + IA Emocional (friends-of-friends)

#### 📊 Google S2 Geosharding (ESTRUCTURA 100%, TOTAL 70%)
- ✅ **S2Service** - Cell ID generation (niveles 10-20)
- ✅ **Database Migration** - s2_cell_id + s2_level
- ✅ **Geolocation Integration** - Hook actualizado
- ✅ **Backfill Script** - Batch processing 100 profiles/vez
- ⏳ **Pendiente** - Ejecutar backfill + queries optimizadas

#### 🗄️ Neo4j Graph Database (IMPLEMENTADO 100% + OPERATIVO) ✅
- ✅ **Neo4jService** - Graph database para conexiones sociales (548 líneas)
- ✅ **Docker Compose** - Configuración completa de Neo4j Community Edition 5.15
- ✅ **Sincronización** - Scripts `sync-postgres-to-neo4j.ts` y `verify-neo4j.ts` (corregidos 05 Nov 2025)
- ✅ **Setup de Índices** - Script `setup-neo4j-indexes.ts` para optimización automática
- ✅ **Integración** - SmartMatchingService con enriquecimiento social y recomendaciones FOF
- ✅ **GraphMatchingService** - Matching predictivo con algoritmo "friends-of-friends" + IA Emocional
- ✅ **Performance** - 200x más rápido para queries de conexiones sociales
- ✅ **Operativo** - Neo4j corriendo, conexión verificada, 4 usuarios sincronizados

#### 🗄️ Base de Datos
- ✅ **113+ Tablas Operativas** - Sistema completo de clubs, inversiones, moderación, tokens (PostgreSQL/Supabase)
- ✅ **Neo4j Graph Database** - 100% implementado para conexiones sociales
- ✅ **209+ Índices Optimizados** - Queries optimizadas
- ✅ **122+ Políticas RLS** - Seguridad completa
- ✅ **35+ Triggers Activos** - Automatización de procesos
- ✅ **Docker Build Exitoso** - Imagen `complicesconecta:latest` creada
- ✅ **Docker Compose** - Neo4j configurado y listo

#### 🚀 Deployment Vercel (NUEVO v3.6.3)
- ✅ **vercel.json Corregido** - Eliminado `routes`, solo `rewrites` y `headers` válidos
- ✅ **vite.config.ts Optimizado** - Chunks estables, CSS no split, base path correcto
- ✅ **build-and-deploy.ps1** - Script automatizado con verificación completa
- ✅ **Variables de Entorno** - Carga automática desde `.env`/`.env.local`
- ✅ **Build Optimizado** - Tamaño <60MB, chunks estables, 0 errores
- ✅ **Funciones Globales Fixed** - `showEnvInfo()` y `showErrorReport()` disponibles en producción
- ✅ **Wallet Conflicts Silenciados** - Errores de wallet extensions completamente silenciados

#### 🏢 Sistema de Clubs Verificados ✅
- ✅ **5 Tablas Nuevas**: `clubs`, `club_verifications`, `club_checkins`, `club_reviews`, `club_flyers`
- ✅ **Check-ins Geoloc**: Radio 50m con verificación automática
- ✅ **Reseñas Verificadas**: Solo usuarios con WorldID + check-in real
- ✅ **Watermark + Blur IA**: Automático en imágenes de clubs
- ✅ **Páginas Públicas**: `/clubs/{slug}` con flyers editables
- ✅ **Panel Admin**: `/admin/partners` para gestión de clubs

#### 🛡️ Sistema de Moderación 24/7 ✅
- ✅ **Jerarquía 5 Niveles**: SuperAdmin (30%) → Elite (8%) → Senior (5%) → Junior (3%) → Trainee (1K CMPX)
- ✅ **Pagos Automáticos**: Cada lunes basados en % revenue
- ✅ **Timer Conexión**: Automático para tracking de horas
- ✅ **IA Pre-clasificación**: Cola de reportes con priorización automática
- ✅ **Baneo Permanente**: Con huella digital (canvas + WorldID)

#### 💎 Sistema de Tokens CMPX ✅
- ✅ **Total Supply**: 100M CMPX tokens
- ✅ **Shop Activo**: 1000 CMPX = 300 MXN
- ✅ **Comisión Galerías**: 10% (creador gana 90%)
- ✅ **Staking**: 10% APY anual
- ✅ **DAO**: Activación a 10K usuarios

#### 💰 Sistema de Donativos/Inversión ✅
- ✅ **SAFTE Automático**: 10% retorno anual garantizado
- ✅ **Tiers**: $10K, $25K, $50K, $100K MXN
- ✅ **Landing `/invest`**: Con Stripe integrado
- ✅ **Plataformas**: AngelList + Republic listos para publicar

#### 🔧 Correcciones y Mejoras v3.6.3 ✅ (09 Nov 2025)
- ✅ **Funciones Globales Fixed**: `showEnvInfo()` y `showErrorReport()` disponibles en producción
- ✅ **Wallet Conflicts Silenciados**: Errores de wallet extensions completamente silenciados
- ✅ **CircleCI Fixed**: Node.js 20.19+ configurado (requerido por Vite 7.2.2)
- ✅ **Correcciones de Servicios**: `AdminProduction.tsx`, `postsService.ts`, `InvitationsService.ts`, `clearStorage.ts`, `StoryViewer.tsx` corregidos con `safeLocalStorage`

---

## 🚀 Inicio Rápido

> **📚 Para una guía completa de instalación y configuración, consulta [INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md)**  
> **📚 Para configuración de túnel, consulta [QUICK_START_TUNNEL.md](./QUICK_START_TUNNEL.md)**

---

## 🏗️ Estructura del Proyecto (Resumen)

```
conecta-social-comunidad-main/
├── src/                          # Frontend React + TypeScript
│   ├── app/                      # Páginas organizadas por contexto
│   │   ├── (admin)/              # Páginas administrativas
│   │   ├── (clubs)/               # Páginas de clubs
│   │   ├── (discover)/            # Páginas de descubrimiento
│   │   └── (auth)/                # Páginas de autenticación
│   ├── profiles/                 # Perfiles organizados
│   │   ├── single/               # Perfiles individuales
│   │   ├── couple/               # Perfiles de parejas
│   │   └── shared/               # Componentes compartidos
│   ├── features/                 # Lógica reutilizable
│   │   ├── auth/                 # Autenticación
│   │   ├── profile/              # Perfiles
│   │   ├── clubs/                # Clubs
│   │   └── chat/                 # Chat
│   ├── shared/                    # Componentes compartidos
│   │   ├── ui/                   # Componentes UI base
│   │   └── lib/                  # Utilidades compartidas
│   ├── entities/                 # Entidades de dominio
│   ├── hooks/                    # Hooks unificados
│   ├── styles/                   # Estilos organizados
│   └── components/               # Componentes adicionales
├── supabase/                     # Backend Supabase
│   ├── functions/                # Edge Functions
│   └── migrations/               # Migraciones de BD
└── docs/                         # Documentación
```

Ver [project-structure-tree.md](./project-structure-tree.md) para estructura completa.

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

**Estado Actual**: 98% tests pasando (260/274)

---

## 🏭 Build & Deployment

### Build de Producción

```bash
# Build optimizado
npm run build

# Preview del build
npm run preview
```

### Docker Deployment

```bash
# Build de imagen Docker
docker build -t complicesconecta:latest .

# Run con New Relic
docker run -d --name complicesconecta \
  -p 3000:3000 \
  -e NEW_RELIC_LICENSE_KEY=your_key \
  -e NEW_RELIC_APP_NAME="ComplicesConecta" \
  complicesconecta:latest
```

---

## 📊 Estadísticas del Proyecto

### Métricas de Desarrollo
```
📁 Total de Archivos: 300+
📝 Líneas de Código: 42,500+
🧩 Componentes React: 100+
🎣 Custom Hooks: 25+
📄 Páginas: 25+
🗄️ Tablas DB: 113 (sincronizadas 100%)
⚡ Edge Functions: 10+
🔐 Políticas RLS: 122+
📊 Índices Optimizados: 209+
🔄 Triggers: 35+
```

### Métricas de Calidad
```
✅ TypeScript Errors: 0
✅ Linting Errors: 0
✅ JSX Errors: 0
✅ Test Coverage: 98%
✅ Build Success: 100%
✅ Database Sync: 100%
✅ Lighthouse Score: >98
✅ Bundle Size: <350KB (gzipped)
```

---

## 👥 Equipo

**Liderado por**: Ing. Juan Carlos Méndez Nataren  
**Diseños por**: Reina Magali Perdomo Sanchez & Ing. Juan Carlos Méndez Nataren  
**Marketing por**: Reina Magali Perdomo Sanchez

### ⚖️ Equipo Legal y Cumplimiento

**Departamento Legal:**
- **Email**: legal@complicesconecta.com
- **Teléfono**: +52 55 1234 5678
- **Representante Legal**: Ing. Juan Carlos Méndez Nataren

**Cumplimiento Normativo:**
- **Email**: compliance@complicesconecta.com
- **Horario**: Lunes a Viernes, 9:00 AM - 6:00 PM (Ciudad de México)
- **Responsable**: Ing. Juan Carlos Méndez Nataren

**Información Legal:**
- **Empresa**: ComplicesConecta S.A. de C.V.
- **RFC**: CCO240901ABC
- **Domicilio**: Ciudad de México, México
- **Jurisdicción**: Estados Unidos Mexicanos
- **Legislación Aplicable**: Ley Federal de Protección de Datos Personales
- **Regulador**: CONDUSEF (servicios financieros)
- **Tribunales Competentes**: Federales de México

---

## 📞 Soporte

**Email**: complicesconectasw@outlook.es  
**GitHub**: [ComplicesConectaSw](https://github.com/ComplicesConectaSw)  
**Website**: [complicesconecta.com](https://complicesconecta.com)

---

## ⚖️ Licencia

© 2025 ComplicesConecta Software. Todos los derechos reservados.

---

## ⚠️ Aviso Legal

**Contenido para Adultos +18**

ComplicesConecta es una plataforma exclusiva para adultos mayores de 18 años interesados en el estilo de vida swinger. Al acceder a esta aplicación, confirmas que:

- ✅ Eres mayor de 18 años
- ✅ El contenido para adultos es legal en tu jurisdicción
- ✅ Aceptas los [Términos de Servicio](./legal/TERMS_OF_SERVICE.md)
- ✅ Has leído la [Política de Privacidad](./legal/PRIVACY_POLICY.md)

**Uso Responsable**: Esta plataforma promueve conexiones consensuadas, respetuosas y seguras. No toleramos acoso, contenido no consensuado ni actividad ilegal.

---

*Conexiones auténticas, experiencias únicas, discreción total.* 🔥
