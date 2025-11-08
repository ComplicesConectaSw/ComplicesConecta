# 📊 DIAGRAMAS DE FLUJOS - COMPLICESCONECTA v3.6.3

**Fecha:** 08 Noviembre 2025  
**Versión:** 3.6.3  
**Estado:** ✅ Documentación Actualizada

---

## 🔄 FLUJO COMPLETO DE USUARIO

```mermaid
flowchart TD
    A[Usuario Nuevo] --> B{Registro}
    B -->|Con WorldID| C[Verificación Instantánea]
    B -->|Sin WorldID| D[Verificación Manual]
    C --> E[Onboarding]
    D --> E
    E --> F[Discover]
    F --> G{Acción}
    G -->|Match| H[Chat Realtime]
    G -->|Club Check-in| I[Geoloc 50m]
    G -->|Comprar Tokens| J[Shop CMPX]
    G -->|Invertir| K[Donativos /invest]
    I --> L{Verificado?}
    L -->|Sí| M[Reseña 24h después]
    L -->|No| N[Check-in no válido]
    H --> O{Galería Privada?}
    O -->|Sí| P[Pago CMPX]
    O -->|No| Q[Chat Gratis]
    P --> R[Creador gana 90%]
    M --> S[Club Rating Actualizado]
    
    style C fill:#10b981
    style I fill:#3b82f6
    style P fill:#f59e0b
    style K fill:#8b5cf6
```

---

## 🏢 FLUJO DE VERIFICACIÓN DE CLUB

```mermaid
sequenceDiagram
    participant C as Club Partner
    participant A as App
    participant S as SuperAdmin<br/>(Tú + Esposa)
    participant DB as Base de Datos
    participant U as Usuarios
    
    C->>A: Registro como Partner
    C->>A: Sube flyers + redes sociales
    A->>S: Notificación nueva solicitud
    S->>DB: Validación INSTANTÁNEA
    DB->>C: Badge VERIFICADO ✅
    DB->>A: Página pública activa<br/>/clubs/{slug}
    
    U->>A: Visita página club
    U->>A: Check-in geoloc (radio 50m)
    A->>DB: Registra visita + timestamp
    A->>U: Notificación 24h después
    U->>A: Reseña verificada
    DB->>C: Rating actualizado automático
    
    C->>A: Sube fotos evento
    A->>A: Watermark automático<br/>ComplicesConecta + Club
    A->>A: Blur IA caras/tatuajes
    A->>DB: Guarda imágenes procesadas
```

---

## 🛡️ FLUJO DE MODERACIÓN COMPLETO

```mermaid
flowchart LR
    A[Usuario Reporta] --> B{IA Pre-clasifica}
    B -->|Urgente<br/>Drogas/Armas/Menores| C[Notificación Push<br/>3 Moderadores Elite]
    B -->|Normal<br/>Spam/Hate| D[Cola Normal<br/>Respuesta <4 hrs]
    B -->|Bajo<br/>Fake/Spam| E[Auto-resuelto<br/>IA]
    
    C --> F[Moderador Responde<br/><15 min]
    D --> F
    F --> G{Decisión}
    G -->|Advertencia| H[Nivel 1<br/>7 días sin chat]
    G -->|Suspensión| I[Nivel 2<br/>30 días + pérdida tokens]
    G -->|Baneo| J[Nivel 3<br/>Permanente]
    
    J --> K[Huella Digital<br/>Canvas + WorldID]
    K --> L[Bloqueo Futuro<br/>99.9% imposible volver]
    
    F --> M[Feedback Usuario<br/>1-5 estrellas]
    M -->|5 estrellas| N[+100 CMPX<br/>Moderador]
    M -->|1-4 estrellas| O[Sin bonus]
    
    style C fill:#ef4444
    style F fill:#10b981
    style J fill:#dc2626
    style K fill:#7c3aed
```

---

## 💎 FLUJO DE COMPRA Y USO DE TOKENS CMPX

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as Shop
    participant ST as Stripe
    participant DB as Base de Datos
    participant C as Creador<br/>Galería Privada
    
    U->>S: Selecciona paquete CMPX<br/>1000 CMPX = $300 MXN
    S->>ST: Crea Checkout Session
    ST->>U: Pago con tarjeta/SPEI
    ST->>DB: Webhook: checkout.completed
    DB->>U: Tokens acreditados<br/>+1000 CMPX
    
    U->>C: Intenta ver galería privada
    C->>U: Solicita 1000 CMPX
    U->>DB: Pago 1000 CMPX
    DB->>C: +900 CMPX (90%)
    DB->>DB: +100 CMPX comisión (10%)
    DB->>U: Acceso galería desbloqueado
    
    Note over DB: Comisión 10%<br/>Creador gana 90%
