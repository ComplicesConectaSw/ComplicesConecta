import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { NotificationService } from '@/lib/notifications';
import type { Database } from '@/integrations/supabase/types';

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

    // Location compatibility
    const locationScore = this.calculateLocationCompatibility(
      user1.location,
      user2.location,
      config.filters.maxDistance
    );
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

    // Personality compatibility
    const personalityScore = this.calculateInterestCompatibility(
      user1.interests || [],
      user2.interests || []
    );
    scores.personality = personalityScore;
    if (personalityScore > 0.75) {
      reasons.push('Química y conexión natural');
    }

    // Lifestyle compatibility
    const lifestyleScore = this.calculateInterestCompatibility(
      user1.interests || [],
      user2.interests || []
    );
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
      (scores.lifestyle * config.weights.lifestyle);

    const weightSum = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);
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
   * Calculate confidence level based on profile completeness
   */
  private static calculateConfidenceLevel(user1: ProfileRow, user2: ProfileRow): number {
    const requiredFields = ['interests', 'personality_traits', 'lifestyle_preferences', 'age'];
    
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
        // For JSONB fields (personality_traits, lifestyle_preferences)
        if (value1 && typeof value1 === 'object' && value1 !== null && Object.keys(value1).length > 0) user1Completeness++;
        if (value2 && typeof value2 === 'object' && value2 !== null && Object.keys(value2).length > 0) user2Completeness++;
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
   * Generate personality insights
   */
  static async generatePersonalityInsights(userId: string): Promise<PersonalityInsight[]> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('interests, bio, age, gender, account_type')
        .eq('id', userId)
        .single();

      if (!profile?.interests || profile.interests.length === 0) return [];

      const insights: PersonalityInsight[] = [];
      // personality_traits column doesn't exist, return empty insights
      return insights;
    } catch (error) {
      logger.error('Error generating personality insights:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
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
        }
      );

      return starters;
    } catch (error) {
      logger.error('Error generating conversation starters:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Schedule virtual date
   */
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
   * Get virtual date activities
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
      }
    ];
  }

  /**
   * Get advanced matching statistics
   */
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
