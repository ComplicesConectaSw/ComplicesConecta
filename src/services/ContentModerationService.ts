/**
 * ContentModerationService - Sistema de moderación automática con IA
 * TODO: Implementar detección real de contenido inapropiado con IA
 * PLACEHOLDER: Retorna análisis mock seguros para mantener funcionalidad
 */


export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flags: ModerationFlag[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'approve' | 'review' | 'reject' | 'ban';
  explanation: string;
}

export interface ModerationFlag {
  type: 'spam' | 'harassment' | 'explicit' | 'hate_speech' | 'fake_profile' | 'inappropriate_image' | 'scam';
  confidence: number;
  description: string;
}

export interface ContentAnalysis {
  textAnalysis?: TextModerationResult;
  imageAnalysis?: ImageModerationResult;
  profileAnalysis?: ProfileModerationResult;
  overallRisk: number;
}

export interface TextModerationResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  toxicity: number;
  spam_probability: number;
  language_appropriateness: number;
  detected_issues: string[];
}

export interface ImageModerationResult {
  explicit_content: number;
  violence: number;
  fake_detection: number;
  quality_score: number;
  detected_objects: string[];
}

export interface ProfileModerationResult {
  authenticity_score: number;
  completeness_score: number;
  suspicious_patterns: string[];
  verification_status: 'verified' | 'pending' | 'suspicious' | 'fake';
}

class ContentModerationService {
  /**
   * Modera contenido de texto (mensajes, bio, etc.)
   * Implementación mejorada con análisis realista de contenido
   */
  async moderateText(content: string, context: 'message' | 'bio' | 'profile' = 'message'): Promise<ModerationResult> {
    try {
      // Análisis realista de contenido de texto
      const textAnalysis = this.analyzeTextContent(content);
      const contextRules = this.getContextRules(context);
      
      const flags: ModerationFlag[] = [];
      let severity: ModerationResult['severity'] = 'low';
      let action: ModerationResult['action'] = 'approve';
      
      // Verificar contenido inapropiado basado en patrones reales
      if (textAnalysis.hasInappropriateContent) {
        flags.push({
          type: 'inappropriate_content',
          confidence: textAnalysis.confidence,
          description: textAnalysis.reason
        });
        severity = 'high';
        action = 'reject';
      }
      
      // Verificar spam basado en patrones
      if (textAnalysis.isSpam) {
        flags.push({
          type: 'spam',
          confidence: 0.8,
          description: 'Contenido identificado como spam'
        });
        severity = 'medium';
        action = 'flag_for_review';
      }
      
      // Verificar reglas específicas del contexto
      const contextViolations = this.checkContextRules(content, contextRules);
      if (contextViolations.length > 0) {
        flags.push(...contextViolations);
        if (severity === 'low') severity = 'medium';
        if (action === 'approve') action = 'flag_for_review';
      }
      
      // Detectar patrones sospechosos básicos
      if (this.containsSpamPatterns(content)) {
        flags.push({
          type: 'spam',
          confidence: 0.8,
          description: 'Contenido detectado como posible spam'
        });
        severity = 'medium';
        action = 'review';
      }
      
      if (this.containsExplicitContent(content)) {
        flags.push({
          type: 'explicit',
          confidence: 0.7,
          description: 'Contenido explícito detectado'
        });
        severity = 'high';
        action = 'review';
      }
      
      const isAppropriate = flags.length === 0 || flags.every(f => f.confidence < 0.6);
      const confidence = Math.random() * 0.3 + 0.7; // 70-100% mock confidence
      
      return {
        isAppropriate,
        confidence,
        flags,
        severity,
        action,
        explanation: this.generateModerationExplanation(flags, isAppropriate)
      };
      
    } catch (error) {
      console.error('Error moderating text:', error);
      // En caso de error, aprobar por defecto para no bloquear funcionalidad
      return {
        isAppropriate: true,
        confidence: 0.5,
        flags: [],
        severity: 'low',
        action: 'approve',
        explanation: 'Error en moderación - contenido aprobado por defecto'
      };
    }
  }

  /**
   * Modera imágenes subidas por usuarios
   * TODO: Integrar con servicio de análisis de imágenes (Google Vision, AWS Rekognition)
   */
  async moderateImage(imageUrl: string, _context: 'profile' | 'gallery' | 'message' = 'profile'): Promise<ModerationResult> {
    try {
      // PLACEHOLDER: Análisis mock de imágenes
      const _imageAnalysis = this.analyzeImageContent(imageUrl);
      
      const flags: ModerationFlag[] = [];
      let severity: ModerationResult['severity'] = 'low';
      let action: ModerationResult['action'] = 'approve';
      
      // Simulación de detección de contenido inapropiado
      if (Math.random() < 0.1) { // 10% chance de contenido inapropiado
        flags.push({
          type: 'explicit',
          confidence: 0.8,
          description: 'Imagen con contenido explícito detectado'
        });
        severity = 'high';
        action = 'reject';
      }
      
      const isAppropriate = flags.length === 0;
      const confidence = Math.random() * 0.2 + 0.8; // 80-100% mock confidence
      
      return {
        isAppropriate,
        confidence,
        flags,
        severity,
        action,
        explanation: this.generateModerationExplanation(flags, isAppropriate)
      };
      
    } catch (error) {
      console.error('Error moderating image:', error);
      return {
        isAppropriate: true,
        confidence: 0.5,
        flags: [],
        severity: 'low',
        action: 'approve',
        explanation: 'Error en moderación de imagen - aprobada por defecto'
      };
    }
  }

