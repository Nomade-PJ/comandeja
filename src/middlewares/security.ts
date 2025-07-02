/**
 * Middleware de Segurança para Vite/Express
 * 
 * Este módulo fornece configurações de segurança para a aplicação,
 * incluindo cabeçalhos HTTP de segurança e proteção CSRF.
 */

// Função para gerar um token CSRF
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Função para verificar um token CSRF
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

// Configuração de segurança para o Vite
export const securityConfig = {
  // Cabeçalhos de segurança recomendados
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://storage.googleapis.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://storage.googleapis.com;
      font-src 'self';
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      frame-ancestors 'none';
      form-action 'self';
      base-uri 'self';
      object-src 'none'
    `.replace(/\s+/g, ' ').trim()
  },
  
  // Configurações para cookies
  cookieOptions: {
    sameSite: 'strict',
    secure: true,
    httpOnly: true,
    maxAge: 3600 // 1 hora em segundos
  }
};

// Middleware para o Vite que adiciona cabeçalhos de segurança
export const securityMiddleware = (req, res, next) => {
  // Adicionar cabeçalhos de segurança
  Object.entries(securityConfig.headers).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Verificar se é uma requisição mutável (POST, PUT, DELETE, PATCH)
  const isMutable = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  
  if (isMutable) {
    // Verificar token CSRF para requisições que modificam dados
    const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
    const storedToken = req.session?.csrfToken;
    
    if (!csrfToken || !storedToken || !verifyCSRFToken(csrfToken, storedToken)) {
      return res.status(403).json({ error: 'CSRF token inválido ou ausente' });
    }
  }
  
  next();
};

// O arquivo termina aqui. Remover todo o restante! 