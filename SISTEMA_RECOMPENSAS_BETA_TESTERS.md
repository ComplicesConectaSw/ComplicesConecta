# 🎯 Sistema de Recompensas para Beta-Testers

**Filosofía:** Los beneficios se GANAN, no se regalan  
**Objetivo:** Usuarios activos y comprometidos = Comunidad fuerte

---

## 🏆 SISTEMA DE PUNTOS Y NIVELES

### **Estructura de Niveles:**

| Nivel | Puntos Necesarios | Beneficios | Badge |
|-------|------------------|------------|-------|
| **🥉 Bronce** | 0-999 pts | 500 CMPX gratis | 🥉 Bronze Tester |
| **🥈 Plata** | 1,000-2,999 pts | 1,500 CMPX + 1 mes Premium | 🥈 Silver Contributor |
| **🥇 Oro** | 3,000-9,999 pts | 5,000 CMPX + 3 meses Premium | 🥇 Gold Pioneer |
| **💎 Diamante** | 10,000+ pts | 10,000 CMPX + 6 meses VIP + 30% descuento vitalicio | 💎 Diamond Founder |

---

## 📊 CÓMO GANAR PUNTOS

### **1. CONSTANCIA DIARIA (40% del total)**

#### **Login Diario:**
- ✅ Login diario simple: **+10 pts/día**
- ✅ Login + 10 minutos activo: **+25 pts/día**
- ✅ Login + 30 minutos activo: **+50 pts/día**
- 🔥 **Racha de 7 días consecutivos:** **BONUS +200 pts**
- 🔥 **Racha de 30 días consecutivos:** **BONUS +1,000 pts**

**Código:**
```typescript
interface DailyActivity {
  user_id: string;
  date: Date;
  minutes_active: number;
  login_count: number;
  points_earned: number;
  streak_days: number;
}

// Calcular puntos por actividad diaria
function calculateDailyPoints(minutes: number): number {
  if (minutes < 10) return 10;      // Solo login
  if (minutes < 30) return 25;      // 10-30 min
  return 50;                         // 30+ min
}

// Bonus por racha
function calculateStreakBonus(streak: number): number {
  if (streak === 7) return 200;     // 1 semana
  if (streak === 30) return 1000;   // 1 mes
  if (streak === 60) return 2500;   // 2 meses
  if (streak === 90) return 5000;   // 3 meses (beta completa)
  return 0;
}
```

---

### **2. REFERIDOS Y EXPANSIÓN (25% del total)**

#### **Sistema de Referidos:**
- ✅ Invitar amigo (registro): **+100 pts**
- ✅ Referido activa cuenta (verifica email): **+200 pts**
- ✅ Referido completa perfil: **+300 pts**
- ✅ Referido hace su primer match: **+500 pts**
- 🔥 **5 referidos activos:** **BONUS +1,000 pts**
- 🔥 **10 referidos activos:** **BONUS +3,000 pts + 1 mes Premium**

**Código:**
```typescript
interface Referral {
  referrer_id: string;
  referred_id: string;
  status: 'invited' | 'registered' | 'verified' | 'active';
  points_earned: number;
  created_at: Date;
  activated_at?: Date;
}

// Puntos según estado del referido
const REFERRAL_POINTS = {
  invited: 100,       // Usuario registró con tu código
  registered: 200,    // Verificó email
  verified: 300,      // Completó perfil
  active: 500,        // Hizo primer match/post
};

// Bonus por cantidad de referidos
function calculateReferralBonus(activeReferrals: number): number {
  if (activeReferrals >= 10) return 3000;
  if (activeReferrals >= 5) return 1000;
  return 0;
}
```

**Link de Referido:**
```
https://complicesconecta.com/?ref=WACKO123

Mensaje sugerido:
"¡Únete a ComplicesConecta en beta GRATIS! 
Usa mi código: WACKO123 
Ambos ganaremos tokens 🎁"
```

---

### **3. CREACIÓN DE CONTENIDO (20% del total)**

#### **Posts y Contenido:**
- ✅ Crear post con texto: **+15 pts**
- ✅ Post con imagen: **+25 pts**
- ✅ Post con video: **+40 pts**
- ✅ Post recibe 10+ likes: **+50 pts BONUS**
- ✅ Post recibe 50+ likes: **+200 pts BONUS**
- ✅ Post viral (100+ likes): **+500 pts BONUS**
- 📸 **Subir 5+ fotos a galería privada:** **+300 pts**
- 📝 **Bio completa + intereses (100%):** **+100 pts**

