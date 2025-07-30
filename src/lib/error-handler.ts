import { PostgrestError, AuthError } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Tipo para erros do Supabase
export type SupabaseError = PostgrestError | AuthError | Error | unknown;

// Interface para opções de tratamento de erros
export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
  fallbackMessage?: string;
  onError?: (error: SupabaseError) => void;
}

// Mapeamento de códigos de erro para mensagens amigáveis
const errorMessages: Record<string, string> = {
  // Erros de autenticação
  'auth/invalid-email': 'O email fornecido é inválido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/email-already-in-use': 'Este email já está em uso.',
  'auth/weak-password': 'A senha é muito fraca.',
  'auth/invalid-credential': 'Credenciais inválidas.',
  
  // Erros de banco de dados
  '23505': 'Este registro já existe.',
  '23503': 'Este registro não pode ser excluído pois está sendo usado em outro lugar.',
  '42P01': 'Tabela não encontrada.',
  '42703': 'Coluna não encontrada.',
  '23502': 'Valor obrigatório não fornecido.',
  '400': 'Requisição inválida. Verifique os parâmetros fornecidos.',
  
  // Erros de rede
  'failed-fetch': 'Falha na conexão. Verifique sua internet.',
  'network-error': 'Erro de rede. Tente novamente mais tarde.',
  'timeout': 'A operação excedeu o tempo limite. Tente novamente.',
  
  // Erros de permissão
  'insufficient-permissions': 'Você não tem permissão para realizar esta ação.',
  'row-level-security-violation': 'Você não tem permissão para acessar este recurso.',
  
  // Erros específicos da aplicação
  'missing-restaurant-id': 'ID do restaurante não disponível. Tente fazer login novamente.',
  'bad-request': 'Requisição inválida. Verifique os parâmetros fornecidos.',
};

// Função para extrair código de erro do objeto de erro
function extractErrorCode(error: SupabaseError): string {
  if (!error) return 'unknown-error';
  
  // Erro do PostgreSQL
  if (typeof error === 'object' && error !== null && 'code' in error && error.code) {
    return error.code.toString();
  }
  
  // Erro HTTP específico
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = Number(error.status);
    if (status === 400) return 'bad-request';
    if (status === 401) return 'insufficient-permissions';
    if (status === 403) return 'row-level-security-violation';
    if (status === 404) return 'not-found';
    if (status === 500) return 'server-error';
    if (status) return `http-${status}`;
  }
  
  // Erro de autenticação
  if (typeof error === 'object' && error !== null && 'message' in error && error.message) {
    const message = String(error.message).toLowerCase();
    
    if (message.includes('network')) return 'network-error';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('fetch')) return 'failed-fetch';
    if (message.includes('permission') || message.includes('not allowed')) return 'insufficient-permissions';
    if (message.includes('security') || message.includes('policy')) return 'row-level-security-violation';
    if (message.includes('restaurant_id') && (message.includes('missing') || message.includes('empty'))) return 'missing-restaurant-id';
    if (message.includes('bad request') || message.includes('400')) return 'bad-request';
    
    // Extrair código de erro de autenticação
    if (message.includes('auth/')) {
      const match = message.match(/auth\/[\w-]+/);
      if (match) return match[0];
    }
  }
  
  return 'unknown-error';
}

// Função para obter mensagem amigável baseada no erro
export function getFriendlyErrorMessage(error: SupabaseError): string {
  const errorCode = extractErrorCode(error);
  
  // Retornar mensagem mapeada ou mensagem genérica
  return errorMessages[errorCode] || 'Ocorreu um erro. Tente novamente mais tarde.';
}

// Função principal para tratamento de erros
export function handleError(
  error: SupabaseError, 
  options: ErrorHandlerOptions = {
    showToast: true,
    logToConsole: true,
    context: 'Operação',
    fallbackMessage: 'Ocorreu um erro. Tente novamente mais tarde.'
  }
): void {
  const { showToast, logToConsole, context, fallbackMessage, onError } = options;
  
  // Obter mensagem amigável
  const friendlyMessage = getFriendlyErrorMessage(error) || fallbackMessage;
  const errorCode = extractErrorCode(error);
  
  // Mostrar toast se solicitado
  if (showToast) {
    toast({
      title: `${context || 'Operação'} falhou`,
      description: friendlyMessage,
      variant: 'destructive',
    });
  }
  
  // Registrar no console se solicitado
  if (logToConsole) {
    console.error(`[${context || 'Error'}] Code: ${errorCode}`, error);
  }
  
  // Executar callback personalizado se fornecido
  if (onError) {
    onError(error);
  }
}

// Função de utilidade para envolver funções assíncronas com tratamento de erro
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return null;
  }
}

// Função para verificar se um erro é devido a conexão offline
export function isOfflineError(error: SupabaseError): boolean {
  if (!error) return false;
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String(error.message).toLowerCase();
    return message.includes('network') || 
           message.includes('offline') || 
           message.includes('internet') || 
           message.includes('connection') ||
           message.includes('fetch');
  }
  
  return false;
}

// Função para verificar se um erro é devido a permissões insuficientes
export function isPermissionError(error: SupabaseError): boolean {
  if (!error) return false;
  
  if (typeof error === 'object' && error !== null) {
    if ('code' in error && error.code === 'PGRST301') return true;
    if ('message' in error) {
      const message = String(error.message).toLowerCase();
      return message.includes('permission') || 
             message.includes('not allowed') ||
             message.includes('unauthorized') ||
             message.includes('policy');
    }
  }
  
  return false;
} 