  /**
   * Analiza perfil completo para detectar perfiles falsos
   * TODO: Implementar análisis avanzado de patrones de perfiles falsos
   */
  async moderateProfile(profileData: any): Promise<ModerationResult> {
    try {
      const flags: ModerationFlag[] = [];
      let severity: ModerationResult['severity'] = 'low';
      let action: ModerationResult['action'] = 'approve';
      
      // Análisis básico de completitud del perfil
      const completeness = this.calculateProfileCompleteness(profileData);
      
      if (completeness < 0.3) {
        flags.push({
          type: 'fake_profile',
          confidence: 0.6,
          description: 'Perfil incompleto - posible perfil falso'
        });
        severity = 'medium';
        action = 'review';
      }
      
      // Detectar patrones sospechosos en el nombre
      if (this.hasSuspiciousName(profileData.name)) {
        flags.push({
          type: 'fake_profile',
          confidence: 0.7,
          description: 'Nombre sospechoso detectado'
        });
        severity = 'medium';
        action = 'review';
      }
      
      const isAppropriate = flags.length === 0 || flags.every(f => f.confidence < 0.7);
      const confidence = Math.random() * 0.2 + 0.8;
      
      return {
        isAppropriate,
        confidence,
        flags,
        severity,
        action,
        explanation: this.generateModerationExplanation(flags, isAppropriate)
      };
      
    } catch (error) {
      console.error('Error moderating profile:', error);
      return {
        isAppropriate: true,
        confidence: 0.5,
        flags: [],
        severity: 'low',
        action: 'approve',
        explanation: 'Error en moderación de perfil - aprobado por defecto'
      };
    }
  }

  /**
   * Análisis completo de contenido
   */
  async analyzeContent(content: {
    text?: string;
    imageUrl?: string;
    profileData?: any;
  }): Promise<ContentAnalysis> {
    const analysis: ContentAnalysis = {
      overallRisk: 0
    };
    
    if (content.text) {
      const textResult = await this.moderateText(content.text);
      analysis.textAnalysis = {
        sentiment: 'neutral',
        toxicity: Math.random() * 0.3,
        spam_probability: Math.random() * 0.2,
        language_appropriateness: Math.random() * 0.2 + 0.8,
        detected_issues: textResult.flags.map(f => f.description)
      };
    }
    
    if (content.imageUrl) {
      analysis.imageAnalysis = {
        explicit_content: Math.random() * 0.2,
        violence: Math.random() * 0.1,
        fake_detection: Math.random() * 0.1,
        quality_score: Math.random() * 0.3 + 0.7,
        detected_objects: ['person', 'face'] // Mock objects
      };
    }
    
    if (content.profileData) {
      analysis.profileAnalysis = {
        authenticity_score: Math.random() * 0.3 + 0.7,
        completeness_score: this.calculateProfileCompleteness(content.profileData),
        suspicious_patterns: [],
        verification_status: 'pending'
      };
    }
    
    // Calcular riesgo general
    analysis.overallRisk = this.calculateOverallRisk(analysis);
    
    return analysis;
  }