**Código:**
```typescript
interface ContentCreation {
  user_id: string;
  content_type: 'post' | 'photo' | 'video' | 'bio';
  likes_count: number;
  points_earned: number;
  is_viral: boolean;
  created_at: Date;
}

// Puntos por tipo de contenido
function calculateContentPoints(
  type: 'post' | 'photo' | 'video',
  likes: number
): number {
  let basePoints = 0;
  
  switch(type) {
    case 'post': basePoints = 15; break;
    case 'photo': basePoints = 25; break;
    case 'video': basePoints = 40; break;
  }
  
  // Bonus por viralidad
  if (likes >= 100) return basePoints + 500;
  if (likes >= 50) return basePoints + 200;
  if (likes >= 10) return basePoints + 50;
  
  return basePoints;
}
```

---

### **4. INTERACCIONES Y PARTICIPACIÓN (15% del total)**

#### **Engagement Social:**
- ✅ Dar like: **+2 pts** (máx 50 pts/día)
- ✅ Comentar en post: **+10 pts**
- ✅ Comentario recibe 5+ likes: **+25 pts BONUS**
- ✅ Compartir post: **+15 pts**
- ✅ Enviar mensaje privado: **+5 pts**
- ✅ Participar en sala pública: **+20 pts/día**
- 💬 **100+ comentarios totales:** **BONUS +500 pts**
- 💬 **500+ interacciones totales:** **BONUS +1,500 pts**

**Código:**
```typescript
interface UserEngagement {
  user_id: string;
  likes_given: number;
  comments_made: number;
  shares_made: number;
  messages_sent: number;
  public_room_participation: number;
  total_points: number;
}

// Límites diarios para evitar spam
const DAILY_LIMITS = {
  likes: 50,              // Máx 50 likes/día = 100 pts
  comments: 20,           // Máx 20 comentarios/día = 200 pts
  shares: 10,             // Máx 10 shares/día = 150 pts
  messages: 30,           // Máx 30 mensajes/día = 150 pts
};

// Calcular puntos de engagement
function calculateEngagementPoints(
  action: 'like' | 'comment' | 'share' | 'message',
  count: number
): number {
  const points = {
    like: 2,
    comment: 10,
    share: 15,
    message: 5,
  };
  
  const limit = DAILY_LIMITS[action + 's' as keyof typeof DAILY_LIMITS];
  const validCount = Math.min(count, limit);
  
  return validCount * points[action];
}
```

---

## 🎮 MISIONES Y DESAFÍOS ESPECIALES

### **Misiones Semanales:**

#### **Semana 1: "Bienvenida"**
- [ ] Completa tu perfil 100% → **+200 pts**
- [ ] Sube 3 fotos → **+150 pts**
- [ ] Haz tu primer match → **+300 pts**
- **RECOMPENSA:** 500 CMPX

#### **Semana 2: "Social"**
- [ ] Haz 10 comentarios → **+200 pts**
- [ ] Da 50 likes → **+100 pts**
- [ ] Participa en 1 sala pública → **+200 pts**
- **RECOMPENSA:** 750 CMPX

#### **Semana 3: "Creador"**
- [ ] Crea 5 posts → **+300 pts**
- [ ] Sube 1 video → **+200 pts**
- [ ] Recibe 20+ likes en un post → **+300 pts**
- **RECOMPENSA:** 1,000 CMPX

#### **Semana 4: "Embajador"**
- [ ] Invita 3 amigos → **+600 pts**
- [ ] 1 referido se activa → **+500 pts**
- [ ] Conecta 7 días seguidos → **+400 pts**
- **RECOMPENSA:** 1 mes Premium GRATIS

---

## 📈 TABLA DE PROGRESIÓN COMPLETA

### **Ejemplo: Usuario "Wacko" - 90 días de beta:**

| Actividad | Frecuencia | Pts/Unidad | Total Puntos |
|-----------|-----------|-----------|--------------|
| **Login 10+ min** | 90 días | 25 | 2,250 |
| **Racha 30 días** | 3 veces | 1,000 | 3,000 |
| **Racha 90 días** | 1 vez | 5,000 | 5,000 |
| **Posts creados** | 50 posts | 15-40 | 1,250 |
| **Likes recibidos** | 500 likes | 50-500 | 2,000 |
| **Comentarios** | 100 | 10 | 1,000 |
| **Likes dados** | 500 | 2 | 1,000 |
| **Referidos activos** | 5 | 500 | 2,500 |
| **Bonus 5 referidos** | 1 | 1,000 | 1,000 |
| **Misiones completadas** | 12 | 200-500 | 4,000 |
| **TOTAL** | - | - | **23,000 pts** |

