// Utilitário para gerenciar variáveis de ambiente
// Isso ajuda a garantir valores padrão e tipos corretos

// Definição de variáveis de ambiente para o projeto ComandeJá

// Verificar se estamos em ambiente de desenvolvimento
export const isDevelopment =
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development');

// Verificar se estamos no navegador
export const isBrowser = typeof window !== 'undefined';

// Verificar se estamos em ambiente Vercel
export const isVercel = 
  (typeof process !== 'undefined' && process.env && !!process.env.VERCEL) ||
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));

// Função para obter variáveis de ambiente de forma segura
function getEnvVar(key: string, defaultValue: string = ''): string {
  // Primeiro tenta buscar do Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[`VITE_${key}`] as string;
    if (value) {
      // Sanitizar a string (remover quebras de linha se existirem)
      return value.replace(/[\r\n\s]+/g, '');
    }
  }

  // Depois tenta buscar do Node.js
  if (typeof process !== 'undefined' && process.env) {
    const prefixedKey = `VITE_${key}`;
    if (process.env[prefixedKey]) {
      // Sanitizar a string (remover quebras de linha se existirem)
      return process.env[prefixedKey]?.replace(/[\r\n\s]+/g, '') || '';
    }
    if (process.env[key]) {
      // Sanitizar a string (remover quebras de linha se existirem)
      return process.env[key]?.replace(/[\r\n\s]+/g, '') || '';
    }
  }

  // Se não conseguir, retorna o valor padrão
  return defaultValue;
}

// Obtém o hostname atual (útil para ambiente Vercel)
export function getCurrentHostname(): string {
  if (isBrowser) {
    return window.location.hostname;
  }
  return getEnvVar('VERCEL_URL', 'comandeja.vercel.app').replace(/https?:\/\//, '');
}

// Hardcoded Supabase config para desenvolvimento (apenas como fallback)
const FALLBACK_SUPABASE_CONFIG = {
  url: 'https://rcintgdnamflzbbqeqjb.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjaW50Z2RuYW1mbHpiYnFlcWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTE1MDAsImV4cCI6MjA2MzI4NzUwMH0.MWsjVopzzIwvXMeVOfEKec_1r0zwuFfliUCH38CZKEY'
};

// Configuração do Supabase
export const SUPABASE_CONFIG = {
  url: getEnvVar('SUPABASE_URL', FALLBACK_SUPABASE_CONFIG.url),
  anonKey: getEnvVar('SUPABASE_ANON_KEY', FALLBACK_SUPABASE_CONFIG.anonKey),
};

// Verificar se a configuração do Supabase está válida, senão usar fallback
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey.includes('\n')) {
  console.warn('Usando configuração fallback para o Supabase devido a problema nas variáveis de ambiente');
  SUPABASE_CONFIG.url = FALLBACK_SUPABASE_CONFIG.url;
  SUPABASE_CONFIG.anonKey = FALLBACK_SUPABASE_CONFIG.anonKey;
}

// URLs da aplicação
export const APP_URLS = {
  api: isVercel 
    ? `https://${getCurrentHostname()}`
    : getEnvVar('API_URL', 'http://localhost:3000'),
  frontend: isVercel
    ? `https://${getCurrentHostname()}`
    : getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
};

// Configurações de JWT
export const JWT_CONFIG = {
  secret: getEnvVar('JWT_SECRET', 'dev_secret_key_for_jwt'),
  expiresIn: '24h',
};

// Configurações para Pagamentos
export const PAYMENT_CONFIG = {
  currency: 'BRL',
  businessDays: [1, 2, 3, 4, 5], // Segunda a Sexta
  timezone: 'America/Sao_Paulo',
};

// Configurações de Upload
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB em bytes
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  storagePath: 'comandeja-uploads',
};

// Retorna informações sobre o ambiente atual
export function getEnvironmentInfo() {
  return {
    isDevelopment,
    isVercel,
    environment: isBrowser ? 'browser' : 'node',
    nodeEnv: typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : undefined,
    viteMode: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.MODE : undefined,
    hostname: getCurrentHostname(),
    api_url: APP_URLS.api,
    supabase_url: SUPABASE_CONFIG.url,
    supabase_key_valid: !!SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey.length > 20
  };
}

// Recupera a URL base da API
export function getApiUrl(): string {
  return APP_URLS.api;
}

// Valida se todas as variáveis de ambiente necessárias estão configuradas
export function validateEnvironment(): boolean {
  const requiredVars = [
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    JWT_CONFIG.secret
  ];

  const missingVars = requiredVars.filter(v => !v);
  
  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente obrigatórias não configuradas');
    return false;
  }
  
  return true;
} 