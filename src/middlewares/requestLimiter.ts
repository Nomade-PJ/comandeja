/**
 * Middleware para limitar requisições e evitar erros de ERR_INSUFFICIENT_RESOURCES
 * Este arquivo implementa um limitador de taxa de requisições para o Supabase
 */

// Armazena o número de requisições por endpoint
interface RequestCounter {
  count: number;
  timestamp: number;
  queue: Array<() => Promise<any>>;
  processing: boolean;
}

// Configurações do limitador
const REQUEST_LIMITS = {
  // Máximo de requisições por janela de tempo
  maxRequestsPerWindow: 3,
  // Duração da janela de tempo em ms (2 segundos)
  windowDuration: 2000,
  // Tempo de espera entre requisições em ms
  requestDelay: 300,
};

// Armazena contadores por endpoint
const requestCounters: Record<string, RequestCounter> = {};

/**
 * Limpa contadores antigos que já expiraram
 */
function cleanupCounters() {
  const now = Date.now();
  Object.keys(requestCounters).forEach(endpoint => {
    if (now - requestCounters[endpoint].timestamp > REQUEST_LIMITS.windowDuration) {
      delete requestCounters[endpoint];
    }
  });
}

/**
 * Processa a fila de requisições para um endpoint
 */
async function processQueue(endpoint: string) {
  const counter = requestCounters[endpoint];
  if (!counter || counter.processing || counter.queue.length === 0) {
    return;
  }

  counter.processing = true;

  try {
    while (counter.queue.length > 0) {
      const request = counter.queue.shift();
      if (request) {
        await request();
        // Esperar um tempo entre requisições
        await new Promise(resolve => setTimeout(resolve, REQUEST_LIMITS.requestDelay));
      }
    }
  } finally {
    counter.processing = false;
  }
}

/**
 * Verifica se uma requisição pode ser feita imediatamente
 * ou se deve ser enfileirada
 */
export function canMakeRequest(endpoint: string): boolean {
  cleanupCounters();
  
  const now = Date.now();
  const counter = requestCounters[endpoint] || {
    count: 0,
    timestamp: now,
    queue: [],
    processing: false
  };
  
  // Se estamos dentro da janela de tempo e já atingimos o limite
  if (now - counter.timestamp < REQUEST_LIMITS.windowDuration && 
      counter.count >= REQUEST_LIMITS.maxRequestsPerWindow) {
    return false;
  }
  
  // Atualizar ou criar contador
  if (!requestCounters[endpoint]) {
    requestCounters[endpoint] = counter;
  }
  
  // Incrementar contador
  counter.count++;
  
  return true;
}

/**
 * Enfileira uma requisição para ser executada quando possível
 */
export function enqueueRequest<T>(
  endpoint: string, 
  requestFn: () => Promise<T>
): Promise<T> {
  cleanupCounters();
  
  const now = Date.now();
  
  // Inicializar contador se não existir
  if (!requestCounters[endpoint]) {
    requestCounters[endpoint] = {
      count: 0,
      timestamp: now,
      queue: [],
      processing: false
    };
  }
  
  const counter = requestCounters[endpoint];
  
  // Se podemos fazer a requisição imediatamente
  if (canMakeRequest(endpoint)) {
    counter.count++;
    return requestFn();
  }
  
  // Caso contrário, enfileirar a requisição
  return new Promise((resolve, reject) => {
    counter.queue.push(async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    // Iniciar processamento da fila se não estiver em andamento
    processQueue(endpoint);
  });
}

/**
 * Aplica o middleware ao cliente Supabase
 * Esta função deve ser chamada após a criação do cliente
 */
export function applyRequestLimiter(supabaseClient: any): void {
  // Guarda referência ao método original
  const originalFrom = supabaseClient.from;
  
  // Substitui o método from para aplicar limitação de requisições
  supabaseClient.from = function(table: string) {
    const result = originalFrom.apply(this, [table]);
    
    // Intercepta o método select
    const originalSelect = result.select;
    result.select = function(...args: any[]) {
      const selectResult = originalSelect.apply(this, args);
      const originalThen = selectResult.then;
      
      // Substitui o método then para aplicar limitação
      selectResult.then = function(onFulfilled: any, onRejected: any) {
        const endpoint = `${table}/select`;
        
        return enqueueRequest(endpoint, () => {
          return originalThen.apply(this, [onFulfilled, onRejected]);
        });
      };
      
      return selectResult;
    };
    
    return result;
  };
} 