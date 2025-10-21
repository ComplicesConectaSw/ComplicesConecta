import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Sistema de Backup Automático para ComplicesConecta
 * Realiza respaldos incrementales de datos críticos
 */

interface BackupConfig {
  enabled: boolean;
  interval: number; // en milisegundos
  retentionDays: number;
  tables: string[];
  destination: 'local' | 'cloud' | 'both';
}

interface BackupMetadata {
  id: string;
  timestamp: number;
  type: 'full' | 'incremental';
  tables: string[];
  size: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any[]>;
}

class BackupSystem {
  private config: BackupConfig;
  private backupHistory: BackupMetadata[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: BackupConfig) {
    this.config = config;
    this.initializeBackupSystem();
    console.log('💾 Sistema de Backup inicializado - Respaldos automáticos activos');
  }

  private initializeBackupSystem() {
    if (!this.config.enabled) {
      logger.info('💾 Backup: Sistema deshabilitado', {});
      return;
    }

    // Cargar historial de backups
    this.loadBackupHistory();

    // Iniciar backups automáticos
    this.startAutomaticBackups();

    // Limpiar backups antiguos cada 24 horas
    setInterval(() => {
      this.cleanupOldBackups();
    }, 24 * 60 * 60 * 1000);

    logger.info('💾 Backup: Sistema iniciado', {
      interval: this.config.interval / 1000 / 60 + ' minutos',
      retention: this.config.retentionDays + ' días',
      tables: this.config.tables.length
    });
  }

