/**
 * Utilitários para gerenciamento de cache
 */

// Tipos
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export interface CacheOptions {
  /** Duração do cache em milissegundos */
  duration?: number;
  /** Se true, atualiza o timestamp quando o item é acessado */
  updateOnAccess?: boolean;
  /** Prefixo para a chave de cache */
  prefix?: string;
}

// Constantes
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const DEFAULT_PREFIX = 'comandeja_cache_';

/**
 * Classe para gerenciar o cache em memória
 */
class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Define um item no cache
   * @param key Chave do item
   * @param data Dados a serem armazenados
   * @param options Opções de cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { 
      duration = DEFAULT_CACHE_DURATION,
      prefix = DEFAULT_PREFIX
    } = options;
    
    const prefixedKey = `${prefix}${key}`;
    
    this.cache.set(prefixedKey, {
      data,
      timestamp: Date.now(),
      expiry: duration > 0 ? Date.now() + duration : undefined
    });
  }
  
  /**
   * Obtém um item do cache
   * @param key Chave do item
   * @param options Opções de cache
   * @returns Dados armazenados ou null se não encontrado ou expirado
   */
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const { 
      updateOnAccess = true,
      prefix = DEFAULT_PREFIX
    } = options;
    
    const prefixedKey = `${prefix}${key}`;
    const item = this.cache.get(prefixedKey);
    
    if (!item) {
      return null;
    }
    
    // Verificar se o item expirou
    if (item.expiry && item.expiry < Date.now()) {
      this.delete(key, { prefix });
      return null;
    }
    
    // Atualizar o timestamp se necessário
    if (updateOnAccess) {
      item.timestamp = Date.now();
      this.cache.set(prefixedKey, item);
    }
    
    return item.data;
  }
  
  /**
   * Remove um item do cache
   * @param key Chave do item
   * @param options Opções de cache
   * @returns true se o item foi removido, false caso contrário
   */
  delete(key: string, options: CacheOptions = {}): boolean {
    const { prefix = DEFAULT_PREFIX } = options;
    const prefixedKey = `${prefix}${key}`;
    return this.cache.delete(prefixedKey);
  }
  
  /**
   * Limpa todos os itens expirados do cache
   * @returns Número de itens removidos
   */
  clearExpired(): number {
    const now = Date.now();
    let count = 0;
    
    this.cache.forEach((item, key) => {
      if (item.expiry && item.expiry < now) {
        this.cache.delete(key);
        count++;
      }
    });
    
    return count;
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Obtém o número de itens no cache
   */
  get size(): number {
    return this.cache.size;
  }
}

// Instância global do cache em memória
export const memoryCache = new MemoryCache();

/**
 * Classe para gerenciar o cache no localStorage
 */
class LocalStorageCache {
  /**
   * Define um item no cache
   * @param key Chave do item
   * @param data Dados a serem armazenados
   * @param options Opções de cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { 
      duration = DEFAULT_CACHE_DURATION,
      prefix = DEFAULT_PREFIX
    } = options;
    
    const prefixedKey = `${prefix}${key}`;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: duration > 0 ? Date.now() + duration : undefined
    };
    
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(item));
    } catch (error) {
      console.error('Erro ao armazenar no localStorage:', error);
      // Em caso de erro (como QuotaExceededError), tenta limpar itens expirados
      this.clearExpired();
    }
  }
  
  /**
   * Obtém um item do cache
   * @param key Chave do item
   * @param options Opções de cache
   * @returns Dados armazenados ou null se não encontrado ou expirado
   */
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const { 
      updateOnAccess = true,
      prefix = DEFAULT_PREFIX
    } = options;
    
    const prefixedKey = `${prefix}${key}`;
    
    try {
      const itemStr = localStorage.getItem(prefixedKey);
      if (!itemStr) {
        return null;
      }
      
      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // Verificar se o item expirou
      if (item.expiry && item.expiry < Date.now()) {
        this.delete(key, { prefix });
        return null;
      }
      
      // Atualizar o timestamp se necessário
      if (updateOnAccess) {
        item.timestamp = Date.now();
        localStorage.setItem(prefixedKey, JSON.stringify(item));
      }
      
      return item.data;
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      return null;
    }
  }
  
  /**
   * Remove um item do cache
   * @param key Chave do item
   * @param options Opções de cache
   * @returns true se o item foi removido, false caso contrário
   */
  delete(key: string, options: CacheOptions = {}): boolean {
    const { prefix = DEFAULT_PREFIX } = options;
    const prefixedKey = `${prefix}${key}`;
    
    try {
      if (localStorage.getItem(prefixedKey)) {
        localStorage.removeItem(prefixedKey);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
      return false;
    }
  }
  
  /**
   * Limpa todos os itens expirados do cache
   * @returns Número de itens removidos
   */
  clearExpired(): number {
    const now = Date.now();
    let count = 0;
    
    try {
      const keysToRemove: string[] = [];
      
      // Identificar chaves a serem removidas
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DEFAULT_PREFIX)) {
          try {
            const itemStr = localStorage.getItem(key);
            if (itemStr) {
              const item: CacheItem<any> = JSON.parse(itemStr);
              if (item.expiry && item.expiry < now) {
                keysToRemove.push(key);
              }
            }
          } catch (e) {
            // Ignorar itens que não podem ser analisados
            keysToRemove.push(key);
          }
        }
      }
      
      // Remover as chaves identificadas
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        count++;
      });
      
      return count;
    } catch (error) {
      console.error('Erro ao limpar itens expirados do localStorage:', error);
      return 0;
    }
  }
  
  /**
   * Limpa todo o cache
   */
  clear(prefix = DEFAULT_PREFIX): void {
    try {
      const keysToRemove: string[] = [];
      
      // Identificar chaves a serem removidas
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remover as chaves identificadas
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Erro ao limpar o localStorage:', error);
    }
  }
}

// Instância global do cache no localStorage
export const localStorageCache = new LocalStorageCache();

/**
 * Função para obter dados do cache ou da função de busca
 * @param key Chave do cache
 * @param fetchFn Função para buscar os dados se não estiverem em cache
 * @param options Opções de cache
 * @returns Dados do cache ou da função de busca
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions & { storage?: 'memory' | 'local' } = {}
): Promise<T> {
  const { storage = 'memory', ...cacheOptions } = options;
  const cache = storage === 'local' ? localStorageCache : memoryCache;
  
  // Tentar obter do cache
  const cachedData = cache.get<T>(key, cacheOptions);
  if (cachedData !== null) {
    return cachedData;
  }
  
  // Buscar dados frescos
  try {
    const data = await fetchFn();
    
    // Armazenar no cache
    cache.set(key, data, cacheOptions);
    
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Função para limpar o cache periodicamente
 * @param interval Intervalo em milissegundos (padrão: 5 minutos)
 */
export function setupCacheCleanup(interval = 5 * 60 * 1000): () => void {
  const intervalId = setInterval(() => {
    memoryCache.clearExpired();
    localStorageCache.clearExpired();
  }, interval);
  
  // Retornar função para limpar o intervalo
  return () => clearInterval(intervalId);
} 