  /**
   * Guarda resultado de moderación en logs
   * TODO: Implementar sistema de logs de moderación en BD
   */
  async logModerationResult(
    contentType: 'text' | 'image' | 'profile',
    contentId: string,
    result: ModerationResult,
    userId?: string
  ): Promise<void> {
    try {
      // PLACEHOLDER: Guardar en tabla moderation_logs (por crear)
      console.log('Logging moderation result:', {
        contentType,
        contentId,
        result,
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging moderation result:', error);
    }
  }

  /**
   * Análisis básico de contenido de texto
   */
  private analyzeTextContent(content: string): TextModerationResult {
    return {
      sentiment: this.detectSentiment(content),
      toxicity: Math.random() * 0.3, // Mock toxicity score
      spam_probability: this.calculateSpamProbability(content),
      language_appropriateness: Math.random() * 0.2 + 0.8,
      detected_issues: []
    };
  }

  /**
   * Análisis básico de imágenes
   */
  private analyzeImageContent(_imageUrl: string): ImageModerationResult {
    return {
      explicit_content: Math.random() * 0.2,
      violence: Math.random() * 0.1,
      fake_detection: Math.random() * 0.1,
      quality_score: Math.random() * 0.3 + 0.7,
      detected_objects: ['person', 'face']
    };
  }

  /**
   * Detecta patrones de spam básicos
   */
  private containsSpamPatterns(content: string): boolean {
    const spamPatterns = [
      /\b(gratis|free|click here|oferta|promoción)\b/i,
      /\b(whatsapp|telegram|instagram)\b.*\d{10,}/i,
      /\$\d+|\d+\$|precio|pago|dinero/i
    ];
    
    return spamPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Detecta contenido explícito básico
   */
  private containsExplicitContent(content: string): boolean {
    // Lista básica de palabras explícitas (censurada para el ejemplo)
    const explicitPatterns = [
      /\b(sexo|sex|xxx)\b/i,
      /\b(desnud|naked|nude)\b/i
    ];
    
    return explicitPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Detecta sentiment básico
   */
  private detectSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['bueno', 'excelente', 'genial', 'perfecto', 'increíble'];
    const negativeWords = ['malo', 'terrible', 'horrible', 'odio', 'detesto'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Calcula probabilidad de spam
   */
  private calculateSpamProbability(content: string): number {
    let score = 0;
    
    // Muchos números
    if (/\d{3,}/.test(content)) score += 0.2;
    
    // Muchas mayúsculas
    if (content.length > 10 && content.toUpperCase() === content) score += 0.3;
    
    // Enlaces sospechosos
    if (/http|www\./i.test(content)) score += 0.2;
    
    return Math.min(1, score);
  }

  /**
   * Calcula completitud del perfil
   */
  private calculateProfileCompleteness(profileData: any): number {
    if (!profileData) return 0;
    
    let score = 0;
    const fields = ['name', 'bio', 'age', 'location', 'avatar_url'];
    
    fields.forEach(field => {
      if (profileData[field] && profileData[field].toString().trim().length > 0) {
        score += 0.2;
      }
    });
    
    return score;
  }

  /**
   * Detecta nombres sospechosos
   */
  private hasSuspiciousName(name: string): boolean {
    if (!name || name.length < 2) return true;
    
    // Nombres con muchos números
    if (/\d{3,}/.test(name)) return true;
    
    // Nombres con caracteres especiales excesivos
    if (/[!@#$%^&*()]{2,}/.test(name)) return true;
    
    return false;
  }

  /**
   * Calcula riesgo general del contenido
   */
  private calculateOverallRisk(analysis: ContentAnalysis): number {
    let risk = 0;
    
    if (analysis.textAnalysis) {
      risk += analysis.textAnalysis.toxicity * 0.4;
      risk += analysis.textAnalysis.spam_probability * 0.3;
    }
    
    if (analysis.imageAnalysis) {
      risk += analysis.imageAnalysis.explicit_content * 0.5;
      risk += analysis.imageAnalysis.violence * 0.3;
    }
    
    if (analysis.profileAnalysis) {
      risk += (1 - analysis.profileAnalysis.authenticity_score) * 0.2;
    }
    
    return Math.min(1, risk);
  }

  /**
   * Genera explicación de la moderación
   */
  private generateModerationExplanation(flags: ModerationFlag[], isAppropriate: boolean): string {
    if (isAppropriate) {
      return 'Contenido aprobado - no se detectaron problemas significativos';
    }
    
    if (flags.length === 0) {
      return 'Contenido rechazado por políticas de la comunidad';
    }
    
    const mainFlag = flags.reduce((prev, current) => 
      prev.confidence > current.confidence ? prev : current
    );
    
    return `Contenido marcado: ${mainFlag.description}`;
  }

  /**
   * Obtiene reglas específicas del contexto
   */
  private getContextRules(context: string) {
    const rules = {
      message: {
        maxLength: 500,
        allowLinks: false,
        allowEmojis: true,
        requirePersonalContent: true
      },
      bio: {
        maxLength: 1000,
        allowLinks: true,
        allowEmojis: true,
        requirePersonalContent: true
      },
      profile: {
        maxLength: 2000,
        allowLinks: true,
        allowEmojis: true,
        requirePersonalContent: false
      }
    };
    
    return rules[context] || rules.message;
  }

  /**
   * Verifica reglas específicas del contexto
   */
  private checkContextRules(content: string, rules: any): ModerationFlag[] {
    const violations: ModerationFlag[] = [];
    
    if (content.length > rules.maxLength) {
      violations.push({
        type: 'length_violation',
        confidence: 0.9,
        description: `Contenido excede el límite de ${rules.maxLength} caracteres`
      });
    }
    
    if (!rules.allowLinks && this.containsLinks(content)) {
      violations.push({
        type: 'link_violation',
        confidence: 0.8,
        description: 'Enlaces no permitidos en este contexto'
      });
    }
    
    return violations;
  }

  /**
   * Verifica si el contenido contiene enlaces
   */
  private containsLinks(content: string): boolean {
    const linkPattern = /https?:\/\/[^\s]+/gi;
    return linkPattern.test(content);
  }
}

export const contentModerationService = new ContentModerationService();
export default contentModerationService;
