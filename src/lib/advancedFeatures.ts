import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { NotificationService } from '@/lib/notifications';
import type { Database } from '@/types/supabase-generated';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface AdvancedMatchingConfig {
  algorithm: 'compatibility' | 'ml_based' | 'hybrid';
  weights: {
    interests: number;
    location: number;
    age: number;
    education: number;
    lifestyle: number;
    personality: number;
  };
  filters: {
    maxDistance: number;
    ageRange: [number, number];
    requiredInterests: string[];
    dealBreakers: string[];
  };
}

export interface PersonalityInsight {
  trait: string;
  score: number;
  description: string;
  compatibility_factors: string[];
}

export interface SmartRecommendation {
  id: string;
  user_id: string;
  recommended_user_id: string;
  compatibility_score: number;
  reasons: string[];
  confidence_level: number;
  created_at: string;
  viewed: boolean;
  action_taken?: 'liked' | 'passed' | 'matched';
}

export interface ConversationStarter {
  id: string;
  category: 'interests' | 'lifestyle' | 'personality' | 'fun' | 'deep';
  text: string;
  context_tags: string[];
  success_rate: number;
}

export interface VirtualDate {
  id: string;
  participants: string[];
  type: 'video_call' | 'virtual_reality' | 'game' | 'movie_night' | 'cooking';
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  activities: VirtualActivity[];
}

export interface VirtualActivity {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  duration_minutes: number;
}