```

---

## 💰 FLUJO DE DONATIVOS/INVERSIÓN

```mermaid
flowchart TD
    A[Inversor] --> B[Landing /invest]
    B --> C{Selecciona Tier}
    C -->|$10K| D[Tier Bronce<br/>10% anual + 100K CMPX]
    C -->|$25K| E[Tier Plata<br/>10% anual + 300K CMPX]
    C -->|$50K| F[Tier Oro<br/>10% anual + 750K CMPX]
    C -->|$100K| G[Tier Diamante<br/>10% anual + 2M CMPX]
    
    D --> H[Stripe Checkout]
    E --> H
    F --> H
    G --> H
    
    H --> I[Pago Completado]
    I --> J[SAFTE Automático<br/>Contrato generado]
    I --> K[Tokens CMPX Acreditados]
    I --> L[Badge Inversor]
    I --> M[Retorno 10% anual<br/>Garantizado]
    
    M --> N[Pago Mensual Automático<br/>1/12 del 10% anual]
    
    style D fill:#cd7f32
    style E fill:#c0c0c0
    style F fill:#ffd700
    style G fill:#b9f2ff
```

---

## 🤖 FLUJO DE IA COMPLICE (ASISTENTE PERSONAL)

```mermaid
graph TB
    A[Usuario Activo] --> B[IA Complice<br/>Monitoreo 24/7]
    B --> C{Evento Detectado}
    C -->|Parejas Cercanas| D[Notificación Push<br/>6 parejas a <8km]
    C -->|Club Evento| E[Mensaje Personalizado<br/>¿Reservamos La Azotea?]
    C -->|Match Nuevo| F[Sugerencia Mensaje<br/>Basado en perfil]
    C -->|Búsqueda Web| G[Resultados Eventos<br/>Flyers, reseñas]
    
    D --> H[Usuario Interactúa]
    E --> H
    F --> H
    G --> H
    
    H --> I{Acción Usuario}
    I -->|Reserva Club| J[Agenda Automática<br/>+ Descuento 30%]
    I -->|Envía Mensaje| K[Mensaje Optimizado<br/>IA]
    I -->|Reporta| L[Baneo <60 seg<br/>Si es urgente]
    
    style B fill:#6366f1
    style D fill:#10b981
    style E fill:#f59e0b
    style L fill:#ef4444
```

---

## 🔐 FLUJO DE BANEO PERMANENTE

```mermaid
sequenceDiagram
    participant M as Moderador
    participant A as App
    participant FP as Fingerprint Service
    participant DB as Base de Datos
    participant U as Usuario Baneado
    
    M->>A: Decide baneo permanente<br/>Violación grave
    A->>FP: Genera huella digital
    FP->>FP: Canvas fingerprint
    FP->>FP: Browser fingerprint
    FP->>FP: WorldID nullifier hash
    FP->>FP: Combined hash único
    FP->>DB: Guarda digital_fingerprints
    
    A->>DB: Crea permanent_bans
    DB->>DB: Marca usuario is_blocked=true
    DB->>U: Notificación baneo
    
    U->>A: Intenta crear nueva cuenta
    A->>FP: Verifica huella digital
    FP->>DB: Busca en permanent_bans
    DB->>FP: Huella encontrada
    FP->>A: BLOQUEO AUTOMÁTICO
    A->>U: Registro rechazado<br/>Baneo permanente activo
    
    Note over DB: 99.9% imposible<br/>volver a registrarse
```

---

## 📊 FLUJO DE PAGOS AUTOMÁTICOS MODERADORES

```mermaid
flowchart TD
    A[Cada Lunes 00:00] --> B[Edge Function<br/>process-moderator-payments]
    B --> C[Calcula Revenue<br/>Últimos 7 días]
    C --> D[Obtiene Moderadores<br/>Activos]
    D --> E{Calcula Pago<br/>por Nivel}
    
    E -->|SuperAdmin| F[30% revenue total]
    E -->|Elite| G[8% revenue<br/>20+ hrs/semana]
    E -->|Senior| H[5% revenue<br/>10-19 hrs/semana]
    E -->|Junior| I[3% revenue<br/>5-9 hrs/semana]
    E -->|Trainee| J[1K CMPX fijos<br/>2-4 hrs/semana]
    
    F --> K[50% CMPX + 50% MXN]
    G --> L[50% CMPX + 50% MXN]
    H --> M[70% CMPX + 30% MXN]
    I --> N[100% CMPX]
    J --> N
    
    K --> O[Registra en<br/>moderator_payments]
    L --> O
    M --> O
    N --> O
    
    O --> P[Notificación Push<br/>Moderador]
    O --> Q[Stripe Payout<br/>Si es MXN]
    
    style A fill:#6366f1
    style F fill:#ef4444
    style G fill:#f59e0b
    style O fill:#10b981