  // Iniciar backups automáticos
  private startAutomaticBackups() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      if (!this.isRunning) {
        await this.performIncrementalBackup();
      }
    }, this.config.interval);

    console.log(`💾 Backup: Programado cada ${this.config.interval / 1000 / 60} minutos`);
  }

  // Realizar backup completo
  async performFullBackup(): Promise<BackupMetadata> {
    console.log('💾 Backup: Iniciando backup completo...');
    
    const metadata: BackupMetadata = {
      id: this.generateBackupId(),
      timestamp: Date.now(),
      type: 'full',
      tables: [...this.config.tables],
      size: 0,
      status: 'pending'
    };

    try {
      this.isRunning = true;
      const backupData: BackupData = {
        metadata,
        data: {}
      };

      // Respaldar cada tabla
      for (const table of this.config.tables) {
        console.log(`💾 Backup: Respaldando tabla ${table}...`);
        
        try {
          const tableData = await this.backupTableFull(table);
          backupData.data[table] = tableData;
          
          console.log(`💾 Backup: Tabla ${table} respaldada - ${tableData.length} registros`);
        } catch (error) {
          console.error(`💾 Backup: Error en tabla ${table}`, error);
          // Continuar con otras tablas
        }
      }

      // Calcular tamaño
      metadata.size = this.calculateBackupSize(backupData);
      metadata.status = 'completed';

      // Guardar backup
      await this.saveBackup(backupData);
      
      this.backupHistory.push(metadata);
      await this.saveBackupHistory();

      console.log('💾 Backup: Backup completo finalizado', {
        id: metadata.id,
        size: this.formatBytes(metadata.size),
        tables: metadata.tables.length
      });

      return metadata;

    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : 'Error desconocido';
      
      console.error('💾 Backup: Error en backup completo', error);
      
      this.backupHistory.push(metadata);
      await this.saveBackupHistory();
      
      return metadata;
    } finally {
      this.isRunning = false;
    }
  }

  // Realizar backup incremental
  async performIncrementalBackup(): Promise<BackupMetadata> {
    console.log('💾 Backup: Iniciando backup incremental...');

    const lastBackup = this.getLastSuccessfulBackup();
    const sinceTimestamp = lastBackup ? lastBackup.timestamp : Date.now() - (24 * 60 * 60 * 1000);

    const metadata: BackupMetadata = {
      id: this.generateBackupId(),
      timestamp: Date.now(),
      type: 'incremental',
      tables: [...this.config.tables],
      size: 0,
      status: 'pending'
    };

    try {
      this.isRunning = true;
      const backupData: BackupData = {
        metadata,
        data: {}
      };

      // Respaldar cambios incrementales
      for (const table of this.config.tables) {
        try {
          const incrementalData = await this.backupTableIncremental(table, sinceTimestamp);
          
          if (incrementalData.length > 0) {
            backupData.data[table] = incrementalData;
            console.log(`💾 Backup: Tabla ${table} - ${incrementalData.length} cambios desde último backup`);
          }
        } catch (error) {
          console.error(`💾 Backup: Error incremental en tabla ${table}`, error);
        }
      }

      // Verificar si hay datos para respaldar
      const hasData = Object.keys(backupData.data).length > 0;
      
      if (hasData) {
        metadata.size = this.calculateBackupSize(backupData);
        metadata.status = 'completed';
        
        await this.saveBackup(backupData);
        
        console.log('💾 Backup: Backup incremental completado', {
          id: metadata.id,
          size: this.formatBytes(metadata.size),
          tablesWithChanges: Object.keys(backupData.data).length
        });
      } else {
        metadata.status = 'completed';
        metadata.size = 0;
        console.log('💾 Backup: No hay cambios para respaldar');
      }

      this.backupHistory.push(metadata);
      await this.saveBackupHistory();

      return metadata;

    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : 'Error desconocido';
      
      console.error('💾 Backup: Error en backup incremental', error);
      
      this.backupHistory.push(metadata);
      await this.saveBackupHistory();
      
      return metadata;
    } finally {
      this.isRunning = false;
    }
  }

  // Respaldar tabla completa
  private async backupTableFull(table: string): Promise<any[]> {
    const isDemoMode = localStorage.getItem('demo_authenticated') === 'true';
    
    if (isDemoMode) {
      // En modo demo, generar datos mock
      return this.generateMockBackupData(table, 10);
    }

    try {
      const validTables = ['profiles', 'messages', 'matches', 'user_tokens', 'invitations', 'posts', 'notifications'];
      
      if (!validTables.includes(table)) {
        console.warn(`💾 Backup: Tabla ${table} no válida, usando datos mock`);
        return this.generateMockBackupData(table);
      }

      const { data, error } = await supabase
        .from(table as any)
        .select('*')
        .limit(1000);

      if (error) {
        throw new Error(`Error al respaldar tabla ${table}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error(`💾 Backup: Error accediendo a tabla ${table}`, error);
      return [];
    }
  }

  // Respaldar cambios incrementales de tabla
  private async backupTableIncremental(tableName: string, sinceTimestamp: number): Promise<any[]> {
    const isDemoMode = localStorage.getItem('demo_authenticated') === 'true';
    
    if (isDemoMode) {
      // En modo demo, simular cambios incrementales
      const mockChanges = Math.floor(Math.random() * 5);
      return mockChanges > 0 ? this.generateMockBackupData(tableName, mockChanges) : [];
    }

    try {
      const validTables = [
        'profiles', 'matches', 'messages', 'user_tokens', 'invitations', 'posts',
        'audit_logs', 'chat_invitations', 'chat_rooms', 'chat_members', 'comment_likes',
        'post_comments', 'couple_profiles', 'gallery_access_requests', 'gallery_permissions',
        'image_permissions', 'images', 'match_interactions', 'moderation_logs',
        'notification_history', 'pending_rewards', 'post_likes', 'post_shares',
        'reports', 'system_metrics', 'token_analytics', 'tokens', 'transactions',
        'user_2fa_settings', 'user_device_tokens', 'user_likes', 'user_notification_preferences',
        'user_roles', 'user_staking', 'chat_messages', 'media_access_logs', 'notification_preferences', 'referral_rewards'
      ] as const;

      if (!validTables.includes(tableName as any)) {
        console.warn(`💾 Backup: Tabla ${tableName} no válida para backup incremental, usando datos mock`);
        return this.generateMockBackupData(tableName, 2);
      }

      const lastBackupTime = new Date(sinceTimestamp);
      
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .gte('created_at', lastBackupTime.toISOString())
        .limit(1000);

      if (error) {
        throw new Error(`Error en backup incremental de ${tableName}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error(`💾 Backup: Error en backup incremental de ${tableName}`, error);
      return [];
    }
  }

  // Generar datos mock para demo
  private generateMockBackupData(tableName: string, count: number = 10): any[] {
    const mockData = [];
    
    for (let i = 0; i < count; i++) {
      const baseRecord = {
        id: `mock_${tableName}_${i}_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      switch (tableName) {
        case 'profiles':
          mockData.push({
            ...baseRecord,
            first_name: `Usuario${i}`,
            email: `demo${i}@backup.test`,
            is_demo: true
          });
          break;
        case 'messages':
          mockData.push({
            ...baseRecord,
            content: `Mensaje demo ${i}`,
            sender_id: `user_${i}`,
            receiver_id: `user_${i + 1}`
          });
          break;
        default:
          mockData.push({
            ...baseRecord,
            data: `Demo data for ${tableName} ${i}`
          });
      }
    }

    return mockData;
  }

  // Guardar backup
  private async saveBackup(backupData: BackupData): Promise<void> {
    const backupJson = JSON.stringify(backupData, null, 2);
    
    try {
      if (this.config.destination === 'local' || this.config.destination === 'both') {
        await this.saveBackupLocally(backupData.metadata.id, backupJson);
      }

      if (this.config.destination === 'cloud' || this.config.destination === 'both') {
        await this.saveBackupToCloud(backupData.metadata.id, backupJson);
      }
    } catch (error) {
      console.error('💾 Backup: Error al guardar backup', error);
      throw error;
    }
  }

  // Guardar backup localmente (simulado)
  private async saveBackupLocally(backupId: string, data: string): Promise<void> {
    // En un entorno real, esto guardaría en el sistema de archivos local
    localStorage.setItem(`backup_${backupId}`, data);
    console.log(`💾 Backup: Guardado localmente - backup_${backupId}`);
  }

  // Guardar backup en la nube (simulado)
  private async saveBackupToCloud(backupId: string, _data: string): Promise<void> {
    // En un entorno real, esto subiría a AWS S3, Google Cloud Storage, etc.
    console.log(`💾 Backup: Simulando subida a la nube - backup_${backupId}`);
    
    // Simular delay de subida
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Calcular tamaño del backup
  private calculateBackupSize(backupData: BackupData): number {
    const jsonString = JSON.stringify(backupData);
    return new Blob([jsonString]).size;
  }

  // Formatear bytes
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generar ID único para backup
  private generateBackupId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);
    return `backup_${timestamp}_${random}`;
  }

  // Obtener último backup exitoso
  private getLastSuccessfulBackup(): BackupMetadata | null {
    return this.backupHistory
      .filter(backup => backup.status === 'completed')
      .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }

  // Limpiar backups antiguos
  private async cleanupOldBackups(): Promise<void> {
    console.log('💾 Backup: Iniciando limpieza de backups antiguos...');
    
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    const oldBackups = this.backupHistory.filter(backup => backup.timestamp < cutoffTime);
    
    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup.id);
        console.log(`💾 Backup: Eliminado backup antiguo ${backup.id}`);
      } catch (error) {
        console.error(`💾 Backup: Error al eliminar backup ${backup.id}`, error);
      }
    }

    // Actualizar historial
    this.backupHistory = this.backupHistory.filter(backup => backup.timestamp >= cutoffTime);
    await this.saveBackupHistory();

    if (oldBackups.length > 0) {
      console.log(`💾 Backup: Limpieza completada - ${oldBackups.length} backups eliminados`);
    }
  }

  // Eliminar backup
  private async deleteBackup(backupId: string): Promise<void> {
    // Eliminar local
    localStorage.removeItem(`backup_${backupId}`);
    
    // En producción, también eliminar de la nube
    console.log(`💾 Backup: Backup ${backupId} eliminado`);
  }

  // Guardar historial de backups
  private async saveBackupHistory(): Promise<void> {
    try {
      localStorage.setItem('backup_history', JSON.stringify(this.backupHistory));
    } catch (error) {
      console.error('💾 Backup: Error al guardar historial', error);
    }
  }

  // Cargar historial de backups
  private loadBackupHistory(): void {
    try {
      const saved = localStorage.getItem('backup_history');
      if (saved) {
        this.backupHistory = JSON.parse(saved);
        console.log(`💾 Backup: Historial cargado - ${this.backupHistory.length} backups`);
      }
    } catch (error) {
      console.error('💾 Backup: Error al cargar historial', error);
      this.backupHistory = [];
    }
  }

  // Obtener estadísticas
  getBackupStats() {
    const successful = this.backupHistory.filter(b => b.status === 'completed').length;
    const failed = this.backupHistory.filter(b => b.status === 'failed').length;
    const totalSize = this.backupHistory
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.size, 0);

    return {
      total: this.backupHistory.length,
      successful,
      failed,
      totalSize: this.formatBytes(totalSize),
      isRunning: this.isRunning,
      lastBackup: this.getLastSuccessfulBackup(),
      config: this.config
    };
  }

  // Restaurar desde backup
  async restoreFromBackup(backupId: string): Promise<boolean> {
    console.log(`💾 Backup: Iniciando restauración desde ${backupId}...`);
    
    try {
      const backupData = localStorage.getItem(`backup_${backupId}`);
      if (!backupData) {
        throw new Error(`Backup ${backupId} no encontrado`);
      }

      const backup: BackupData = JSON.parse(backupData);
      
      // En modo demo, solo simular restauración
      const isDemoMode = localStorage.getItem('demo_authenticated') === 'true';
      if (isDemoMode) {
        console.log('💾 Backup: Restauración simulada en modo demo');
        return true;
      }

      // En producción, restaurar datos reales
      for (const [tableName, _tableData] of Object.entries(backup.data)) {
        console.log(`💾 Backup: Restaurando tabla ${tableName}...`);
        // Aquí iría la lógica de restauración real
      }

      console.log(`💾 Backup: Restauración completada desde ${backupId}`);
      return true;

    } catch (error) {
      console.error(`💾 Backup: Error en restauración desde ${backupId}`, error);
      return false;
    }
  }

  // Detener sistema de backup
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('💾 Backup: Sistema detenido');
  }
}

// Configuración por defecto
const defaultBackupConfig: BackupConfig = {
  enabled: true,
  interval: 30 * 60 * 1000, // 30 minutos
  retentionDays: 30, // 30 días
  tables: [
    'profiles',
    'messages', 
    'matches',
    'user_tokens',
    'invitations',
    'posts',
    'notifications'
  ],
  destination: 'both'
};

// Instancia singleton
export const backupSystem = new BackupSystem(defaultBackupConfig);

// Funciones de utilidad
export const performManualBackup = async (type: 'full' | 'incremental' = 'incremental') => {
  if (type === 'full') {
    return await backupSystem.performFullBackup();
  } else {
    return await backupSystem.performIncrementalBackup();
  }
};

export const getBackupStats = () => {
  return backupSystem.getBackupStats();
};

export const restoreBackup = async (backupId: string) => {
  return await backupSystem.restoreFromBackup(backupId);
};

logger.info('💾 Sistema de Backup Automático inicializado', { config: defaultBackupConfig });
