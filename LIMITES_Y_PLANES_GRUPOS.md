# 💎 Sistema de Límites por Plan - Chats Grupales

## 📊 Resumen Ejecutivo

Sistema de monetización para chats grupales públicos basado en planes de suscripción.  
**Aplicable a:** Perfiles Singles y Parejas

---

## 🎯 Filosofía del Sistema

### Versión Gratis (Beta Actual)
- **Objetivo:** Permitir que usuarios conozcan la plataforma
- **Límites:** Funcionalidad básica con restricciones estratégicas
- **Conversión:** Motivar upgrade a premium mediante valor agregado

---

## 📱 LÍMITES RECOMENDADOS POR PLAN

### 🆓 **Plan GRATUITO** (Actual Beta)
```
✅ Acceso a la plataforma completo
✅ Chats privados 1 a 1 ilimitados
⚠️ Salas públicas: LIMITADO

Restricciones Salas Públicas:
• Máximo 3 salas públicas activas simultáneamente
• Máximo 50 mensajes por sala/día
• No puede crear salas públicas propias
• Acceso solo a salas "General" y "Lifestyle"
• No puede ser moderador de salas
```

**Razón:** Los chats privados 1-1 son la funcionalidad core. Las salas públicas se limitan para incentivar upgrade sin afectar experiencia básica.

---

### 💎 **Plan BÁSICO** ($9.99/mes)
```
✅ Todo lo del plan Gratuito
✅ Chats privados ilimitados
✅ Salas públicas: AMPLIADO

Límites Salas Públicas:
• Máximo 10 salas públicas activas
• Mensajes ilimitados
• Puede unirse a salas especializadas
• Máximo 50 personas por sala propia
• Puede crear 2 salas públicas propias
```

**Perfil ideal:** Singles y parejas que quieren explorar más la comunidad

---

### 🌟 **Plan PREMIUM** ($19.99/mes)
```
✅ Todo lo del plan Básico
✅ Chats privados ilimitados
✅ Salas públicas: COMPLETO

Límites Salas Públicas:
• Salas públicas ilimitadas
• Mensajes ilimitados
• Acceso a TODAS las salas (incluidas VIP)
• Puede crear 5 salas públicas propias
• Máximo 100 personas por sala propia
• Puede ser moderador de salas
• Priority en mensajes grupales
```

**Perfil ideal:** Usuarios muy activos en la comunidad

---

### 👑 **Plan VIP** ($39.99/mes)
```
✅ Todo lo del plan Premium
✅ Sin restricciones de ningún tipo

Salas Públicas VIP:
• Salas ilimitadas sin restricciones
• Crear salas sin límite de personas
• Crear hasta 10 salas propias
• Moderador automático en salas propias
• Acceso a salas exclusivas VIP
• Videollamadas grupales (hasta 10 personas)
• Eventos privados exclusivos
```

**Perfil ideal:** Organizadores de eventos, líderes de comunidad

---

## 🎭 Aplicación por Tipo de Perfil

### Singles
- **Gratis:** Exploran la comunidad básica
- **Básico:** Participan activamente en grupos de interés
- **Premium:** Lideran conversaciones y organizan encuentros
- **VIP:** Crean eventos y comunidades especializadas

### Parejas
- **Gratis:** Descubren el lifestyle
- **Básico:** Se conectan con otras parejas en salas temáticas
- **Premium:** Organizan intercambios y fiestas privadas
- **VIP:** Crean clubs exclusivos y eventos VIP

---

## 💡 **RECOMENDACIÓN FINAL**

### Para Fase Beta Actual (Gratis Total)
```
Implementar:
✅ Toda la funcionalidad disponible
✅ Sin límites de salas públicas
⚠️ Mostrar banner "Fase Beta - Acceso Premium Gratis"
⚠️ Preparar infraestructura de límites en código

Objetivo:
- Que usuarios conozcan TODO el potencial
- Crear adicción al producto completo
- Al finalizar beta, aplicar límites gradualmente
```