```

---

## 🏪 FLUJO DE PUBLICIDAD CLUBS

```mermaid
sequenceDiagram
    participant C as Club Partner
    participant A as App
    participant S as SuperAdmin
    participant U as Usuarios
    participant DB as Base de Datos
    
    C->>A: Solicita plan publicidad<br/>Básico/Premium/Elite
    A->>C: Formulario registro
    C->>A: Sube flyers + info
    C->>A: Pago mensual<br/>Tokens CMPX o Stripe
    A->>S: Notificación nueva solicitud
    S->>DB: Validación INSTANTÁNEA
    DB->>C: Badge VERIFICADO ✅
    DB->>A: Página pública activa
    
    U->>A: Visita /clubs
    A->>U: Muestra club destacado<br/>Banner home (si Premium/Elite)
    U->>C: Check-in geoloc
    U->>C: Reserva con tokens CMPX
    C->>DB: Registra reserva
    DB->>A: Comisión automática<br/>25-35% según plan
    
    Note over A,DB: Comisión cubre<br/>entrada club + fee app
```

---

## 📈 FLUJO DE CRECIMIENTO ORGÁNICO

```mermaid
graph LR
    A[Primeros 100 Usuarios<br/>Beta Testers] --> B[Regalo Vitalicio<br/>+ 10K CMPX]
    B --> C{Condiciones}
    C -->|WorldID| D[Verificación]
    C -->|Check-in Club| E[Visita Real]
    C -->|Reseña| F[Feedback]
    C -->|Invita 3 Parejas| G[Viralidad]
    
    D --> H[Embajadores Activos]
    E --> H
    F --> H
    G --> H
    
    H --> I[30 días<br/>500 usuarios]
    I --> J[90 días<br/>5,000 usuarios]
    J --> K[6 meses<br/>Revenue Real]
    
    K --> L[Marketing Pagado]
    K --> M[Partnerships Clubs]
    K --> N[App Stores]
    
    style A fill:#8b5cf6
    style H fill:#10b981
    style K fill:#f59e0b
```

---

## 🔄 FLUJO DE STAKING CMPX

```mermaid
sequenceDiagram
    participant U as Usuario
    participant W as Wallet CMPX
    participant S as Staking Service
    participant DB as Base de Datos
    
    U->>W: Tiene 10,000 CMPX
    U->>S: Activa Staking<br/>10% APY anual
    S->>DB: Registra staking<br/>cmpx_staked = 10,000
    DB->>W: Bloquea tokens<br/>No transferibles
    
    Note over S,DB: Cada día calcula<br/>interés compuesto
    
    S->>DB: Calcula interés diario<br/>10,000 * 0.10 / 365 = 2.74 CMPX/día
    DB->>W: Acredita interés diario
    W->>U: Balance actualizado
    
    U->>S: Desactiva Staking<br/>Después de 30 días mínimo
    S->>DB: Libera tokens
    DB->>W: Tokens disponibles<br/>+ intereses acumulados
    W->>U: Puede transferir/vender
```

---

---

## 🔄 FLUJO DE ALINEACIÓN DE BASE DE DATOS v3.6.3

```mermaid
flowchart TD
    A[Iniciar Alineación] --> B[Verificar Migraciones]
    B --> C{Migraciones<br/>Corregidas?}
    C -->|Sí| D[Aplicar en LOCAL]
    C -->|No| E[Corregir Migraciones]
    E --> D
    D --> F[Verificar Tablas LOCAL]
    F --> G[Verificar Tablas REMOTO]
    G --> H[Analizar Uso en Código]
    H --> I{Tablas<br/>Faltantes?}
    I -->|Sí| J[Crear Migraciones]
    I -->|No| K[Regenerar Tipos]
    J --> K
    K --> L[Verificar Errores]
    L --> M{Errores?}
    M -->|Sí| N[Corregir Código]
    M -->|No| O[✅ Alineación Completa]
    N --> L
    
    style A fill:#6366f1
    style D fill:#10b981
    style J fill:#f59e0b
    style O fill:#10b981
```

---

**Documento creado:** 06 Noviembre 2025  
**Última actualización:** 08 Noviembre 2025  
**Versión:** 1.1

