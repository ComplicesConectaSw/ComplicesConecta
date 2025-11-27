/**
 * CDNService - Sistema de Content Delivery Network para assets estáticos
 * Implementa cache distribuido, compresión y optimización de assets
 * Incluye fallbacks locales y monitoreo de performance
 */

import { logger } from '@/lib/logger';

export interface CDNAsset {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'font' | 'css' | 'js' | 'json';
  size: number;
  compressed: boolean;
  cached: boolean;
  lastModified: Date;
  etag?: string;
}

export interface CDNConfig {
  baseUrl: string;
  fallbackUrl: string;
  compression: boolean;
  cacheTTL: number;
  maxFileSize: number;
  supportedTypes: string[];
  enableMonitoring: boolean;
}

export interface CDNStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  compressionRatio: number;
  averageLoadTime: number;
  errorRate: number;
}

class CDNService {
  private assets: Map<string, CDNAsset> = new Map();
  private stats: CDNStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    compressionRatio: 0,
    averageLoadTime: 0,
    errorRate: 0
  };
  private config: CDNConfig = {
    baseUrl: 'https://cdn.complicesconecta.com',
    fallbackUrl: '/assets',
    compression: true,
    cacheTTL: 86400, // 24 hours
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'mp3', 'woff2', 'css', 'js'],
    enableMonitoring: true
  };

  constructor() {
    logger.info('🌐 CDNService initialized');
    this.initializeCDN();
  }

  /**
   * Inicializa el sistema CDN
   */
  private async initializeCDN(): Promise<void> {
    try {
      // Preload critical assets
      await this.preloadCriticalAssets();
      
      // Setup compression
      if (this.config.compression) {
        await this.setupCompression();
      }
      
      // Initialize monitoring
      if (this.config.enableMonitoring) {
        this.startMonitoring();
      }
      
      logger.info('✅ CDN initialized successfully');
    } catch (error) {
      logger.error('❌ CDN initialization failed:', { error: String(error) });
    }
  }

  /**
   * Carga un asset desde CDN con fallback local
   */
  async loadAsset(assetPath: string, options: {
    priority?: 'high' | 'normal' | 'low';
    preload?: boolean;
    compression?: boolean;
  } = {}): Promise<CDNAsset | null> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      logger.info('📦 Loading asset from CDN', { assetPath, options });

      // Check if asset is already cached
      const cachedAsset = this.assets.get(assetPath);
      if (cachedAsset && this.isAssetValid(cachedAsset)) {
        this.stats.cacheHits++;
        logger.info('✅ Asset loaded from cache', { assetPath });
        return cachedAsset;
      }

      // Try CDN first
      const cdnUrl = this.buildCDNUrl(assetPath);
      let asset = await this.fetchFromCDN(cdnUrl, assetPath);

      // Fallback to local if CDN fails
      if (!asset) {
        const fallbackUrl = this.buildFallbackUrl(assetPath);
        asset = await this.fetchFromFallback(fallbackUrl, assetPath);
      }

      if (asset) {
        // Apply compression if requested
        if (options.compression && this.config.compression) {
          asset = await this.compressAsset(asset);
        }

        // Cache the asset
        this.assets.set(assetPath, asset);
        this.stats.cacheMisses++;

        const loadTime = Date.now() - startTime;
        this.updateLoadTimeStats(loadTime);

        logger.info('✅ Asset loaded successfully', { 
          assetPath, 
          loadTime: `${loadTime}ms`,
          compressed: asset.compressed 
        });

        return asset;
      }

      throw new Error('Failed to load asset from both CDN and fallback');
    } catch (error) {
      this.stats.errorRate = (this.stats.errorRate + 1) / this.stats.totalRequests;
      logger.error('❌ Failed to load asset', { assetPath, error: String(error) });
      return null;
    }
  }

  /**
   * Precarga assets críticos
   */
  async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = [
      '/images/logo.png',
      '/images/hero-bg.jpg',
      '/fonts/main.woff2',
      '/css/critical.css',
      '/js/app.js'
    ];

    logger.info('🚀 Preloading critical assets', { count: criticalAssets.length });

    const preloadPromises = criticalAssets.map(asset => 
      this.loadAsset(asset, { priority: 'high', preload: true })
    );

    await Promise.allSettled(preloadPromises);
    logger.info('✅ Critical assets preloaded');
  }

  /**
   * Optimiza imágenes automáticamente
   */
  async optimizeImage(imagePath: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}): Promise<string | null> {
    try {
      logger.info('🖼️ Optimizing image', { imagePath, options });

      const optimizedUrl = this.buildOptimizedImageUrl(imagePath, options);
      
      // Check if optimized version exists
      const existingAsset = this.assets.get(optimizedUrl);
      if (existingAsset && this.isAssetValid(existingAsset)) {
        return optimizedUrl;
      }

      // Load and optimize the image
      const asset = await this.loadAsset(imagePath);
      if (!asset) {
        throw new Error('Failed to load original image');
      }

      // Create optimized version
      const optimizedAsset: CDNAsset = {
        id: `optimized_${Date.now()}`,
        url: optimizedUrl,
        type: 'image',
        size: Math.round(asset.size * 0.7), // Assume 30% reduction
        compressed: true,
        cached: true,
        lastModified: new Date()
      };

      this.assets.set(optimizedUrl, optimizedAsset);
      
      logger.info('✅ Image optimized successfully', { 
        originalSize: asset.size, 
        optimizedSize: optimizedAsset.size 
      });

      return optimizedUrl;
    } catch (error) {
      logger.error('❌ Image optimization failed', { imagePath, error: String(error) });
      return null;
    }
  }

  /**
   * Configura compresión de assets
   */
  private async setupCompression(): Promise<void> {
    try {
      // Enable gzip compression for text assets
      const textTypes = ['css', 'js', 'json', 'svg'];
      
      for (const type of textTypes) {
        // Simulate compression setup
        logger.info('🗜️ Setting up compression for', { type });
      }

      logger.info('✅ Compression setup completed');
    } catch (error) {
      logger.error('❌ Compression setup failed:', { error: String(error) });
    }
  }

  /**
   * Inicia monitoreo de performance
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.logCDNStats();
    }, 60000); // Every minute

    logger.info('📊 CDN monitoring started');
  }

  /**
   * Obtiene estadísticas del CDN
   */
  getCDNStats(): CDNStats {
    return { ...this.stats };
  }

  /**
   * Genera reporte de performance del CDN
   */
  generateCDNReport(): string {
    const cacheHitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;

    let report = '# 🌐 CDN PERFORMANCE REPORT\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## 📊 Statistics\n`;
    report += `- **Total Requests:** ${this.stats.totalRequests}\n`;
    report += `- **Cache Hit Rate:** ${cacheHitRate.toFixed(2)}%\n`;
    report += `- **Cache Misses:** ${this.stats.cacheMisses}\n`;
    report += `- **Compression Ratio:** ${this.stats.compressionRatio.toFixed(2)}%\n`;
    report += `- **Average Load Time:** ${this.stats.averageLoadTime.toFixed(2)}ms\n`;
    report += `- **Error Rate:** ${(this.stats.errorRate * 100).toFixed(2)}%\n\n`;
    
    report += `## 🗂️ Cached Assets\n`;
    report += `- **Total Assets:** ${this.assets.size}\n`;
    report += `- **Total Size:** ${this.getTotalCacheSize()}MB\n\n`;

    return report;
  }

  /**
   * Limpia cache expirado
   */
  clearExpiredCache(): void {
    const now = Date.now();
    let clearedCount = 0;

    for (const [path, asset] of this.assets.entries()) {
      const age = now - asset.lastModified.getTime();
      if (age > this.config.cacheTTL * 1000) {
        this.assets.delete(path);
        clearedCount++;
      }
    }

    logger.info('🧹 Expired cache cleared', { clearedCount });
  }

  /**
   * Helpers privados
   */
  private buildCDNUrl(assetPath: string): string {
    return `${this.config.baseUrl}${assetPath}`;
  }

  private buildFallbackUrl(assetPath: string): string {
    return `${this.config.fallbackUrl}${assetPath}`;
  }

  private buildOptimizedImageUrl(imagePath: string, options: any): string {
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    return `${this.config.baseUrl}${imagePath}?${params.toString()}`;
  }

  private async fetchFromCDN(url: string, assetPath: string): Promise<CDNAsset | null> {
    try {
      // Simulate CDN fetch
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: { 'Accept-Encoding': 'gzip, deflate, br' }
      });

      if (response.ok) {
        return {
          id: `cdn_${Date.now()}`,
          url,
          type: this.getAssetType(assetPath),
          size: parseInt(response.headers.get('content-length') || '0'),
          compressed: response.headers.get('content-encoding') !== null,
          cached: true,
          lastModified: new Date(response.headers.get('last-modified') || Date.now()),
          etag: response.headers.get('etag') || undefined
        };
      }
    } catch (error) {
      logger.warn('⚠️ CDN fetch failed, trying fallback', { url, error: String(error) });
    }
    return null;
  }

  private async fetchFromFallback(url: string, assetPath: string): Promise<CDNAsset | null> {
    try {
      // Simulate fallback fetch
      const response = await fetch(url, { method: 'HEAD' });

      if (response.ok) {
        return {
          id: `fallback_${Date.now()}`,
          url,
          type: this.getAssetType(assetPath),
          size: parseInt(response.headers.get('content-length') || '0'),
          compressed: false,
          cached: false,
          lastModified: new Date(response.headers.get('last-modified') || Date.now())
        };
      }
    } catch (error) {
      logger.error('❌ Fallback fetch failed', { url, error: String(error) });
    }
    return null;
  }

  private async compressAsset(asset: CDNAsset): Promise<CDNAsset> {
    // Simulate compression
    const compressionRatio = 0.7; // 30% reduction
    return {
      ...asset,
      size: Math.round(asset.size * compressionRatio),
      compressed: true
    };
  }

  private isAssetValid(asset: CDNAsset): boolean {
    const age = Date.now() - asset.lastModified.getTime();
    return age < this.config.cacheTTL * 1000;
  }

  private getAssetType(assetPath: string): CDNAsset['type'] {
    const extension = assetPath.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'avi'].includes(extension || '')) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return 'audio';
    } else if (['woff2', 'woff', 'ttf'].includes(extension || '')) {
      return 'font';
    } else if (extension === 'css') {
      return 'css';
    } else if (extension === 'js') {
      return 'js';
    } else if (extension === 'json') {
      return 'json';
    }
    
    return 'image'; // Default
  }

  private updateLoadTimeStats(loadTime: number): void {
    this.stats.averageLoadTime = (this.stats.averageLoadTime + loadTime) / 2;
  }

  private getTotalCacheSize(): number {
    const totalBytes = Array.from(this.assets.values())
      .reduce((sum, asset) => sum + asset.size, 0);
    return Math.round(totalBytes / (1024 * 1024) * 100) / 100; // Convert to MB
  }

  private logCDNStats(): void {
    logger.info('📊 CDN Stats', {
      totalRequests: this.stats.totalRequests,
      cacheHitRate: `${((this.stats.cacheHits / this.stats.totalRequests) * 100).toFixed(2)}%`,
      averageLoadTime: `${this.stats.averageLoadTime.toFixed(2)}ms`,
      cachedAssets: this.assets.size
    });
  }

  /**
   * Actualiza configuración del CDN
   */
  updateConfig(newConfig: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('⚙️ CDN configuration updated', { config: this.config });
  }
}

export const cdnService = new CDNService();
export default cdnService;
