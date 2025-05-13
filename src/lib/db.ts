import { DB_CONFIG, isDevelopment } from './env';

// Interface para definir o formato do resultado das queries
interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Determinar se estamos em um ambiente de navegador
const isBrowser = typeof window !== 'undefined';

// Classe Pool Mock para casos de fallback
class MockPool {
  async query(text: string, params?: any[]): Promise<QueryResult> {
    console.log('Mock query executada:', { text, params });
    
    // Simular um atraso de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Retornar resultado simulado
    return {
      rows: [],
      rowCount: 0
    };
  }

  on(event: string, listener: (...args: any[]) => void): void {
    // Mock da função on
    console.log(`Mock Pool.on(${event}) chamado`);
  }
}

// Configuração da pool - tentaremos usar a implementação real em todos os casos
let pool: any;

try {
  // Importação dinâmica para evitar erro no navegador
  const { Pool } = require('pg');
  pool = new Pool({
    user: DB_CONFIG.user,
    host: DB_CONFIG.host,
    database: DB_CONFIG.database,
    password: DB_CONFIG.password,
    port: DB_CONFIG.port,
    // Definir um timeout para evitar conexões penduradas
    connectionTimeoutMillis: 5000,
    // Limite de tentativas de conexão
    max: 20,
    // Tempo de inatividade antes de encerrar a conexão
    idleTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false // Importante para conexões remotas
    }
  });

  // Monitorar eventos da pool
  pool.on('connect', () => {
    console.log('🔌 Nova conexão estabelecida com o PostgreSQL');
  });

  pool.on('error', (err: Error) => {
    console.error('❌ Erro inesperado na pool de conexões PostgreSQL', err);
  });
  
  console.log('🔍 Usando conexão real do PostgreSQL');
} catch (error) {
  // Se falhar ao importar pg ou conectar, use mock
  console.warn('⚠️ Erro ao configurar conexão com PostgreSQL, usando mock:', error);
  pool = new MockPool();
}

/**
 * Função utilitária para executar consultas SQL
 * @param text - Query SQL
 * @param params - Parâmetros da query
 * @returns Promise com resultado da query
 */
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    console.log('🔷 Executando query:', { 
      text,
      params: params ? JSON.stringify(params) : undefined
    });
    
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Em desenvolvimento, logamos mais informações
    if (isDevelopment) {
      console.log('✅ Query executada com sucesso', { 
        text, 
        duration, 
        rows: result.rowCount,
        firstRow: result.rows[0] ? JSON.stringify(result.rows[0]).substring(0, 200) + '...' : 'sem resultados'
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Erro ao executar query:', {
      text,
      params: params ? JSON.stringify(params) : undefined,
      error: (error as Error).message,
      duration
    });
    console.error((error as Error).stack);
    throw error;
  }
};

/**
 * Testa a conexão com o banco de dados
 * @returns Promise indicando se a conexão está ok
 */
export const testConnection = async () => {
  try {
    console.log('🔍 Testando conexão com PostgreSQL...');
    
    // Tentamos a conexão real em qualquer ambiente
    const result = await pool.query('SELECT NOW()');
    
    console.log('✅ Conexão com PostgreSQL testada com sucesso:', result.rows[0]?.now);
    
    return {
      success: true,
      timestamp: result.rows[0]?.now || new Date().toISOString(),
      message: 'Conexão com o PostgreSQL estabelecida com sucesso'
    };
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    return {
      success: false,
      message: `Erro ao conectar ao PostgreSQL: ${(error as Error).message}`
    };
  }
};

// Exporta o pool para ser usado diretamente caso necessário
export default pool; 