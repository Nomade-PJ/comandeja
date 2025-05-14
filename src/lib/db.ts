import { DB_CONFIG, isDevelopment } from './env';

// Interface para definir o formato do resultado das queries
interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Função para fazer requisições à API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = 'http://localhost:3000/api';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Função utilitária para executar consultas SQL via API
 */
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  try {
    console.log('🔷 Executando query via API:', { 
      text,
      params: params ? JSON.stringify(params) : undefined
    });
    
    const result = await apiRequest('/query', {
      method: 'POST',
      body: JSON.stringify({ text, params }),
    });
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error);
    throw error;
  }
};

/**
 * Testa a conexão com o banco de dados
 */
export const testConnection = async () => {
  try {
    console.log('🔍 Testando conexão com PostgreSQL...');
    
    const result = await apiRequest('/test-connection');
    
    console.log('✅ Conexão com PostgreSQL testada com sucesso:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    return {
      success: false,
      message: `Erro ao conectar ao PostgreSQL: ${(error as Error).message}`
    };
  }
}; 