### Transición Post-Beta
```
Semana 1-2: Avisar que beta termina
Semana 3: Implementar límites gradualmente
Semana 4: Lanzar planes de pago oficialmente

Usuarios beta:
- 30% descuento primer mes
- Acceso Premium gratis por 1 mes adicional
```

---

## 🔢 Límites Técnicos Sugeridos (Código)

```typescript
interface GroupChatLimits {
  // Salas públicas
  maxPublicRooms: number;        // Máx salas activas simultáneas
  maxMessagesPerRoomDay: number; // Mensajes por sala/día
  canCreateRooms: boolean;       // Puede crear salas
  maxOwnRooms: number;           // Máx salas propias
  maxMembersPerRoom: number;     // Máx personas en sala propia
  
  // Privilegios
  canBeModerat or: boolean;      // Puede moderar
  hasVIPAccess: boolean;          // Acceso salas VIP
  hasPriority: boolean;           // Prioridad en mensajes
  canVideoCall: boolean;          // Videollamadas grupales
  maxVideoParticipants: number;   // Máx personas en video
}

const PLAN_LIMITS = {
  free: {
    maxPublicRooms: 3,
    maxMessagesPerRoomDay: 50,
    canCreateRooms: false,
    maxOwnRooms: 0,
    maxMembersPerRoom: 0,
    canBeModerator: false,
    hasVIPAccess: false,
    hasPriority: false,
    canVideoCall: false,
    maxVideoParticipants: 0
  },
  basic: {
    maxPublicRooms: 10,
    maxMessagesPerRoomDay: -1, // Ilimitado
    canCreateRooms: true,
    maxOwnRooms: 2,
    maxMembersPerRoom: 50,
    canBeModerator: false,
    hasVIPAccess: false,
    hasPriority: false,
    canVideoCall: false,
    maxVideoParticipants: 0
  },
  premium: {
    maxPublicRooms: -1, // Ilimitado
    maxMessagesPerRoomDay: -1,
    canCreateRooms: true,
    maxOwnRooms: 5,
    maxMembersPerRoom: 100,
    canBeModerator: true,
    hasVIPAccess: true,
    hasPriority: true,
    canVideoCall: false,
    maxVideoParticipants: 0
  },
  vip: {
    maxPublicRooms: -1,
    maxMessagesPerRoomDay: -1,
    canCreateRooms: true,
    maxOwnRooms: 10,
    maxMembersPerRoom: -1, // Ilimitado
    canBeModerator: true,
    hasVIPAccess: true,
    hasPriority: true,
    canVideoCall: true,
    maxVideoParticipants: 10
  }
};
```

---

## 🎯 Estrategia de Implementación

### Fase 1: Beta (Actual - 3 meses)
- ✅ Todo gratis, sin límites
- ✅ Recolectar feedback de usuarios
- ✅ Optimizar infraestructura

### Fase 2: Pre-Lanzamiento (1 mes)
- ⚠️ Anunciar fin de beta
- ⚠️ Mostrar precios futuros
- ⚠️ Ofrecer "early adopter" discounts

### Fase 3: Lanzamiento Oficial
- 💎 Activar planes de pago
- 💎 Aplicar límites gradualmente
- 💎 Monitorear conversiones

---

## ✅ Recomendación Final

**Para tu caso específico:**

1. **Mantener beta gratis sin límites** - Dejar que usuarios exploren todo
2. **Implementar código de límites** - Preparado pero desactivado
3. **Mostrar "Premium Gratis" badge** - Que sepan que es temporal
4. **Planes sugeridos:** Gratis → $9.99 → $19.99 → $39.99

**Estrategia correcta:** Sí, es correcto ofrecer todo gratis en beta para que conozcan el valor completo del producto.

---

_Documento generado: 16 Nov 2025_  
_Para: Sistema de Chats Grupales ComplicesConecta_
