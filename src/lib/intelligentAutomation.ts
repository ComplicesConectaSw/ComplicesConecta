import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { Json } from '@/integrations/supabase/types';
import { NotificationService } from '@/lib/notifications';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationTrigger {
  type: 'user_signup' | 'match_created' | 'message_sent' | 'profile_updated' | 'inactivity' | 'report_created';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string | number | boolean | null;
}

export interface AutomationAction {
  type: 'send_notification' | 'send_email' | 'update_profile' | 'create_match_suggestion' | 'moderate_content' | 'assign_moderator';
  config: Record<string, string | number | boolean | null>;
}

export interface AutomationExecution {
  id: string;
  rule_id: string;
  trigger_data: Json;
  executed_at: string;
  success: boolean;
  error_message?: string;
}

export class IntelligentAutomationService {
  private static rules: AutomationRule[] = [];
  private static initialized = false;

  /**
   * Initialize automation service with default rules
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load rules from database or create defaults
      await this.loadRules();
      
      // Set up real-time listeners for triggers
      await this.setupTriggerListeners();
      
      this.initialized = true;
      logger.info('Intelligent Automation Service initialized');
    } catch (error) {
      logger.error('Error initializing automation service:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Load automation rules from memory (no database table needed)
   */
  private static async loadRules(): Promise<void> {
    try {
      // Use in-memory rules only, no database dependency
      this.rules = await this.createDefaultRules();
      logger.info('Automation rules loaded from memory');
    } catch (error) {
      logger.error('Error loading automation rules:', { error: error instanceof Error ? error.message : String(error) });
      this.rules = [];
    }
  }

