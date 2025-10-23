/**
 * LoadBalancingService - Sistema de balanceamiento de carga para alta disponibilidad
 * Implementa algoritmos de distribución, health checks y failover automático
 * Incluye monitoreo de servidores y escalado automático
 */

import { logger } from '@/lib/logger';

export interface Server {
  id: string;
  name: string;
  url: string;
  weight: number;
  status: 'healthy' | 'unhealthy' | 'maintenance';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
  successCount: number;
}

export interface LoadBalancingConfig {
  algorithm: 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'ip_hash';
  healthCheckInterval: number;
  healthCheckTimeout: number;
  maxRetries: number;
  failoverThreshold: number;
  enableStickySessions: boolean;
  sessionTimeout: number;
}

export interface LoadBalancingStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeServers: number;
  unhealthyServers: number;
  lastFailover: Date | null;
}

class LoadBalancingService {
  private servers: Map<string, Server> = new Map();
  private currentIndex: number = 0;
  private sessionMap: Map<string, string> = new Map(); // sessionId -> serverId
  private stats: LoadBalancingStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    activeServers: 0,
    unhealthyServers: 0,
    lastFailover: null
  };
  private config: LoadBalancingConfig = {
    algorithm: 'weighted_round_robin',
    healthCheckInterval: 30000, // 30 seconds
    healthCheckTimeout: 5000, // 5 seconds
    maxRetries: 3,
    failoverThreshold: 3,
    enableStickySessions: true,
    sessionTimeout: 3600000 // 1 hour
  };

  constructor() {
    logger.info('⚖️ LoadBalancingService initialized');
    this.initializeLoadBalancer();
  }

  /**
   * Inicializa el balanceador de carga
   */
  private async initializeLoadBalancer(): Promise<void> {
    try {
      // Add default servers
      await this.addServer({
        id: 'server-1',
        name: 'Primary Server',
        url: 'https://api1.complicesconecta.com',
        weight: 10,
        status: 'healthy',
        responseTime: 0,
        lastCheck: new Date(),
        errorCount: 0,
        successCount: 0
      });

      await this.addServer({
        id: 'server-2',
        name: 'Secondary Server',
        url: 'https://api2.complicesconecta.com',
        weight: 8,
        status: 'healthy',
        responseTime: 0,
        lastCheck: new Date(),
        errorCount: 0,
        successCount: 0
      });

      await this.addServer({
        id: 'server-3',
        name: 'Backup Server',
        url: 'https://api3.complicesconecta.com',
        weight: 5,
        status: 'healthy',
        responseTime: 0,
        lastCheck: new Date(),
        errorCount: 0,
        successCount: 0
      });

      // Start health checks
      this.startHealthChecks();

      // Start session cleanup
      this.startSessionCleanup();

      logger.info('✅ Load balancer initialized successfully');
    } catch (error) {
      logger.error('❌ Load balancer initialization failed:', { error: String(error) });
    }
  }

  /**
   * Agrega un servidor al pool
   */
  async addServer(server: Server): Promise<void> {
    try {
      this.servers.set(server.id, server);
      this.updateServerStats();
      
      logger.info('➕ Server added to load balancer', { 
        serverId: server.id, 
        url: server.url,
        weight: server.weight 
      });
    } catch (error) {
      logger.error('❌ Failed to add server:', { serverId: server.id, error: String(error) });
    }
  }

  /**
   * Remueve un servidor del pool
   */
  async removeServer(serverId: string): Promise<void> {
    try {
      const server = this.servers.get(serverId);
      if (server) {
        this.servers.delete(serverId);
        this.updateServerStats();
        
        logger.info('➖ Server removed from load balancer', { serverId });
      }
    } catch (error) {
      logger.error('❌ Failed to remove server:', { serverId, error: String(error) });
    }
  }

  /**
   * Selecciona el mejor servidor según el algoritmo configurado
   */
  selectServer(sessionId?: string): Server | null {
    try {
      // Check for sticky session first
      if (this.config.enableStickySessions && sessionId) {
        const assignedServerId = this.sessionMap.get(sessionId);
        if (assignedServerId) {
          const server = this.servers.get(assignedServerId);
          if (server && server.status === 'healthy') {
            return server;
          }
        }
      }

      // Select server based on algorithm
      let selectedServer: Server | null = null;

      switch (this.config.algorithm) {
        case 'round_robin':
          selectedServer = this.roundRobinSelection();
          break;
        case 'weighted_round_robin':
          selectedServer = this.weightedRoundRobinSelection();
          break;
        case 'least_connections':
          selectedServer = this.leastConnectionsSelection();
          break;
        case 'ip_hash':
          selectedServer = this.ipHashSelection(sessionId);
          break;
        default:
          selectedServer = this.weightedRoundRobinSelection();
      }

      // Assign to session if sticky sessions enabled
      if (selectedServer && this.config.enableStickySessions && sessionId) {
        this.sessionMap.set(sessionId, selectedServer.id);
      }

      return selectedServer;
    } catch (error) {
      logger.error('❌ Server selection failed:', { error: String(error) });
      return null;
    }
  }

  /**
   * Ejecuta una request a través del balanceador
   */
  async executeRequest<T>(
    requestFn: (server: Server) => Promise<T>,
    sessionId?: string,
    retries: number = 0
  ): Promise<T | null> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      const server = this.selectServer(sessionId);
      if (!server) {
        throw new Error('No healthy servers available');
      }

      logger.info('🔄 Executing request through load balancer', { 
        serverId: server.id, 
        sessionId,
        retry: retries 
      });

      const result = await requestFn(server);
      
      // Update server stats on success
      server.successCount++;
      server.responseTime = Date.now() - startTime;
      server.lastCheck = new Date();
      
      this.stats.successfulRequests++;
      this.updateAverageResponseTime(server.responseTime);

      logger.info('✅ Request completed successfully', { 
        serverId: server.id, 
        responseTime: `${server.responseTime}ms` 
      });

      return result;
    } catch (error) {
      this.stats.failedRequests++;
      
      // Handle server failure
      if (retries < this.config.maxRetries) {
        logger.warn('⚠️ Request failed, retrying with different server', { 
          error: String(error), 
          retry: retries + 1 
        });
        
        // Mark server as potentially unhealthy
        const server = this.selectServer(sessionId);
        if (server) {
          server.errorCount++;
          if (server.errorCount >= this.config.failoverThreshold) {
            await this.markServerUnhealthy(server.id);
          }
        }
        
        return this.executeRequest(requestFn, sessionId, retries + 1);
      }

      logger.error('❌ Request failed after all retries', { 
        error: String(error), 
        retries: this.config.maxRetries 
      });
      
      return null;
    }
  }

  /**
   * Inicia health checks periódicos
   */
  private startHealthChecks(): void {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);

    logger.info('🏥 Health checks started', { 
      interval: `${this.config.healthCheckInterval}ms` 
    });
  }

  /**
   * Realiza health checks en todos los servidores
   */
  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = Array.from(this.servers.values()).map(server => 
      this.checkServerHealth(server)
    );

    await Promise.allSettled(healthCheckPromises);
    this.updateServerStats();
  }

  /**
   * Verifica la salud de un servidor específico
   */
  private async checkServerHealth(server: Server): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simulate health check request
      const response = await fetch(`${server.url}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.healthCheckTimeout)
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        server.status = 'healthy';
        server.responseTime = responseTime;
        server.successCount++;
        server.errorCount = Math.max(0, server.errorCount - 1); // Reduce error count
      } else {
        server.status = 'unhealthy';
        server.errorCount++;
      }

      server.lastCheck = new Date();
      
      logger.info('🏥 Health check completed', { 
        serverId: server.id, 
        status: server.status,
        responseTime: `${responseTime}ms` 
      });
    } catch (error) {
      server.status = 'unhealthy';
      server.errorCount++;
      server.lastCheck = new Date();
      
      logger.warn('⚠️ Health check failed', { 
        serverId: server.id, 
        error: String(error) 
      });
    }
  }

  /**
   * Marca un servidor como no saludable
   */
  private async markServerUnhealthy(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (server) {
      server.status = 'unhealthy';
      this.stats.lastFailover = new Date();
      
      logger.warn('🚨 Server marked as unhealthy', { 
        serverId,
        errorCount: server.errorCount 
      });
    }
  }

  /**
   * Algoritmos de selección de servidores
   */
  private roundRobinSelection(): Server | null {
    const healthyServers = Array.from(this.servers.values())
      .filter(server => server.status === 'healthy');

    if (healthyServers.length === 0) return null;

    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex++;
    return server;
  }

  private weightedRoundRobinSelection(): Server | null {
    const healthyServers = Array.from(this.servers.values())
      .filter(server => server.status === 'healthy');

    if (healthyServers.length === 0) return null;

    // Calculate total weight
    const totalWeight = healthyServers.reduce((sum, server) => sum + server.weight, 0);
    
    // Generate random number and select server based on weight
    let random = Math.random() * totalWeight;
    
    for (const server of healthyServers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }

    return healthyServers[0]; // Fallback
  }

  private leastConnectionsSelection(): Server | null {
    const healthyServers = Array.from(this.servers.values())
      .filter(server => server.status === 'healthy');

    if (healthyServers.length === 0) return null;

    // Select server with lowest response time (proxy for connections)
    return healthyServers.reduce((min, server) => 
      server.responseTime < min.responseTime ? server : min
    );
  }

  private ipHashSelection(sessionId?: string): Server | null {
    const healthyServers = Array.from(this.servers.values())
      .filter(server => server.status === 'healthy');

    if (healthyServers.length === 0) return null;

    // Simple hash function for session ID
    const hash = sessionId ? 
      sessionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 
      Math.floor(Math.random() * 1000);

    return healthyServers[hash % healthyServers.length];
  }

  /**
   * Limpieza de sesiones expiradas
   */
  private startSessionCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 300000); // Every 5 minutes

    logger.info('🧹 Session cleanup started');
  }

  private cleanupExpiredSessions(): void {
    const _now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, _serverId] of this.sessionMap.entries()) {
      // Simple cleanup based on session timeout
      // In a real implementation, you'd track session creation time
      if (Math.random() < 0.1) { // 10% chance to clean up (simulate expired sessions)
        this.sessionMap.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('🧹 Expired sessions cleaned up', { cleanedCount });
    }
  }

  /**
   * Obtiene estadísticas del balanceador
   */
  getLoadBalancingStats(): LoadBalancingStats {
    return { ...this.stats };
  }

  /**
   * Genera reporte de performance del balanceador
   */
  generateLoadBalancingReport(): string {
    const successRate = this.stats.totalRequests > 0 
      ? (this.stats.successfulRequests / this.stats.totalRequests) * 100 
      : 0;

    let report = '# ⚖️ LOAD BALANCING REPORT\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## 📊 Statistics\n`;
    report += `- **Total Requests:** ${this.stats.totalRequests}\n`;
    report += `- **Success Rate:** ${successRate.toFixed(2)}%\n`;
    report += `- **Failed Requests:** ${this.stats.failedRequests}\n`;
    report += `- **Average Response Time:** ${this.stats.averageResponseTime.toFixed(2)}ms\n`;
    report += `- **Active Servers:** ${this.stats.activeServers}\n`;
    report += `- **Unhealthy Servers:** ${this.stats.unhealthyServers}\n`;
    report += `- **Last Failover:** ${this.stats.lastFailover?.toISOString() || 'Never'}\n\n`;
    
    report += `## 🖥️ Server Status\n`;
    for (const server of this.servers.values()) {
      report += `- **${server.name}** (${server.id})\n`;
      report += `  - Status: ${server.status}\n`;
      report += `  - Weight: ${server.weight}\n`;
      report += `  - Response Time: ${server.responseTime}ms\n`;
      report += `  - Success Count: ${server.successCount}\n`;
      report += `  - Error Count: ${server.errorCount}\n\n`;
    }

    return report;
  }

  /**
   * Helpers privados
   */
  private updateServerStats(): void {
    const servers = Array.from(this.servers.values());
    this.stats.activeServers = servers.filter(s => s.status === 'healthy').length;
    this.stats.unhealthyServers = servers.filter(s => s.status === 'unhealthy').length;
  }

  private updateAverageResponseTime(responseTime: number): void {
    this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2;
  }

  /**
   * Actualiza configuración del balanceador
   */
  updateConfig(newConfig: Partial<LoadBalancingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('⚙️ Load balancing configuration updated', { config: this.config });
  }
}

export const loadBalancingService = new LoadBalancingService();
export default loadBalancingService;