**Resultado:** 💎 **Nivel DIAMANTE**
- 10,000 CMPX tokens
- 6 meses VIP gratis
- 30% descuento vitalicio
- Badge "Diamond Founder"
- Revenue share 2%

---

## 🔒 REQUISITOS MÍNIMOS PARA BENEFICIOS

### **Para calificar como Beta-Tester oficial:**

Debes cumplir **AL MENOS 3 de 5:**

1. ✅ **Constancia:** 30+ días activo (racha mínima 7 días)
2. ✅ **Creación:** 20+ posts/fotos publicados
3. ✅ **Engagement:** 100+ interacciones (likes/comentarios)
4. ✅ **Social:** 10+ matches o conexiones reales
5. ✅ **Embajador:** 2+ referidos activos

**Si NO cumples requisitos:**
- ❌ No recibes beneficios post-beta
- ⚠️ Cuenta pasa a plan FREE estándar
- 💡 Puedes upgrade pagando

---

## 💰 CONVERSIÓN PUNTOS → BENEFICIOS

### **Al finalizar beta (90 días):**

```typescript
interface BetaRewards {
  user_id: string;
  total_points: number;
  level: 'bronze' | 'silver' | 'gold' | 'diamond';
  rewards: {
    cmpx_tokens: number;
    premium_months: number;
    vip_months: number;
    lifetime_discount: number;  // 0.10 = 10%
    badge: string;
    special_perks: string[];
  };
}

// Calcular recompensas finales
function calculateBetaRewards(points: number): BetaRewards {
  if (points >= 10000) {
    return {
      level: 'diamond',
      rewards: {
        cmpx_tokens: 10000,
        premium_months: 0,
        vip_months: 6,
        lifetime_discount: 0.30,
        badge: '💎 Diamond Founder',
        special_perks: ['revenue_share_2%', 'early_access', 'priority_support']
      }
    };
  }
  
  if (points >= 3000) {
    return {
      level: 'gold',
      rewards: {
        cmpx_tokens: 5000,
        premium_months: 3,
        vip_months: 0,
        lifetime_discount: 0.20,
        badge: '🥇 Gold Pioneer',
        special_perks: ['early_access', 'priority_support']
      }
    };
  }
  
  if (points >= 1000) {
    return {
      level: 'silver',
      rewards: {
        cmpx_tokens: 1500,
        premium_months: 1,
        vip_months: 0,
        lifetime_discount: 0.10,
        badge: '🥈 Silver Contributor',
        special_perks: ['early_access']
      }
    };
  }
  
  // Bronze (mínimo)
  return {
    level: 'bronze',
    rewards: {
      cmpx_tokens: 500,
      premium_months: 0,
      vip_months: 0,
      lifetime_discount: 0,
      badge: '🥉 Bronze Tester',
      special_perks: []
    }
  };
}
```

---

## 📊 DASHBOARD DE PROGRESO PARA USUARIOS

### **UI Sugerida:**

```typescript
interface UserProgress {
  current_level: string;
  current_points: number;
  next_level: string;
  points_to_next_level: number;
  progress_percentage: number;
  
  // Breakdown por categoría
  points_breakdown: {
    daily_activity: number;
    referrals: number;
    content_creation: number;
    engagement: number;
    missions: number;
  };
  
  // Stats
  stats: {
    streak_days: number;
    total_posts: number;
    total_likes_received: number;
    active_referrals: number;
    missions_completed: number;
  };
}
```

**Ejemplo de visualización:**
```
🏆 TU PROGRESO BETA

Nivel Actual: 🥇 ORO
Puntos: 5,234 / 10,000
Progreso: ████████░░ 52%

DESGLOSE:
├─ Constancia:     2,100 pts (40%)
├─ Referidos:      1,500 pts (29%)
├─ Contenido:        834 pts (16%)
├─ Engagement:       600 pts (11%)
└─ Misiones:         200 pts (4%)

🎯 SIGUIENTE NIVEL: 💎 DIAMANTE
Necesitas: 4,766 pts más

💡 SUGERENCIAS PARA SUBIR:
- Invita 3 amigos (+1,500 pts)
- Mantén racha 30 días (+1,000 pts)
- Crea 20 posts más (+400 pts)
```

---

## 🚨 ANTI-GAMING / PREVENCIÓN DE TRAMPAS

### **Reglas de Validación:**

