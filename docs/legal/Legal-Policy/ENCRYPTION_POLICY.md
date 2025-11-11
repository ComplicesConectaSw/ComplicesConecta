# Política de Encriptación

**Versión:** 1.0 | **Fecha:** 08 Nov 2025

## Estándar
- **AES-256-GCM** para gallery_images.
- **TLS 1.3** en tránsito (Vercel + Supabase).
- **Key rotation:** Cada 90 días (Supabase KMS).

## Alcance
- Imágenes, chats privados, tokens CMPX.
- No se almacenan contraseñas (Supabase Auth).

**Cumplimiento:** GDPR Art. 32, ISO A.8.24.