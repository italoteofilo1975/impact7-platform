/**
 * Cache Service - SET7.06 Operação e Eficiência
 * 
 * Implementação de cache em memória com TTL e LRU eviction.
 * Cache em memória, sem Redis externo.
 * 
 * Pode ser facilmente substituído por Redis em produção.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessedAt: number;
}

interface CacheOptions {
  /** TTL em segundos */
  ttl?: number;
  /** Tamanho máximo do cache */
  maxSize?: number;
  /** Nome do cache para logs */
  name?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
}

class MemoryCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly name: string;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    evictions: 0,
  };

  constructor(options: CacheOptions = {}) {
    this.ttl = (options.ttl || 300) * 1000; // Default 5 minutes
    this.maxSize = options.maxSize || 1000;
    this.name = options.name || 'default';
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return undefined;
    }
    
    // Update access time for LRU
    entry.accessedAt = Date.now();
    this.stats.hits++;
    
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttlOverride?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    const ttl = ttlOverride ? ttlOverride * 1000 : this.ttl;
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      accessedAt: Date.now(),
    });
    
    this.stats.size = this.cache.size;
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.stats.size = this.cache.size;
    return result;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Get or set with callback
   */
  async getOrSet(key: string, factory: () => Promise<T>, ttlOverride?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const value = await factory();
    this.set(key, value, ttlOverride);
    return value;
  }

  /**
   * Invalidate keys matching pattern
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let count = 0;
    
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      count++;
    });
    
    this.stats.size = this.cache.size;
    return count;
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    });
    expiredKeys.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    this.cache.forEach((entry, key) => {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }
}

// ============================================
// Cache Instances
// ============================================

/**
 * Cache para respostas do Jarvis
 * TTL: 10 minutos, Max: 500 entries
 */
export const jarvisCache = new MemoryCache<{
  response: string;
  timestamp: number;
}>({
  ttl: 600,
  maxSize: 500,
  name: 'jarvis',
});

/**
 * Cache para knowledge base
 * TTL: 30 minutos, Max: 200 entries
 */
export const knowledgeCache = new MemoryCache<{
  documents: unknown[];
  query: string;
}>({
  ttl: 1800,
  maxSize: 200,
  name: 'knowledge',
});

/**
 * Cache para cálculos de impacto
 * TTL: 1 hora, Max: 1000 entries
 */
export const calculatorCache = new MemoryCache<{
  result: {
    impactScore: number;
    sRoi: number;
    socialValue: number;
    rating: string;
  };
  input: string;
}>({
  ttl: 3600,
  maxSize: 1000,
  name: 'calculator',
});

/**
 * Cache para métricas de analytics
 * TTL: 5 minutos, Max: 100 entries
 */
export const analyticsCache = new MemoryCache<unknown>({
  ttl: 300,
  maxSize: 100,
  name: 'analytics',
});

/**
 * Cache para Social Proof (métricas, certificações, parceiros, cases em destaque)
 * TTL: 5 minutos, Max: 50 entries
 */
export const socialProofCache = new MemoryCache<unknown>({
  ttl: 300,
  maxSize: 50,
  name: 'socialProof',
});

/**
 * Cache para Cases (aggregate stats, listagem pública)
 * TTL: 5 minutos, Max: 100 entries
 */
export const casesCache = new MemoryCache<unknown>({
  ttl: 300,
  maxSize: 100,
  name: 'cases',
});

/**
 * Cache para Blog (artigos públicos)
 * TTL: 10 minutos, Max: 200 entries
 */
export const blogCache = new MemoryCache<unknown>({
  ttl: 600,
  maxSize: 200,
  name: 'blog',
});

/**
 * Cache para Eventos/Webinars
 * TTL: 5 minutos, Max: 100 entries
 */
export const eventsCache = new MemoryCache<unknown>({
  ttl: 300,
  maxSize: 100,
  name: 'events',
});

// ============================================
// Helper Functions
// ============================================

/**
 * Generate cache key from object
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}:${JSON.stringify(params[k])}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}

/**
 * Get all cache stats
 */
export function getAllCacheStats(): Record<string, CacheStats & { hitRate: number }> {
  return {
    jarvis: jarvisCache.getStats(),
    knowledge: knowledgeCache.getStats(),
    calculator: calculatorCache.getStats(),
    analytics: analyticsCache.getStats(),
    socialProof: socialProofCache.getStats(),
    cases: casesCache.getStats(),
    blog: blogCache.getStats(),
    events: eventsCache.getStats(),
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  jarvisCache.clear();
  knowledgeCache.clear();
  calculatorCache.clear();
  analyticsCache.clear();
  socialProofCache.clear();
  casesCache.clear();
  blogCache.clear();
  eventsCache.clear();
}

export { MemoryCache };
export type { CacheOptions, CacheStats };