1. **Límites diarios** para evitar spam
2. **Detección de bots** (patrones sospechosos)
3. **Validación humana** (hCaptcha en acciones clave)
4. **Referidos falsos** (verificar actividad real)
5. **Likes/comentarios** en masa → Ban temporal

```typescript
// Sistema anti-cheating
interface CheatDetection {
  user_id: string;
  suspicious_patterns: string[];
  risk_score: number;  // 0-100
  actions_taken: string[];
}

// Detectar patrones sospechosos
function detectCheating(user: User): CheatDetection {
  const patterns = [];
  let riskScore = 0;
  
  // Patrón 1: Demasiados likes muy rápido
  if (user.likes_last_hour > 100) {
    patterns.push('excessive_likes');
    riskScore += 30;
  }
  
  // Patrón 2: Referidos que nunca vuelven
  if (user.referrals_inactive_rate > 0.8) {
    patterns.push('fake_referrals');
    riskScore += 40;
  }
  
  // Patrón 3: Posts idénticos repetidos
  if (user.duplicate_content_rate > 0.5) {
    patterns.push('spam_content');
    riskScore += 50;
  }
  
  // Acciones según riesgo
  const actions = [];
  if (riskScore >= 70) {
    actions.push('ban_7_days');
    actions.push('points_reset');
  } else if (riskScore >= 40) {
    actions.push('warning');
    actions.push('points_review');
  }
  
  return { user_id: user.id, suspicious_patterns: patterns, risk_score: riskScore, actions_taken: actions };
}
```

---

## 📧 COMUNICACIÓN CON USUARIOS

### **Email Semanal de Progreso:**

```
Asunto: 🎯 Tu progreso semanal en ComplicesConecta

Hola Wacko,

Esta semana ganaste: +450 puntos 🎉

RESUMEN:
✅ Conectaste 7 días seguidos (+200 pts)
✅ Invitaste 2 amigos (+200 pts)
✅ Creaste 3 posts (+50 pts)

🏆 Nivel actual: 🥇 ORO (5,234 pts)
🎯 Siguiente nivel: 💎 DIAMANTE (4,766 pts faltan)

💡 CONSEJOS PARA ESTA SEMANA:
- Completa la misión "Embajador" (+1,500 pts)
- Mantén tu racha diaria (bonus +1,000 pts)

¡Sigue así! 🚀
```

---

## 🎬 IMPLEMENTACIÓN: PRÓXIMOS PASOS

### **Fase 1 (Inmediata):**
1. Crear `src/services/RewardsService.ts`
2. Crear `src/services/PointsCalculator.ts`
3. Tabla Supabase: `user_points`, `user_activities`, `missions`
4. UI: Dashboard de progreso
5. Sistema de tracking automático

### **Fase 2 (Semana 2):**
6. Sistema de misiones semanales
7. Notificaciones push (logros desbloqueados)
8. Leaderboard público (top 10 beta-testers)
9. Sistema anti-cheating

### **Fase 3 (Final de Beta):**
10. Calcular recompensas finales
11. Acreditar tokens y beneficios
12. Enviar badges y certificados
13. Activar descuentos vitalicios

---

## 💎 VALOR TOTAL DE BENEFICIOS

### **Usuario Diamante (10,000 pts):**
```
- 10,000 CMPX tokens:           $500 USD
- 6 meses VIP:                  $360 USD
- 30% descuento vitalicio:      ~$2,000 USD (5 años)
- Revenue share 2%:             Variable (potencial $100+/mes)
─────────────────────────────────────────
VALOR TOTAL:                    ~$3,000+ USD

COSTO PARA LA APP:              
- Tokens (costo real):          $0 (virtuales)
- VIP 6 meses:                  $0 (digital)
- Descuento 30%:                -$600 ingresos/año
─────────────────────────────────────────
ROI:                            Usuario leal = $200 LTV/año
```

---

## ✅ RESUMEN EJECUTIVO

### **Ventajas del Sistema:**
✅ Usuarios se ganan beneficios (no regalados)  
✅ Fomenta constancia y actividad real  
✅ Expansión viral por referidos  
✅ Contenido generado por usuarios  
✅ Comunidad comprometida desde día 1  
✅ Prevención de free-riders  

### **Métricas Esperadas:**
- 60% usuarios alcanzan Bronze (mínimo)
- 30% usuarios alcanzan Silver/Gold
- 10% usuarios alcanzan Diamond (súper users)

---

**¿Implementamos el RewardsService AHORA, Wacko? 🚀**

_Documento creado: 16 Nov 2025_  
_Por: Cascade_  
_Para: Wacko - Sistema Justo de Recompensas_
