# DPIA - Data Protection Impact Assessment v3.6.3

**Fecha:** 08 Nov 2025  
**Versión:** 3.6.3  
**DPO:** Ing. Juan Carlos Méndez Nataren  
**Alcance:** Procesamiento de datos personales en CompliciesConecta (web + app +18).

## 1. Descripción del Procesamiento
- **Datos:** Edad, email, geoloc (S2 anonimizada), preferencias +18, gallery_images.
- **Propósito:** Matching IA, chat, galerías, compliance Ley Olimpia.
- **Volumen:** 1,000 usuarios iniciales, 100 GB datos.

## 2. Riesgos Identificados
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Brecha +18 images | Media | Alto | AES-256 + RLS Supabase |
| Geoloc tracking | Baja | Medio | S2 cells (50m, anonimizada) |
| IA bias matching | Media | Bajo | GPT-4 + human review |
| Vendor breach (Supabase) | Baja | Alto | DPA + SOC 2 |

## 3. Medidas de Mitigación
- Encriptación AES-256 (gallery_images).
- RLS 65 políticas (Supabase).
- Consentimiento explícito (ConsentModal).
- Auditoría interna Q1 2026.

## 4. Consultas
- Supabase DPA: Firmado.
- Usuarios: Notificación en Privacy Policy.

## 5. Recomendaciones
- ISO 27001 auditoría Q1 2026.
- Risk log mensual.

**Aprobado:** DPO | **Revisión:** Q2 2026.