// Utilitário para gerenciar variáveis de ambiente
// Isso ajuda a garantir valores padrão e tipos corretos

// Verificar se estamos em ambiente de desenvolvimento
export const isDevelopment = 
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development');

// Verificar se estamos em ambiente de produção na Vercel
export const isVercel = typeof process !== 'undefined' && process.env && !!process.env.VERCEL;

// Obter uma variável de ambiente com fallback
function getEnvVar(key: string, defaultValue: string): string {
  // Verificar se estamos em ambiente Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[`VITE_${key}`] as string) || defaultValue;
  }
  
  // Verificar se estamos em ambiente Node.js
  if (typeof process !== 'undefined' && process.env) {
    const prefixedKey = `VITE_${key}`;
    return process.env[prefixedKey] || process.env[key] || defaultValue;
  }
  
  // Fallback para ambiente desconhecido
  return defaultValue;
}

/**
 * Configurações de banco de dados
 */
export const DB_CONFIG = {
  user: getEnvVar('DB_USER', 'postgres'),
  host: getEnvVar('DB_HOST', 'localhost'),
  database: getEnvVar('DB_NAME', 'ComandeJa_SaaS'),
  password: getEnvVar('DB_PASSWORD', 'Carlos2444h'),
  port: Number(getEnvVar('DB_PORT', '5432')),
};

/**
 * Configurações da API
 * Em produção, usará a URL da Vercel ou a origem atual
 */
export const API_CONFIG = {
  // URL base da API
  url: isVercel 
    ? `https://${getEnvVar('VERCEL_URL', 'comandeja.vercel.app')}`
    : getEnvVar('API_URL', 'http://localhost:3000'),
    
  // Endpoints específicos
  endpoints: {
    testConnection: '/api/test-connection',
    login: '/api/auth/login',
    register: '/api/auth/register',
    user: '/api/user',
  }
};

/**
 * Retorna a URL completa para um endpoint da API
 * @param endpoint Nome do endpoint ou caminho personalizado
 * @returns URL completa
 */
export function getApiUrl(endpoint: string | keyof typeof API_CONFIG.endpoints): string {
  // Verificar se é um endpoint conhecido
  if (typeof endpoint === 'string' && endpoint in API_CONFIG.endpoints) {
    return `${API_CONFIG.url}${API_CONFIG.endpoints[endpoint as keyof typeof API_CONFIG.endpoints]}`;
  }
  
  // Caso contrário, assume que é um caminho personalizado
  return `${API_CONFIG.url}${endpoint}`;
}

/**
 * Verificação de ambiente
 * @returns Informações sobre o ambiente atual
 */
export function getEnvironmentInfo() {
  const isBrowser = typeof window !== 'undefined';
  
  return {
    mode: isDevelopment ? 'development' : 'production',
    environment: isBrowser ? 'browser' : 'node',
    isVercel,
    isDevelopment,
    dbConfig: {
      ...DB_CONFIG,
      // Não mostramos a senha em registros
      password: DB_CONFIG.password ? '****' : undefined,
    },
  };
}

/**
 * Verifica se as variáveis de ambiente necessárias estão definidas
 * @returns true se todas as variáveis necessárias estão definidas
 */
export function validateEnvironment(): boolean {
  const requiredVars = [
    DB_CONFIG.user,
    DB_CONFIG.host,
    DB_CONFIG.database,
    DB_CONFIG.password,
    DB_CONFIG.port,
  ];

  return requiredVars.every(Boolean);
} 