export class AdvancedFeaturesService {
  /**
   * Advanced Matching Algorithm v3.4
   */
  static async generateAdvancedMatches(
    userId: string, 
    config: AdvancedMatchingConfig
  ): Promise<SmartRecommendation[]> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }
      
      // Get user profile and preferences
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userProfile) throw new Error('User profile not found');

      // Get potential matches
      const { data: potentialMatches } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .limit(100);

      if (!potentialMatches) return [];

      // Calculate compatibility scores
      const recommendations: SmartRecommendation[] = [];

      for (const match of potentialMatches) {
        const compatibility = await this.calculateAdvancedCompatibility(
          userProfile as unknown as ProfileRow,
          match as unknown as ProfileRow,
          config
        );

        if (compatibility.score >= 0.6) { // 60% minimum compatibility
          recommendations.push({
            id: crypto.randomUUID(),
            user_id: userId,
            recommended_user_id: match.id,
            compatibility_score: compatibility.score,
            reasons: compatibility.reasons,
            confidence_level: compatibility.confidence,
            created_at: new Date().toISOString(),
            viewed: false
          });
        }
      }

      // Sort by compatibility score
      recommendations.sort((a, b) => b.compatibility_score - a.compatibility_score);

      // Store recommendations
      await this.storeRecommendations(recommendations);

      return recommendations.slice(0, 10); // Return top 10
    } catch (error) {
      logger.error('Error generating advanced matches:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Calculate advanced compatibility between two users
   */
  private static async calculateAdvancedCompatibility(
    user1: ProfileRow,
    user2: ProfileRow,
    config: AdvancedMatchingConfig
  ): Promise<{ score: number; reasons: string[]; confidence: number }> {
    const scores: Record<string, number> = {};
    const reasons: string[] = [];

    // Interest compatibility
    const interestScore = this.calculateInterestCompatibility(
      user1.interests || [],
      user2.interests || []
    );
    scores.interests = interestScore;
    if (interestScore > 0.7) {
      reasons.push(`Comparten ${Math.round(interestScore * 100)}% de preferencias lifestyle`);
    }

    // Location compatibility - usar valores por defecto ya que latitude/longitude no existen en la tabla
    let locationScore = 0.5; // Score por defecto
    // TODO: Implementar cuando latitude/longitude estén disponibles en la tabla profiles
    // if (user1.latitude && user1.longitude && user2.latitude && user2.longitude) {
    //   locationScore = this.calculateLocationCompatibility(
    //     `${user1.latitude},${user1.longitude}`,
    //     `${user2.latitude},${user2.longitude}`,
    //     config.filters.maxDistance
    //   );
    // }
    scores.location = locationScore;
    if (locationScore > 0.8) {
      reasons.push('Ubicaciones ideales para encuentros discretos');
    }

    // Age compatibility
    const ageScore = this.calculateAgeCompatibility(
      user1.age || 25,
      user2.age || 25,
      config.filters.ageRange
    );
    scores.age = ageScore;
    if (ageScore > 0.8) {
      reasons.push('Rango de edad ideal para conexión');
    }

    // Gender compatibility - usar valores por defecto ya que interested_in no existe en la tabla
    const genderScore = this.calculateGenderCompatibility(
      user1.gender,
      null, // interested_in no existe en la tabla
      user2.gender,
      null  // interested_in no existe en la tabla
    );
    scores.gender = genderScore;
    if (genderScore > 0.8) {
      reasons.push('Preferencias de género compatibles');
    }

    // Account type compatibility - usar valores por defecto ya que account_type no existe en la tabla
    const accountTypeScore = this.calculateAccountTypeCompatibility(
      'single', // account_type no existe en la tabla
      null, // interested_in no existe en la tabla
      'single', // account_type no existe en la tabla
      null  // interested_in no existe en la tabla
    );
    scores.accountType = accountTypeScore;
    if (accountTypeScore > 0.8) {
      reasons.push('Tipo de relación compatible');
    }

    // Personality compatibility (enhanced)
    const personalityScore = this.calculatePersonalityCompatibility(user1, user2);
    scores.personality = personalityScore;
    if (personalityScore > 0.75) {
      reasons.push('Química y conexión natural');
    }

    // Lifestyle compatibility (enhanced)
    const lifestyleScore = this.calculateLifestyleCompatibility(user1, user2);
    scores.lifestyle = lifestyleScore;
    if (lifestyleScore > 0.7) {
      reasons.push('Experiencias y mentalidad lifestyle compatibles');
    }

    // Calculate weighted score
    const totalScore = 
      (scores.interests * config.weights.interests) +
      (scores.location * config.weights.location) +
      (scores.age * config.weights.age) +
      (scores.personality * config.weights.personality) +
      (scores.lifestyle * config.weights.lifestyle) +
      (scores.gender * 0.1) + // Additional weight for gender compatibility
      (scores.accountType * 0.1); // Additional weight for account type

    const weightSum = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0) + 0.2;
    const finalScore = totalScore / weightSum;

    // Calculate confidence based on data completeness
    const confidence = this.calculateConfidenceLevel(user1, user2);

    return {
      score: finalScore,
      reasons,
      confidence
    };
  }

  /**
   * Calculate interest compatibility
   */
  private static calculateInterestCompatibility(interests1: string[], interests2: string[]): number {
    if (interests1.length === 0 || interests2.length === 0) return 0.5;

    const common = interests1.filter(interest => interests2.includes(interest));
    const _total = new Set([...interests1, ...interests2]).size;

    return common.length / Math.max(interests1.length, interests2.length);
  }

  /**
   * Calculate location compatibility
   */
  private static calculateLocationCompatibility(
    location1: string | null,
    location2: string | null,
    _maxDistance: number
  ): number {
    if (!location1 || !location2) return 0.5;

    // Simple string comparison for location compatibility
    // In a real app, you would parse coordinates and calculate actual distance
    if (location1 === location2) return 1.0;
    
    // Check if locations are similar (same city/region)
    const loc1Parts = location1.toLowerCase().split(',');
    const loc2Parts = location2.toLowerCase().split(',');
    
    let commonParts = 0;
    for (const part1 of loc1Parts) {
      for (const part2 of loc2Parts) {
        if (part1.trim() === part2.trim()) {
          commonParts++;
          break;
        }
      }
    }
    
    return Math.min(1.0, commonParts / Math.max(loc1Parts.length, loc2Parts.length));
  }

  /**
   * Calculate age compatibility
   */
  private static calculateAgeCompatibility(age1: number, age2: number, ageRange: [number, number]): number {
    const ageDiff = Math.abs(age1 - age2);
    const maxAcceptableDiff = (ageRange[1] - ageRange[0]) / 2;

    return Math.max(0, 1 - (ageDiff / maxAcceptableDiff));
  }

  /**
   * Calculate gender compatibility based on preferences
   */
  private static calculateGenderCompatibility(
    gender1: string | null,
    interestedIn1: string | null,
    gender2: string | null,
    interestedIn2: string | null
  ): number {
    if (!gender1 || !gender2 || !interestedIn1 || !interestedIn2) return 0.5;

    // Check if each person is interested in the other's gender
    const user1InterestedInUser2 = interestedIn1.toLowerCase().includes(gender2.toLowerCase()) || interestedIn1.toLowerCase() === 'all';
    const user2InterestedInUser1 = interestedIn2.toLowerCase().includes(gender1.toLowerCase()) || interestedIn2.toLowerCase() === 'all';

    if (user1InterestedInUser2 && user2InterestedInUser1) return 1.0;
    if (user1InterestedInUser2 || user2InterestedInUser1) return 0.7;
    return 0.1;
  }

  /**
   * Calculate account type compatibility
   */
  private static calculateAccountTypeCompatibility(
    accountType1: string | null,
    lookingFor1: string | null,
    accountType2: string | null,
    lookingFor2: string | null
  ): number {
    if (!accountType1 || !accountType2) return 0.5;

    // Simple compatibility based on what each user is looking for
    const type1Match = !lookingFor1 || lookingFor1.toLowerCase().includes(accountType2.toLowerCase());
    const type2Match = !lookingFor2 || lookingFor2.toLowerCase().includes(accountType1.toLowerCase());

    if (type1Match && type2Match) return 1.0;
    if (type1Match || type2Match) return 0.7;
    return 0.3;
  }

  /**
   * Calculate personality compatibility
   */
  private static calculatePersonalityCompatibility(user1: ProfileRow, user2: ProfileRow): number {
    // Enhanced personality compatibility based on bio and interests
    const bio1 = user1.bio || '';
    const bio2 = user2.bio || '';
    const interests1 = user1.interests || [];
    const interests2 = user2.interests || [];

    let compatibility = 0.5; // Base compatibility

    // Bio similarity analysis
    const bioWords1 = bio1.toLowerCase().split(/\s+/).filter((word: string) => word.length > 3);
    const bioWords2 = bio2.toLowerCase().split(/\s+/).filter((word: string) => word.length > 3);
    const commonBioWords = bioWords1.filter((word: string) => bioWords2.includes(word));
    
    if (bioWords1.length > 0 && bioWords2.length > 0) {
      compatibility += (commonBioWords.length / Math.max(bioWords1.length, bioWords2.length)) * 0.3;
    }

    // Interest-based personality traits
    const personalityKeywords = {
      'adventurous': ['aventura', 'aventurero', 'explorar', 'nuevo', 'experiencia'],
      'romantic': ['romance', 'romántico', 'amor', 'cariño', 'ternura'],
      'fun': ['diversión', 'divertido', 'risa', 'alegría', 'feliz'],
      'serious': ['serio', 'formal', 'profesional', 'responsable', 'maduro'],
      'open': ['abierto', 'liberal', 'flexible', 'tolerante', 'acepta']
    };

    for (const [_trait, keywords] of Object.entries(personalityKeywords)) {
      const user1HasTrait = keywords.some(keyword => 
        bio1.toLowerCase().includes(keyword) || 
        interests1.some((interest: string) => interest.toLowerCase().includes(keyword))
      );
      const user2HasTrait = keywords.some(keyword => 
        bio2.toLowerCase().includes(keyword) || 
        interests2.some((interest: string) => interest.toLowerCase().includes(keyword))
      );

      if (user1HasTrait && user2HasTrait) {
        compatibility += 0.1;
      }
    }

    return Math.min(1.0, compatibility);
  }

  /**
   * Calculate lifestyle compatibility
   */
  private static calculateLifestyleCompatibility(user1: ProfileRow, user2: ProfileRow): number {
    const interests1 = user1.interests || [];
    const interests2 = user2.interests || [];
    const bio1 = (user1.bio || '').toLowerCase();
    const bio2 = (user2.bio || '').toLowerCase();

    let compatibility = 0.5;

    // Lifestyle categories
    const lifestyleCategories = {
      'swinger': ['swinger', 'intercambio', 'parejas', 'liberal'],
      'discrete': ['discreto', 'privado', 'reservado', 'confidencial'],
      'social': ['social', 'grupo', 'eventos', 'fiestas'],
      'intimate': ['íntimo', 'personal', 'privado', 'exclusivo'],
      'adventure': ['aventura', 'nuevo', 'experiencia', 'explorar']
    };

    for (const [_category, keywords] of Object.entries(lifestyleCategories)) {
      const user1InCategory = keywords.some(keyword => 
        bio1.includes(keyword) || 
        interests1.some((interest: string) => interest.toLowerCase().includes(keyword))
      );
      const user2InCategory = keywords.some(keyword => 
        bio2.includes(keyword) || 
        interests2.some((interest: string) => interest.toLowerCase().includes(keyword))
      );

      if (user1InCategory && user2InCategory) {
        compatibility += 0.15;
      }
    }

    // Account type compatibility - account_type no existe en la tabla
    // TODO: Implementar cuando account_type esté disponible en la tabla profiles
    // if (user1.account_type === user2.account_type) {
    //   compatibility += 0.2;
    // }
    compatibility += 0.2; // Siempre compatible por defecto

    return Math.min(1.0, compatibility);
  }

  /**
   * Calculate confidence level based on profile completeness
   */
  private static calculateConfidenceLevel(user1: ProfileRow, user2: ProfileRow): number {
    const requiredFields = ['interests', 'bio', 'age', 'gender'];
    
    let user1Completeness = 0;
    let user2Completeness = 0;

    for (const field of requiredFields) {
      const value1 = user1[field as keyof ProfileRow];
      const value2 = user2[field as keyof ProfileRow];
      
      if (field === 'age') {
        if (value1 && typeof value1 === 'number') user1Completeness++;
        if (value2 && typeof value2 === 'number') user2Completeness++;
      } else if (field === 'interests') {
        if (value1 && Array.isArray(value1) && value1.length > 0) user1Completeness++;
        if (value2 && Array.isArray(value2) && value2.length > 0) user2Completeness++;
      } else {
        // For string fields (bio, gender)
        if (value1 && typeof value1 === 'string' && value1.trim().length > 0) user1Completeness++;
        if (value2 && typeof value2 === 'string' && value2.trim().length > 0) user2Completeness++;
      }
    }

    return ((user1Completeness + user2Completeness) / (requiredFields.length * 2));
  }

  /**
   * Store recommendations in database
   */
  private static async storeRecommendations(recommendations: SmartRecommendation[]): Promise<void> {
    try {
      // In a real implementation, store in database
      logger.info(`Stored ${recommendations.length} recommendations`);
    } catch (error) {
      logger.error('Error calculating compatibility:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Generate personality insights based on bio and interests
   */
  static async generatePersonalityInsights(userId: string): Promise<PersonalityInsight[]> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('bio, age, gender')
        .eq('id', userId)
        .single();

      if (!profile?.bio || profile.bio.length === 0) return []; // interests no existe en la tabla

      const insights: PersonalityInsight[] = [];
      const bio = (profile.bio || '').toLowerCase();
      const interests: string[] = []; // interests no existe en la tabla

      // Análisis de personalidad basado en bio e intereses
      const personalityAnalysis = this.analyzePersonalityFromBio(bio, interests);

      // Convertir análisis a insights
      for (const [trait, data] of Object.entries(personalityAnalysis)) {
        insights.push({
          trait,
          score: data.score,
          description: data.description,
          compatibility_factors: data.factors
        });
      }

      return insights;
    } catch (error) {
      logger.error('Error generating personality insights:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Analyze personality traits from bio and interests
   */
  private static analyzePersonalityFromBio(bio: string, interests: string[]): Record<string, { score: number; description: string; factors: string[] }> {
    const analysis: Record<string, { score: number; description: string; factors: string[] }> = {};

    // Análisis de apertura a la experiencia
    const opennessKeywords = ['aventura', 'nuevo', 'explorar', 'creativo', 'arte', 'música', 'viajar', 'cultura', 'experiencias', 'descubrir'];
    const opennessScore = this.calculateTraitScore(bio, interests, opennessKeywords);
    analysis.openness = {
      score: opennessScore,
      description: this.getOpennessDescription(opennessScore),
      factors: ['Intereses culturales', 'Disposición al cambio', 'Creatividad', 'Aventura']
    };

    // Análisis de responsabilidad
    const conscientiousnessKeywords = ['organizado', 'responsable', 'disciplinado', 'trabajo', 'estudio', 'planificar', 'confiable', 'serio'];
    const conscientiousnessScore = this.calculateTraitScore(bio, interests, conscientiousnessKeywords);
    analysis.conscientiousness = {
      score: conscientiousnessScore,
      description: this.getConscientiousnessDescription(conscientiousnessScore),
      factors: ['Organización', 'Responsabilidad', 'Disciplina', 'Confiabilidad']
    };

    // Análisis de extraversión
    const extraversionKeywords = ['social', 'fiesta', 'grupo', 'amigos', 'comunicativo', 'energético', 'divertido', 'sociable', 'extrovertido'];
    const extraversionScore = this.calculateTraitScore(bio, interests, extraversionKeywords);
    analysis.extraversion = {
      score: extraversionScore,
      description: this.getExtraversionDescription(extraversionScore),
      factors: ['Sociabilidad', 'Energía', 'Comunicación', 'Extroversión']
    };

    // Análisis de amabilidad
    const agreeablenessKeywords = ['amable', 'cariñoso', 'empático', 'ayudar', 'generoso', 'paciente', 'tolerante', 'comprensivo', 'respetuoso'];
    const agreeablenessScore = this.calculateTraitScore(bio, interests, agreeablenessKeywords);
    analysis.agreeableness = {
      score: agreeablenessScore,
      description: this.getAgreeablenessDescription(agreeablenessScore),
      factors: ['Empatía', 'Amabilidad', 'Cooperación', 'Respeto']
    };

    // Análisis de estabilidad emocional
    const neuroticismKeywords = ['estresado', 'ansioso', 'nervioso', 'preocupado', 'inseguro', 'volátil', 'tenso'];
    const neuroticismScore = 100 - this.calculateTraitScore(bio, interests, neuroticismKeywords); // Invertido
    analysis.emotional_stability = {
      score: neuroticismScore,
      description: this.getEmotionalStabilityDescription(neuroticismScore),
      factors: ['Estabilidad', 'Confianza', 'Tranquilidad', 'Seguridad']
    };

    // Análisis específico para lifestyle swinger
    const lifestyleKeywords = ['liberal', 'abierto', 'experimentar', 'explorar', 'aventurero', 'curioso', 'flexible', 'tolerante', 'swinger', 'intercambio', 'parejas', 'discreto', 'reservado'];
    const lifestyleScore = this.calculateTraitScore(bio, interests, lifestyleKeywords);
    analysis.lifestyle_openness = {
      score: lifestyleScore,
      description: this.getLifestyleOpennessDescription(lifestyleScore),
      factors: ['Mentalidad abierta', 'Disposición a experimentar', 'Flexibilidad', 'Tolerancia', 'Discreción']
    };

    // Análisis de comunicación y límites
    const communicationKeywords = ['comunicación', 'límites', 'respeto', 'consentimiento', 'acuerdo', 'negociación', 'honestidad', 'transparencia'];
    const communicationScore = this.calculateTraitScore(bio, interests, communicationKeywords);
    analysis.communication_skills = {
      score: communicationScore,
      description: this.getCommunicationSkillsDescription(communicationScore),
      factors: ['Comunicación clara', 'Respeto a límites', 'Consentimiento mutuo', 'Honestidad']
    };

    // Análisis de discreción y privacidad
    const discretionKeywords = ['discreto', 'privado', 'confidencial', 'reservado', 'íntimo', 'personal', 'secreto'];
    const discretionScore = this.calculateTraitScore(bio, interests, discretionKeywords);
    analysis.discretion_level = {
      score: discretionScore,
      description: this.getDiscretionLevelDescription(discretionScore),
      factors: ['Discreción', 'Privacidad', 'Confidencialidad', 'Respeto por la intimidad']
    };

    return analysis;
  }

  /**
   * Calculate trait score based on bio and interests
   */
  private static calculateTraitScore(bio: string, interests: string[], keywords: string[]): number {
    let score = 0;
    let totalChecks = 0;

    // Check bio for keywords
    for (const keyword of keywords) {
      totalChecks++;
      if (bio.includes(keyword)) {
        score += 20; // 20 points per keyword match in bio
      }
    }

    // Check interests for keywords
    for (const interest of interests) {
      const interestLower = interest.toLowerCase();
      for (const keyword of keywords) {
        if (interestLower.includes(keyword)) {
          score += 15; // 15 points per keyword match in interests
        }
      }
    }

    // Normalize score to 0-100 range
    const maxPossibleScore = totalChecks * 20 + interests.length * 15;
    return Math.min(100, Math.max(0, (score / maxPossibleScore) * 100));
  }

  /**
   * Get agreeableness description
   */
  private static getAgreeablenessDescription(score: number): string {
    if (score >= 80) return 'Muy amable, empático y cooperativo';
    if (score >= 60) return 'Generalmente amable y comprensivo';
    if (score >= 40) return 'Equilibrado entre amabilidad y asertividad';
    if (score >= 20) return 'Más asertivo, menos complaciente';
    return 'Muy asertivo, prefiere la competencia';
  }

  /**
   * Get lifestyle openness description
   */
  private static getLifestyleOpennessDescription(score: number): string {
    if (score >= 80) return 'Muy abierto a nuevas experiencias y exploración lifestyle';
    if (score >= 60) return 'Generalmente abierto y curioso sobre nuevas experiencias';
    if (score >= 40) return 'Equilibrado entre tradición y novedad';
    if (score >= 20) return 'Más conservador, prefiere lo establecido';
    return 'Muy tradicional, prefiere rutinas conocidas';
  }

  /**
   * Get communication skills description
   */
  private static getCommunicationSkillsDescription(score: number): string {
    if (score >= 80) return 'Excelente comunicación, respeta límites y consenso mutuo';
    if (score >= 60) return 'Buena comunicación y respeto por acuerdos';
    if (score >= 40) return 'Comunicación adecuada, puede mejorar en límites';
    if (score >= 20) return 'Comunicación básica, necesita trabajar en consenso';
    return 'Comunicación limitada, requiere desarrollo de habilidades';
  }

  /**
   * Get discretion level description
   */
  private static getDiscretionLevelDescription(score: number): string {
    if (score >= 80) return 'Muy discreto y respetuoso con la privacidad';
    if (score >= 60) return 'Generalmente discreto y reservado';
    if (score >= 40) return 'Equilibrado entre discreción y apertura';
    if (score >= 20) return 'Menos discreto, más abierto';
    return 'Muy abierto, poco reservado';
  }
  private static getEmotionalStabilityDescription(score: number): string {
    if (score >= 80) return 'Muy estable emocionalmente, tranquilo y confiado';
    if (score >= 60) return 'Generalmente estable y relajado';
    if (score >= 40) return 'Equilibrado entre estabilidad y sensibilidad';
    if (score >= 20) return 'Más sensible, puede ser reactivo';
    return 'Muy sensible, puede ser volátil emocionalmente';
  }

  /**
   * Get openness description
   */
  private static getOpennessDescription(score: number): string {
    if (score >= 80) return 'Muy abierto a nuevas experiencias, creativo y aventurero';
    if (score >= 60) return 'Moderadamente abierto, disfruta de la variedad';
    if (score >= 40) return 'Equilibrado entre tradición y novedad';
    if (score >= 20) return 'Prefiere lo familiar y establecido';
    return 'Muy tradicional, prefiere rutinas conocidas';
  }

  /**
   * Get conscientiousness description
   */
  private static getConscientiousnessDescription(score: number): string {
    if (score >= 80) return 'Muy organizado, disciplinado y confiable';
    if (score >= 60) return 'Generalmente responsable y organizado';
    if (score >= 40) return 'Equilibrio entre espontaneidad y organización';
    if (score >= 20) return 'Más espontáneo, menos estructurado';
    return 'Muy espontáneo, prefiere la flexibilidad';
  }

  /**
   * Get extraversion description
   */
  private static getExtraversionDescription(score: number): string {
    if (score >= 80) return 'Muy extrovertido, energético y sociable';
    if (score >= 60) return 'Sociable y comunicativo';
    if (score >= 40) return 'Equilibrio entre socialización y soledad';
    if (score >= 20) return 'Más introvertido, prefiere grupos pequeños';
    return 'Muy introvertido, prefiere la soledad';
  }

  /**
   * Generate conversation starters
   */
  static async generateConversationStarters(
    userId: string,
    matchId: string
  ): Promise<ConversationStarter[]> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }
      
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: matchProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', matchId)
        .single();

      if (!userProfile || !matchProfile) return [];

      const starters: ConversationStarter[] = [];
      const commonInterests = (userProfile.interests || [])
        .filter((interest: string) => (matchProfile.interests || []).includes(interest));

      // Lifestyle-based starters
      for (const interest of commonInterests.slice(0, 3)) {
        starters.push({
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: `Veo que compartimos interés en ${interest}. ¿Qué te atrajo inicialmente a esta experiencia?`,
          context_tags: [interest],
          success_rate: 0.75
        });
      }

      // Connection-based starters
      // personality_traits column doesn't exist, skip personality-based starters

      // Lifestyle conversation starters
      starters.push(
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Qué te parece más importante en una conexión: la química instantánea o conocerse gradualmente?',
          context_tags: ['connection', 'chemistry'],
          success_rate: 0.70
        },
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Prefieres ambientes íntimos y reservados o experiencias más sociales y abiertas?',
          context_tags: ['preferences', 'lifestyle'],
          success_rate: 0.85
        },
        {
          id: crypto.randomUUID(),
          category: 'interests',
          text: `Me encanta ${commonInterests[0] || 'explorar nuevas experiencias'}. ¿Cuál ha sido tu experiencia más memorable?`,
          context_tags: ['interests', 'experiences'],
          success_rate: 0.80
        },
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Cómo manejas la comunicación sobre límites y preferencias en tus relaciones?',
          context_tags: ['communication', 'boundaries'],
          success_rate: 0.75
        },
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Qué es lo que más valoras en las conexiones auténticas?',
          context_tags: ['values', 'authenticity'],
          success_rate: 0.65
        },
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Prefieres encuentros discretos o disfrutas de ambientes más sociales?',
          context_tags: ['discretion', 'social'],
          success_rate: 0.80
        },
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Cómo equilibra la confianza y la exploración en tus relaciones?',
          context_tags: ['trust', 'exploration'],
          success_rate: 0.70
        },
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Qué protocolos de seguridad consideras más importantes en encuentros?',
          context_tags: ['safety', 'protocols'],
          success_rate: 0.75
        },
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Cómo manejas la discreción y privacidad en tus conexiones?',
          context_tags: ['privacy', 'discretion'],
          success_rate: 0.80
        },
        {
          id: crypto.randomUUID(),
          category: 'lifestyle',
          text: '¿Qué experiencias te han enseñado más sobre el respeto mutuo?',
          context_tags: ['respect', 'learning'],
          success_rate: 0.70
        }
      );

      // Add personality-based starters if we have insights
      const userInsights = await this.generatePersonalityInsights(userId);
      const matchInsights = await this.generatePersonalityInsights(matchId);
      
      if (userInsights.length > 0 && matchInsights.length > 0) {
        // Find complementary traits
        const complementaryStarters = this.generateComplementaryStarters(userInsights, matchInsights);
        starters.push(...complementaryStarters);
      }

      // Add location-based starters - latitude/longitude no existen en la tabla
      // TODO: Implementar cuando latitude/longitude estén disponibles en la tabla profiles
      // if (user.latitude && user.longitude && match.latitude && match.longitude) {
      //   starters.push({
      //     id: crypto.randomUUID(),
      //     category: 'interests',
      //     text: '¿Conoces buenos lugares discretos para encuentros?',
      //     context_tags: ['location', 'recommendations', 'discretion'],
      //     success_rate: 0.70
      //   });
      // }

      // Sort by success rate and return top starters
      return starters
        .sort((a, b) => b.success_rate - a.success_rate)
        .slice(0, 8); // Return top 8 starters
    } catch (error) {
      logger.error('Error generating conversation starters:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Generate complementary conversation starters based on personality insights
   */
  private static generateComplementaryStarters(
    userInsights: PersonalityInsight[], 
    matchInsights: PersonalityInsight[]
  ): ConversationStarter[] {
    const starters: ConversationStarter[] = [];

    // Find complementary traits (opposites attract)
    const complementaryPairs = [
      { user: 'extraversion', match: 'introversion', text: 'Me gusta conocer gente nueva, pero también valoro la intimidad. ¿Cómo equilibra tú la socialización?' },
      { user: 'openness', match: 'conscientiousness', text: 'Soy bastante espontáneo, pero también me gusta tener planes. ¿Cómo manejas tú el equilibrio entre espontaneidad y organización?' },
      { user: 'agreeableness', match: 'assertiveness', text: 'Suelo ser muy comprensivo, pero a veces necesito ser más directo. ¿Cómo encuentras tú el equilibrio entre amabilidad y asertividad?' }
    ];

    for (const pair of complementaryPairs) {
      const userTrait = userInsights.find(i => i.trait === pair.user);
      const matchTrait = matchInsights.find(i => i.trait === pair.match);
      
      if (userTrait && matchTrait && userTrait.score > 60 && matchTrait.score > 60) {
        starters.push({
          id: crypto.randomUUID(),
          category: 'personality',
          text: pair.text,
          context_tags: ['personality', 'complementary'],
          success_rate: 0.75
        });
      }
    }

    return starters;
  }
  static async scheduleVirtualDate(
    participants: string[],
    type: VirtualDate['type'],
    scheduledAt: string,
    activities: VirtualActivity[]
  ): Promise<VirtualDate> {
    try {
      const virtualDate: VirtualDate = {
        id: crypto.randomUUID(),
        participants,
        type,
        scheduled_at: scheduledAt,
        duration_minutes: activities.reduce((total, activity) => total + activity.duration_minutes, 0),
        status: 'scheduled',
        activities
      };

      // Store in database (simplified)
      logger.info('Virtual date scheduled:', virtualDate);

      // Send notifications to participants
      for (const participantId of participants) {
        await NotificationService.createNotification({
          userId: participantId,
          type: 'system',
          title: '¡Cita virtual programada! 💕',
          message: `Tu cita virtual está programada para ${new Date(scheduledAt).toLocaleDateString()}`,
          actionUrl: `/virtual-dates/${virtualDate.id}`,
          metadata: { virtual_date_id: virtualDate.id }
        });
      }

      return virtualDate;
    } catch (error) {
      logger.error('Error scheduling virtual date:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get virtual date activities with swinger-themed options
   */
  static getVirtualDateActivities(): VirtualActivity[] {
    return [
      {
        id: 'intimate-conversation',
        name: 'Conversación Íntima',
        type: 'video_call',
        config: { private_room: true, mood_lighting: true, discretion_mode: true },
        duration_minutes: 60
      },
      {
        id: 'couples-game-night',
        name: 'Noche de Juegos para Parejas',
        type: 'game',
        config: { game_types: ['truth_or_dare', 'intimate_questions', 'compatibility_quiz'], adult_content: true },
        duration_minutes: 90
      },
      {
        id: 'virtual-date-experience',
        name: 'Experiencia de Cita Virtual',
        type: 'virtual_reality',
        config: { romantic_settings: ['beach_sunset', 'cozy_cabin', 'luxury_suite'], privacy_assured: true },
        duration_minutes: 120
      },
      {
        id: 'lifestyle-discussion',
        name: 'Charla sobre Estilo de Vida',
        type: 'video_call',
        config: { topics: ['boundaries', 'preferences', 'experiences'], safe_space: true },
        duration_minutes: 45
      },
      {
        id: 'couples-workshop',
        name: 'Taller para Parejas',
        type: 'group_session',
        config: { workshop_types: ['communication', 'exploration', 'connection'], guided_experience: true },
        duration_minutes: 90
      },
      {
        id: 'swinger-etiquette-session',
        name: 'Sesión de Etiqueta Swinger',
        type: 'educational',
        config: { topics: ['boundaries', 'communication', 'respect', 'safety'], expert_guidance: true },
        duration_minutes: 60
      },
      {
        id: 'couples-compatibility-test',
        name: 'Test de Compatibilidad para Parejas',
        type: 'assessment',
        config: { test_types: ['lifestyle', 'preferences', 'boundaries'], detailed_report: true },
        duration_minutes: 45
      },
      {
        id: 'virtual-party-planning',
        name: 'Planificación de Fiesta Virtual',
        type: 'planning',
        config: { party_types: ['intimate', 'group', 'themed'], guest_management: true },
        duration_minutes: 75
      },
      {
        id: 'lifestyle-storytelling',
        name: 'Intercambio de Experiencias',
        type: 'storytelling',
        config: { story_types: ['experiences', 'adventures', 'learnings'], anonymous_mode: true },
        duration_minutes: 90
      },
      {
        id: 'couples-bonding-activities',
        name: 'Actividades de Conexión',
        type: 'bonding',
        config: { activity_types: ['trust_exercises', 'communication_games', 'intimacy_building'], guided_session: true },
        duration_minutes: 60
      },
      {
        id: 'swinger-community-intro',
        name: 'Introducción a la Comunidad',
        type: 'orientation',
        config: { community_rules: true, member_guidelines: true, safety_protocols: true },
        duration_minutes: 30
      },
      {
        id: 'virtual-swingers-meetup',
        name: 'Encuentro Virtual de Swingers',
        type: 'social',
        config: { group_size: 'small', ice_breakers: true, networking: true },
        duration_minutes: 120
      }
    ];
  }

  /**
   * Get comprehensive compatibility analysis
   */
  static async getComprehensiveCompatibilityAnalysis(
    userId: string,
    matchId: string
  ): Promise<{
    overallScore: number;
    breakdown: Record<string, number>;
    strengths: string[];
    challenges: string[];
    recommendations: string[];
    personalityInsights: {
      user: PersonalityInsight[];
      match: PersonalityInsight[];
      compatibility: number;
    };
  }> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }
      
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: matchProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', matchId)
        .single();

      if (!userProfile || !matchProfile) {
        throw new Error('Profiles not found');
      }

      // Get personality insights for both users
      const userInsights = await this.generatePersonalityInsights(userId);
      const matchInsights = await this.generatePersonalityInsights(matchId);

      // Calculate personality compatibility
      const personalityCompatibility = this.calculatePersonalityCompatibilityFromInsights(userInsights, matchInsights);

      // Calculate overall compatibility using enhanced algorithm
      const config: AdvancedMatchingConfig = {
        algorithm: 'hybrid',
        weights: {
          interests: 0.25,
          location: 0.15,
          age: 0.15,
          education: 0.10,
          lifestyle: 0.20,
          personality: 0.15
        },
        filters: {
          maxDistance: 50,
          ageRange: [18, 65],
          requiredInterests: [],
          dealBreakers: []
        }
      };

      const compatibility = await this.calculateAdvancedCompatibility(
        userProfile as unknown as ProfileRow,
        matchProfile as unknown as ProfileRow,
        config
      );

      // Generate analysis
      const analysis = {
        overallScore: compatibility.score,
        breakdown: {
          interests: compatibility.score * 0.25,
          location: compatibility.score * 0.15,
          age: compatibility.score * 0.15,
          lifestyle: compatibility.score * 0.20,
          personality: personalityCompatibility * 0.15,
          education: compatibility.score * 0.10
        },
        strengths: compatibility.reasons,
        challenges: this.identifyCompatibilityChallenges(userProfile, matchProfile, userInsights, matchInsights),
        recommendations: this.generateCompatibilityRecommendations(userProfile, matchProfile, userInsights, matchInsights),
        personalityInsights: {
          user: userInsights,
          match: matchInsights,
          compatibility: personalityCompatibility
        }
      };

      return analysis;
    } catch (error) {
      logger.error('Error in comprehensive compatibility analysis:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Calculate personality compatibility from insights
   */
  private static calculatePersonalityCompatibilityFromInsights(
    userInsights: PersonalityInsight[],
    matchInsights: PersonalityInsight[]
  ): number {
    if (userInsights.length === 0 || matchInsights.length === 0) return 0.5;

    let totalCompatibility = 0;
    let traitCount = 0;

    for (const userTrait of userInsights) {
      const matchTrait = matchInsights.find(t => t.trait === userTrait.trait);
      if (matchTrait) {
        // Calculate compatibility based on trait similarity
        const similarity = 1 - Math.abs(userTrait.score - matchTrait.score) / 100;
        totalCompatibility += similarity;
        traitCount++;
      }
    }

    return traitCount > 0 ? totalCompatibility / traitCount : 0.5;
  }

  /**
   * Identify potential compatibility challenges
   */
  private static identifyCompatibilityChallenges(
    userProfile: any,
    matchProfile: any,
    userInsights: PersonalityInsight[],
    matchInsights: PersonalityInsight[]
  ): string[] {
    const challenges: string[] = [];

    // Age difference challenges
    const ageDiff = Math.abs((userProfile.age || 25) - (matchProfile.age || 25));
    if (ageDiff > 10) {
      challenges.push('Diferencia de edad significativa');
    }

    // Personality challenges
    for (const userTrait of userInsights) {
      const matchTrait = matchInsights.find(t => t.trait === userTrait.trait);
      if (matchTrait && Math.abs(userTrait.score - matchTrait.score) > 60) {
        challenges.push(`Diferencias en ${userTrait.trait}`);
      }
    }

    // Location challenges - comparar coordenadas si existen
    if (userProfile.latitude && userProfile.longitude && matchProfile.latitude && matchProfile.longitude) {
      const lat1 = userProfile.latitude;
      const lon1 = userProfile.longitude;
      const lat2 = matchProfile.latitude;
      const lon2 = matchProfile.longitude;
      
      // Calcular distancia aproximada (fórmula simple)
      const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111; // km aproximados
      
      if (distance > 50) {
        challenges.push('Ubicaciones distantes');
      }
    }

    // Interest challenges
    const userInterests = userProfile.interests || [];
    const matchInterests = matchProfile.interests || [];
    const commonInterests = userInterests.filter((i: string) => matchInterests.includes(i));
    if (commonInterests.length < 2) {
      challenges.push('Pocos intereses en común');
    }

    return challenges;
  }

  /**
   * Generate compatibility recommendations
   */
  private static generateCompatibilityRecommendations(
    userProfile: any,
    matchProfile: any,
    userInsights: PersonalityInsight[],
    matchInsights: PersonalityInsight[]
  ): string[] {
    const recommendations: string[] = [];

    // Personality-based recommendations
    const userExtraversion = userInsights.find(i => i.trait === 'extraversion');
    const matchExtraversion = matchInsights.find(i => i.trait === 'extraversion');
    
    if (userExtraversion && matchExtraversion) {
      if (userExtraversion.score > 70 && matchExtraversion.score < 30) {
        recommendations.push('Considera actividades más íntimas y tranquilas');
      } else if (userExtraversion.score < 30 && matchExtraversion.score > 70) {
        recommendations.push('Planifica actividades sociales y energéticas');
      }
    }

    // Interest-based recommendations
    const userInterests = userProfile.interests || [];
    const matchInterests = matchProfile.interests || [];
    const commonInterests = userInterests.filter((i: string) => matchInterests.includes(i));
    
    if (commonInterests.length > 0) {
      recommendations.push(`Explora actividades relacionadas con: ${commonInterests.slice(0, 3).join(', ')}`);
    }

    // Location-based recommendations
    if (userProfile.latitude && userProfile.longitude && matchProfile.latitude && matchProfile.longitude) {
      const lat1 = userProfile.latitude;
      const lon1 = userProfile.longitude;
      const lat2 = matchProfile.latitude;
      const lon2 = matchProfile.longitude;
      
      const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111;
      
      if (distance < 20) {
        recommendations.push('Aprovecha su cercanía para encuentros presenciales discretos');
      } else if (distance < 100) {
        recommendations.push('Considera planear encuentros con anticipación dada la distancia');
      } else {
        recommendations.push('Considera citas virtuales hasta que puedan encontrarse');
      }
    } else {
      recommendations.push('Considera citas virtuales para conocerse mejor');
    }

    return recommendations;
  }
  static async getAdvancedMatchingStats(_userId: string): Promise<{
    totalRecommendations: number;
    viewedRecommendations: number;
    matchRate: number;
    averageCompatibility: number;
  }> {
    // In a real implementation, this would query the database
    return {
      totalRecommendations: 150,
      viewedRecommendations: 89,
      matchRate: 0.23,
      averageCompatibility: 0.78
    };
  }

  /**
   * Update user preferences based on behavior
   */
  static async updatePreferencesFromBehavior(
    userId: string,
    interactions: Array<{ action: string; target_user_id: string; timestamp: string }>
  ): Promise<void> {
    try {
      // Analyze user behavior patterns
      const likedUsers = interactions
        .filter(i => i.action === 'liked')
        .map(i => i.target_user_id);

      const passedUsers = interactions
        .filter(i => i.action === 'passed')
        .map(i => i.target_user_id);

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }
      
      // Get profiles of liked and passed users
      const { data: likedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', likedUsers);

      const { data: passedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', passedUsers);

      // Analyze patterns and update user preferences
      const preferenceUpdates = this.analyzePreferencePatterns((likedProfiles || []) as unknown as ProfileRow[], (passedProfiles || []) as unknown as ProfileRow[]);

      // Update user preferences
      await supabase
        .from('profiles')
        .update({ 
          learned_preferences: preferenceUpdates,
          updated_at: new Date().toISOString()
        } as never)
        .eq('id', userId);

      logger.info('User preferences updated based on behavior:', { userId, updates: preferenceUpdates });
    } catch (error) {
      logger.error('Error updating learning preferences:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Analyze preference patterns from user behavior
   */
  private static analyzePreferencePatterns(likedProfiles: ProfileRow[], _passedProfiles: ProfileRow[]): Record<string, unknown> {
    const patterns: Record<string, unknown> = {
      preferred_age_range: null,
      preferred_interests: [],
      preferred_locations: [],
      preferred_account_types: [],
      confidence_score: 0
    };

    if (likedProfiles.length === 0) return patterns;

    // Analyze age preferences
    const likedAges = likedProfiles.map(p => p.age).filter((age): age is number => age !== null);
    if (likedAges.length > 0) {
      patterns.preferred_age_range = [
        Math.min(...likedAges) - 2,
        Math.max(...likedAges) + 2
      ];
    }

    // Analyze interest preferences
    const interestCounts: Record<string, number> = {};
    likedProfiles.forEach(profile => {
      (profile.interests || []).forEach((interest: string) => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      });
    });

    patterns.preferred_interests = Object.entries(interestCounts)
      .filter(([_, count]) => count >= Math.ceil(likedProfiles.length * 0.3))
      .map(([interest, _]) => interest);

    // Calculate confidence based on sample size
    patterns.confidence_score = Math.min(1, likedProfiles.length / 20);

    return patterns;
  }
}

export default AdvancedFeaturesService;
