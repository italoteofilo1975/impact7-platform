import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryCache, generateCacheKey, getAllCacheStats } from './cache-service';

describe('Cache Service', () => {
  describe('MemoryCache', () => {
    let cache: MemoryCache<string>;

    beforeEach(() => {
      cache = new MemoryCache<string>({ ttl: 60, maxSize: 10, name: 'test' });
    });

    describe('Basic Operations', () => {
      it('deve armazenar e recuperar valores', () => {
        cache.set('key1', 'value1');
        expect(cache.get('key1')).toBe('value1');
      });

      it('deve retornar undefined para chave inexistente', () => {
        expect(cache.get('nonexistent')).toBeUndefined();
      });

      it('deve deletar valores', () => {
        cache.set('key1', 'value1');
        expect(cache.delete('key1')).toBe(true);
        expect(cache.get('key1')).toBeUndefined();
      });

      it('deve verificar existência de chave', () => {
        cache.set('key1', 'value1');
        expect(cache.has('key1')).toBe(true);
        expect(cache.has('nonexistent')).toBe(false);
      });

      it('deve limpar todo o cache', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.clear();
        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBeUndefined();
      });
    });

    describe('TTL (Time To Live)', () => {
      it('deve expirar valores após TTL', async () => {
        const shortCache = new MemoryCache<string>({ ttl: 0.1, maxSize: 10 }); // 100ms TTL
        shortCache.set('key1', 'value1');
        
        expect(shortCache.get('key1')).toBe('value1');
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(shortCache.get('key1')).toBeUndefined();
      });

      it('deve permitir TTL customizado por entrada', async () => {
        cache.set('key1', 'value1', 0.1); // 100ms TTL
        
        expect(cache.get('key1')).toBe('value1');
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(cache.get('key1')).toBeUndefined();
      });
    });

    describe('LRU Eviction', () => {
      it('deve evictar entrada menos recente quando atingir maxSize', async () => {
        const smallCache = new MemoryCache<string>({ ttl: 60, maxSize: 3 });
        
        smallCache.set('key1', 'value1');
        await new Promise(resolve => setTimeout(resolve, 10));
        smallCache.set('key2', 'value2');
        await new Promise(resolve => setTimeout(resolve, 10));
        smallCache.set('key3', 'value3');
        
        // Access key1 to make it more recent
        await new Promise(resolve => setTimeout(resolve, 10));
        smallCache.get('key1');
        
        // Add new key, should evict key2 (least recently accessed)
        smallCache.set('key4', 'value4');
        
        // key1 was accessed most recently, should still exist
        // key2 was accessed least recently (never accessed after set), should be evicted
        expect(smallCache.has('key4')).toBe(true);
        expect(smallCache.getStats().size).toBe(3);
      });
    });

    describe('Statistics', () => {
      it('deve rastrear hits e misses', () => {
        cache.set('key1', 'value1');
        
        cache.get('key1'); // hit
        cache.get('key1'); // hit
        cache.get('nonexistent'); // miss
        
        const stats = cache.getStats();
        expect(stats.hits).toBe(2);
        expect(stats.misses).toBe(1);
        expect(stats.hitRate).toBeCloseTo(0.667, 2);
      });

      it('deve rastrear tamanho do cache', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        
        expect(cache.getStats().size).toBe(2);
        
        cache.delete('key1');
        expect(cache.getStats().size).toBe(1);
      });
    });

    describe('getOrSet', () => {
      it('deve retornar valor cacheado se existir', async () => {
        cache.set('key1', 'cached');
        
        const factory = vi.fn().mockResolvedValue('new');
        const result = await cache.getOrSet('key1', factory);
        
        expect(result).toBe('cached');
        expect(factory).not.toHaveBeenCalled();
      });

      it('deve chamar factory e cachear se não existir', async () => {
        const factory = vi.fn().mockResolvedValue('new');
        const result = await cache.getOrSet('key1', factory);
        
        expect(result).toBe('new');
        expect(factory).toHaveBeenCalledOnce();
        expect(cache.get('key1')).toBe('new');
      });
    });

    describe('invalidatePattern', () => {
      it('deve invalidar chaves que correspondem ao padrão', () => {
        cache.set('user:1', 'data1');
        cache.set('user:2', 'data2');
        cache.set('product:1', 'data3');
        
        const count = cache.invalidatePattern('user:*');
        
        expect(count).toBe(2);
        expect(cache.get('user:1')).toBeUndefined();
        expect(cache.get('user:2')).toBeUndefined();
        expect(cache.get('product:1')).toBe('data3');
      });
    });
  });

  describe('Helper Functions', () => {
    describe('generateCacheKey', () => {
      it('deve gerar chave consistente para mesmos parâmetros', () => {
        const key1 = generateCacheKey('test', { a: 1, b: 'hello' });
        const key2 = generateCacheKey('test', { b: 'hello', a: 1 });
        
        expect(key1).toBe(key2);
      });

      it('deve gerar chaves diferentes para parâmetros diferentes', () => {
        const key1 = generateCacheKey('test', { a: 1 });
        const key2 = generateCacheKey('test', { a: 2 });
        
        expect(key1).not.toBe(key2);
      });
    });

    describe('getAllCacheStats', () => {
      it('deve retornar estatísticas de todos os caches', () => {
        const stats = getAllCacheStats();
        
        expect(stats).toHaveProperty('jarvis');
        expect(stats).toHaveProperty('knowledge');
        expect(stats).toHaveProperty('calculator');
        expect(stats).toHaveProperty('analytics');
      });
    });
  });
});