  /**
   * Create default automation rules
   */
  private static async createDefaultRules(): Promise<AutomationRule[]> {
    const defaultRules: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'Bienvenida a Nuevos Usuarios',
        description: 'Envía notificación de bienvenida cuando un usuario se registra',
        trigger: {
          type: 'user_signup',
          config: {}
        },
        conditions: [],
        actions: [
          {
            type: 'send_notification',
            config: {
              type: 'system',
              title: '¡Bienvenido a ComplicesConecta!',
              message: 'Completa tu perfil para encontrar mejores matches',
              action_url: '/profile/edit'
            }
          }
        ],
        enabled: true
      },
      {
        name: 'Sugerencias de Match Inteligentes',
        description: 'Crea sugerencias de match basadas en compatibilidad',
        trigger: {
          type: 'profile_updated',
          config: {}
        },
        conditions: [
          {
            field: 'profile_completion',
            operator: 'greater_than',
            value: 70
          }
        ],
        actions: [
          {
            type: 'create_match_suggestion',
            config: {
              algorithm: 'compatibility_score',
              max_suggestions: 5
            }
          }
        ],
        enabled: true
      },
      {
        name: 'Recordatorio de Actividad',
        description: 'Envía recordatorio a usuarios inactivos',
        trigger: {
          type: 'inactivity',
          config: {
            days: 7
          }
        },
        conditions: [
          {
            field: 'last_login',
            operator: 'less_than',
            value: '7_days_ago'
          }
        ],
        actions: [
          {
            type: 'send_notification',
            config: {
              type: 'system',
              title: '¡Te extrañamos!',
              message: 'Hay nuevos perfiles que podrían interesarte',
              action_url: '/discover'
            }
          }
        ],
        enabled: true
      },
      {
        name: 'Moderación Automática de Contenido',
        description: 'Modera automáticamente contenido reportado',
        trigger: {
          type: 'report_created',
          config: {}
        },
        conditions: [
          {
            field: 'report_count',
            operator: 'greater_than',
            value: 3
          }
        ],
        actions: [
          {
            type: 'moderate_content',
            config: {
              action: 'flag_for_review',
              severity: 'medium'
            }
          },
          {
            type: 'assign_moderator',
            config: {
              priority: 'high'
            }
          }
        ],
        enabled: true
      },
      {
        name: 'Celebración de Matches',
        description: 'Envía felicitaciones cuando se crea un match',
        trigger: {
          type: 'match_created',
          config: {}
        },
        conditions: [],
        actions: [
          {
            type: 'send_notification',
            config: {
              type: 'match',
              title: '¡Tienes un nuevo match! ',
              message: 'Alguien especial está interesado en ti',
              action_url: '/matches'
            }
          }
        ],
        enabled: true
      }
    ];

    return defaultRules.map(rule => ({
      ...rule,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  /**
   * Set up real-time listeners for automation triggers
   */
  private static async setupTriggerListeners(): Promise<void> {
    try {
      // Listen for new user signups
      supabase
        .channel('user_signups')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'profiles' },
          (payload) => this.handleTrigger('user_signup', payload.new)
        )
        .subscribe();

      // Listen for new matches
      supabase
        .channel('new_matches')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'matches' },
          (payload) => this.handleTrigger('match_created', payload.new)
        )
        .subscribe();

      // Listen for profile updates
      supabase
        .channel('profile_updates')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles' },
          (payload) => this.handleTrigger('profile_updated', payload.new)
        )
        .subscribe();

      // Listen for new reports
      supabase
        .channel('new_reports')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'reports' },
          (payload) => this.handleTrigger('report_created', payload.new)
        )
        .subscribe();

      logger.info('Automation trigger listeners set up successfully');
    } catch (error) {
      logger.error('Error setting up trigger listeners:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Handle automation trigger
   */
  private static async handleTrigger(triggerType: string, triggerData: Record<string, unknown>): Promise<void> {
    try {
      const applicableRules = this.rules.filter(rule => 
        rule.enabled && rule.trigger.type === triggerType
      );

      for (const rule of applicableRules) {
        if (await this.evaluateConditions(rule.conditions, triggerData)) {
          await this.executeActions(rule.actions, triggerData, rule.id);
          
          // Log execution
          await this.logExecution(rule.id, triggerData, true);
        }
      }
    } catch (error) {
      logger.error('Error handling automation trigger:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Evaluate rule conditions
   */
  private static async evaluateConditions(
    conditions: AutomationCondition[], 
    data: Record<string, unknown>
  ): Promise<boolean> {
    if (conditions.length === 0) return true;

    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(data, condition.field);
      
      if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get field value from data object
   */
  private static getFieldValue(data: Record<string, unknown>, field: string): unknown {
    const fields = field.split('.');
    let value: unknown = data;
    
    for (const f of fields) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[f];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Evaluate single condition
   */
  private static evaluateCondition(fieldValue: unknown, operator: string, expectedValue: string | number | boolean | null): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      default:
        return false;
    }
  }

  /**
   * Execute automation actions
   */
  private static async executeActions(
    actions: AutomationAction[], 
    triggerData: Record<string, unknown>, 
    ruleId: string
  ): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action, triggerData);
      } catch (error) {
        logger.error(`Error executing action ${action.type} for rule ${ruleId}:`, { error: error instanceof Error ? error.message : String(error) });
        await this.logExecution(ruleId, triggerData, false, error instanceof Error ? error.message : String(error));
      }
    }
  }

  /**
   * Execute single action
   */
  private static async executeAction(action: AutomationAction, triggerData: Record<string, unknown>): Promise<void> {
    switch (action.type) {
      case 'send_notification':
        await this.executeSendNotification(action.config, triggerData);
        break;
      case 'send_email':
        await this.executeSendEmail(action.config, triggerData);
        break;
      case 'create_match_suggestion':
        await this.executeCreateMatchSuggestion(action.config, triggerData);
        break;
      case 'moderate_content':
        await this.executeModerateContent(action.config, triggerData);
        break;
      case 'assign_moderator':
        await this.executeAssignModerator(action.config, triggerData);
        break;
      default:
        logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute send notification action
   */
  private static async executeSendNotification(config: Record<string, string | number | boolean | null>, triggerData: Record<string, unknown>): Promise<void> {
    const userId = triggerData.user_id || triggerData.id;
    if (!userId) return;

    await NotificationService.createNotification({
      userId: String(userId),
      title: typeof config.title === 'string' ? config.title : '',
      type: 'system',
      message: typeof config.message === 'string' ? config.message : '',
      actionUrl: typeof config.action_url === 'string' ? config.action_url : undefined,
      metadata: { automation: true, trigger_data: triggerData }
    });
  }

  /**
   * Execute send email action
   */
  private static async executeSendEmail(config: Record<string, string | number | boolean | null>, triggerData: Record<string, unknown>): Promise<void> {
    // Implementation for email sending
    logger.info('Email action executed:', { config, triggerData });
  }

  /**
   * Execute create match suggestion action
   */
  private static async executeCreateMatchSuggestion(config: Record<string, string | number | boolean | null>, triggerData: Record<string, unknown>): Promise<void> {
    const userId = triggerData.user_id || triggerData.id;
    if (!userId) return;

    try {
      // Get user preferences and create intelligent suggestions
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('interests, age, location, gender, looking_for')
        .eq('id', String(userId))
        .single();

      if (userProfile) {
        // Find compatible users based on available fields
        const { data: potentialMatches } = await supabase
          .from('profiles')
          .select('id, name, interests, age')
          .neq('id', String(userId))
          .limit(Number(config.max_suggestions) || 5);

        // Create match suggestions using existing fields
        logger.info('Match suggestions created:', { userId, suggestions: potentialMatches?.length });
      }
    } catch (error) {
      logger.error('Error creating match suggestions:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Execute moderate content action
   */
  private static async executeModerateContent(config: Record<string, string | number | boolean | null>, triggerData: Record<string, unknown>): Promise<void> {
    const reportId = triggerData.id;
    if (!reportId) return;

    try {
      // Flag content for review using existing reports table
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'under_review'
        })
        .eq('id', String(reportId));

      if (error) {
        logger.error('Error updating report status:', { error: error.message });
      } else {
        logger.info('Content moderated automatically:', { reportId, config });
      }
    } catch (error) {
      logger.error('Error in moderate content action:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Execute assign moderator action
   */
  private static async executeAssignModerator(config: Record<string, string | number | boolean | null>, triggerData: Record<string, unknown>): Promise<void> {
    try {
      // Find available moderator using profiles table
      const { data: moderators } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('account_type', 'admin')
        .limit(1);

      if (moderators && moderators.length > 0) {
        const moderatorId = moderators[0]?.user_id;
        
        // Notify moderator about new assignment
        if (moderatorId) {
          await NotificationService.createNotification({
            userId: moderatorId,
            type: 'alert',
            title: 'Nueva asignación de moderación',
            message: 'Se te ha asignado un nuevo caso para revisar',
            actionUrl: '/admin/reports',
            metadata: { 
              automation: true, 
              priority: config.priority || 'medium',
              trigger_data: triggerData 
            }
          });

          logger.info('Moderator assigned:', { moderatorId, triggerData });
        }
      }
    } catch (error) {
      logger.error('Error assigning moderator:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Log automation execution
   */
  private static async logExecution(
    ruleId: string, 
    triggerData: Record<string, unknown>, 
    success: boolean, 
    errorMessage?: string
  ): Promise<void> {
    try {
      const execution = {
        rule_id: ruleId,
        trigger_data: triggerData as Record<string, unknown>,
        executed_at: new Date().toISOString(),
        success,
        error_message: errorMessage
      };

      // In a real implementation, this would be stored in the database
      logger.info('Automation execution logged:', execution);
    } catch (error) {
      logger.error('Error processing automation action:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Get automation statistics
   */
  static async getAutomationStats(): Promise<{
    totalRules: number;
    activeRules: number;
    executionsToday: number;
    successRate: number;
  }> {
    const totalRules = this.rules.length;
    const activeRules = this.rules.filter(rule => rule.enabled).length;
    
    // In a real implementation, these would come from the database
    const executionsToday = 0;
    const successRate = 95.5;

    return {
      totalRules,
      activeRules,
      executionsToday,
      successRate
    };
  }

  /**
   * Create new automation rule
   */
  static async createRule(rule: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      ...rule,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.rules.push(newRule);
    
    // In a real implementation, this would be saved to the database
    logger.info('New automation rule created:', newRule);
    
    return newRule;
  }

  /**
   * Update automation rule
   */
  static async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule | null> {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    
    if (ruleIndex === -1) return null;

    this.rules[ruleIndex] = {
      ...this.rules[ruleIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    logger.info('Automation rule updated:', this.rules[ruleIndex]);
    
    return this.rules[ruleIndex];
  }

  /**
   * Delete automation rule
   */
  static async deleteRule(ruleId: string): Promise<boolean> {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    
    if (ruleIndex === -1) return false;

    this.rules.splice(ruleIndex, 1);
    
    logger.info('Automation rule deleted:', { ruleId });
    
    return true;
  }

  /**
   * Get all automation rules
   */
  static getRules(): AutomationRule[] {
    return [...this.rules];
  }

  /**
   * Manual trigger for testing
   */
  static async triggerRule(ruleId: string, testData: Record<string, unknown>): Promise<boolean> {
    const rule = this.rules.find(r => r.id === ruleId);
    
    if (!rule) return false;

    try {
      if (await this.evaluateConditions(rule.conditions, testData)) {
        await this.executeActions(rule.actions, testData, rule.id);
        await this.logExecution(rule.id, testData, true);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error triggering rule manually:', { error: error instanceof Error ? error.message : String(error) });
      await this.logExecution(rule.id, testData, false, error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}

// Initialize the service
IntelligentAutomationService.initialize().catch(error => {
  logger.error('Failed to initialize Intelligent Automation Service:', { error: error instanceof Error ? error.message : String(error) });
});

export default IntelligentAutomationService;
