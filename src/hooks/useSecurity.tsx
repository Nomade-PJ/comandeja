import { useState, useEffect, useCallback } from 'react';
import { generateCsrfToken, addCsrfHeader } from '../lib/securityUtils';

/**
 * Hook para gerenciar funcionalidades de segurança como CSRF
 */
export const useSecurity = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Inicializar token CSRF
  useEffect(() => {
    // Gerar um novo token CSRF se não existir
    if (!csrfToken) {
      const newToken = generateCsrfToken();
      // Armazenar em cookie
      document.cookie = `csrf-token=${newToken}; path=/; samesite=strict; secure`;
      setCsrfToken(newToken);
    }
  }, [csrfToken]);

  // Função para adicionar cabeçalhos de segurança a uma requisição
  const addSecurityHeaders = useCallback((headers: Record<string, string> = {}): Record<string, string> => {
    // Adicionar cabeçalho CSRF Token
    return addCsrfHeader(headers);
  }, []);

  // Retornar utilidades de segurança
  return {
    csrfToken,
    addSecurityHeaders,
    // Renovar token CSRF manualmente se necessário
    refreshCsrfToken: () => {
      const newToken = generateCsrfToken();
      document.cookie = `csrf-token=${newToken}; path=/; samesite=strict; secure`;
      setCsrfToken(newToken);
      return newToken;
    }
  };
}; 