// securityUtils.ts - Utilitários para segurança
import { createServer } from 'http';

// Interface para objetos de utilitários de segurança
export interface SecurityUtils {
  applySecurityHeaders: (res: Response) => Response;
  isHttps: (url: string) => boolean;
  redirectToHttps: (currentUrl: string) => string | null;
  validateCsrfToken: (request: Request, csrfTokenCookieName?: string, csrfTokenHeaderName?: string) => boolean;
  parseCookies: (cookieString: string) => Record<string, string>;
  createCsrfErrorResponse: () => Response;
}

// Função para criar um middleware de segurança
export const createSecurityMiddleware = (securityUtils: SecurityUtils) => {
  return async (req: Request, res: Response, next: () => void) => {
    try {
      // Verificar se precisa redirecionar para HTTPS
      const currentUrl = req.url;
      const redirectUrl = securityUtils.redirectToHttps(currentUrl);
      
      if (redirectUrl) {
        // Redirecionar para HTTPS
        const redirectResponse = new Response(null, {
          status: 301,
          headers: {
            'Location': redirectUrl
          }
        });
        return securityUtils.applySecurityHeaders(redirectResponse);
      }
      
      // Verificar CSRF token para métodos não seguros (exceto para rota de login e signup)
      if (
        import.meta.env.VITE_ENABLE_CSRF_PROTECTION === 'true' &&
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
        !req.url.includes('/api/auth/') &&
        !req.url.includes('/login') &&
        !req.url.includes('/register')
      ) {
        if (!securityUtils.validateCsrfToken(req)) {
          return securityUtils.createCsrfErrorResponse();
        }
      }
      
      // Continuar com o fluxo normal
      next();
      
      // Aplicar cabeçalhos de segurança à resposta
      return securityUtils.applySecurityHeaders(res);
    } catch (error) {
      console.error('Erro no middleware de segurança:', error);
      next();
      return res;
    }
  };
};

// Função para gerar token CSRF
export const generateCsrfToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Função para configurar o token CSRF no cliente
export const setupCsrfProtection = (): string => {
  const token = generateCsrfToken();
  // Armazenar em cookie
  document.cookie = `csrf-token=${token}; path=/; samesite=strict; secure`;
  // Retornar o token para ser usado em requisições
  return token;
};

// Função para adicionar token CSRF a um objeto de headers
export const addCsrfHeader = (headers: Record<string, string> = {}): Record<string, string> => {
  // Extrair token CSRF do cookie
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name) acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const csrfToken = cookies['csrf-token'];
  
  if (csrfToken) {
    return {
      ...headers,
      'X-CSRF-Token': csrfToken
    };
  }
  
  return headers;
}; 