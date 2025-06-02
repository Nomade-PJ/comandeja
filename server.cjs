// Servidor Express que usa sintaxe CommonJS para compatibilidade
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod'); // Importar Zod para validação
const helmet = require('helmet');
const fs = require('fs');
const cookieParser = require('cookie-parser');

// Sistema de Logs
const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Caminho para arquivo de logs
const logPath = path.join(__dirname, 'logs');
const logFile = path.join(logPath, `server_${new Date().toISOString().split('T')[0]}.log`);

// Garantir que o diretório de logs existe
if (!fs.existsSync(logPath)) {
  try {
    fs.mkdirSync(logPath, { recursive: true });
  } catch (err) {
    console.error('Erro ao criar diretório de logs:', err);
  }
}

// Função de log segura que mascara dados sensíveis
function secureLog(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  
  // Limpar dados sensíveis
  const sanitizedData = { ...data };
  
  // Lista de campos sensíveis a serem mascarados
  const sensitiveFields = [
    'password', 'token', 'key', 'secret', 'auth', 'jwt', 
    'apiKey', 'api_key', 'supabaseKey', 'supabase_key',
    'credit_card', 'creditCard', 'cvv', 'ssn', 'passport'
  ];
  
  // Função recursiva para mascarar campos sensíveis
  function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
      // Verificar se o campo é sensível
      const isFieldSensitive = sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      
      if (isFieldSensitive) {
        // Mascarar o valor
        sanitized[key] = '***********';
      } else if (typeof sanitized[key] === 'object') {
        // Processar objetos aninhados
        sanitized[key] = sanitizeObject(sanitized[key]);
      }
    }
    
    return sanitized;
  }
  
  // Sanitizar dados
  const cleanData = sanitizeObject(sanitizedData);
  
  // Formar o log
  const logEntry = {
    timestamp,
    level,
    message,
    data: Object.keys(cleanData).length > 0 ? cleanData : undefined
  };
  
  // Converter para string
  const logString = JSON.stringify(logEntry) + '\n';
  
  // Escrever no arquivo de log
  try {
    fs.appendFileSync(logFile, logString);
  } catch (err) {
    console.error('Erro ao escrever log:', err);
  }
  
  // Também exibir no console se não for produção
  if (process.env.NODE_ENV !== 'production') {
    const logMethod = level === logLevels.ERROR ? 'error' : level === logLevels.WARN ? 'warn' : 'log';
    console[logMethod](`[${timestamp}] [${level}] ${message}`, Object.keys(cleanData).length > 0 ? cleanData : '');
  }
}

// Expor funções de log
const logger = {
  error: (message, data) => secureLog(logLevels.ERROR, message, data),
  warn: (message, data) => secureLog(logLevels.WARN, message, data),
  info: (message, data) => secureLog(logLevels.INFO, message, data),
  debug: (message, data) => secureLog(logLevels.DEBUG, message, data)
};

// Middleware de log para requisições
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Registrar dados da requisição (sem informações sensíveis)
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    path: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    referrer: req.headers['referer'] || req.headers['referrer']
  });
  
  // Adicionar listener para quando a resposta for finalizada
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? logLevels.WARN : logLevels.INFO;
    
    secureLog(level, `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      path: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
}

// Carregar variáveis de ambiente
require('dotenv').config();

// Verificar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as credenciais foram fornecidas
if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Credenciais do Supabase não configuradas');
  console.error('❌ Erro: Credenciais do Supabase não configuradas');
  console.error('Configure as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env');
  process.exit(1);
}

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cria o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000;

// Log do ambiente
logger.info('Servidor iniciado', { nodeEnv: process.env.NODE_ENV });

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://comandeja.vercel.app', /\.comandeja\.vercel\.app$/] 
    : '*',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Middleware para aplicar cabeçalhos específicos em rotas de API
app.use('/api', (req, res, next) => {
  // Configurar cabeçalhos para resposta JSON
  res.setHeader('Content-Type', 'application/json');
  
  // Configurar cabeçalhos CORS específicos para API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Configurar cabeçalhos de segurança HTTP
// Nota: Helmet não está instalado. Precisamos adicionar manualmente os cabeçalhos por enquanto
app.use((req, res, next) => {
  // Configurações de segurança básicas
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Content Security Policy (CSP) mais permissiva para desenvolvimento e produção
  const cspDirectives = [
    "default-src 'self'",
    "img-src 'self' data: https: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.geteng.co",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "connect-src 'self' https://rcintgdnamflzbbqeqjb.supabase.co https://*.supabase.co https://*.vercel.app https://comandeja.vercel.app",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:"
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // Adicionar cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissões
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
});

// Configurar o diretório estático para servir arquivos da pasta dist
// Em produção na Vercel, os arquivos estáticos ficam na pasta dist
if (process.env.NODE_ENV === 'production') {
  // Na Vercel, usamos o caminho absoluto
  app.use(express.static(path.join(__dirname, 'dist')));
} else {
  // Em desenvolvimento, usamos o caminho relativo
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Middleware de validação com Zod
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      // Validar o corpo da requisição
      schema.parse(req.body);
      next();
    } catch (error) {
      // Extrair mensagens de erro do Zod
      const errors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors
      });
    }
  };
}

// Schemas de validação Zod
const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
});

const registerSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  restaurantName: z.string().min(3, { message: 'O nome do restaurante deve ter pelo menos 3 caracteres' })
});

const updateRestaurantSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }).optional(),
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  logoUrl: z.string().url({ message: 'URL do logo inválida' }).optional().nullable(),
  bannerUrl: z.string().url({ message: 'URL do banner inválida' }).optional().nullable()
});

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }
    
    // Verificar o token com o Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou sessão expirada'
      });
    }
    
    // Adicionar o usuário à requisição
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno na autenticação'
    });
  }
};

// API de diagnóstico
app.get('/api/diagnostics', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage()
    },
    status: supabaseUrl && supabaseAnonKey ? 'ready_for_supabase' : 'missing_supabase_credentials'
  });
});

// Endpoint de diagnóstico avançado
app.get('/api/status', (req, res) => {
  try {
    // Verificar conexão com Supabase
    const supabaseStatus = supabase ? 'conectado' : 'desconectado';
    
    // Informações gerais
    const info = {
      success: true,
      server: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || 'desconhecida',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      supabase: {
        status: supabaseStatus,
        url: supabaseUrl ? 'configurado' : 'não configurado'
      }
    };
    
    return res.json(info);
  } catch (error) {
    console.error('Erro no endpoint de status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar status',
      error: error.message
    });
  }
});

// API para login administrativo
app.post('/api/admin/login', validateRequest(loginSchema), async (req, res) => {
  try {
    // Verificar se o Supabase está configurado
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        success: false,
        message: 'Configuração do Supabase não disponível'
      });
    }
    
    const { email, password } = req.body;
    
    // Codificar a senha usando sha256 para comparar com o hash armazenado
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Buscar o usuário admin pelo e-mail
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    // Verificar se a senha corresponde
    if (data.password_hash !== hashedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    // Atualizar último login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date() })
      .eq('id', data.id);
    
    // Retornar os dados do usuário (exceto a senha)
    const { password_hash, ...userData } = data;
    
    return res.json({
      success: true,
      message: 'Login bem-sucedido',
      user: userData
    });
  } catch (error) {
    console.error('Erro no login administrativo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// === NOVOS ENDPOINTS SEGUROS DA API ===

// === API DE AUTENTICAÇÃO ===
app.post('/api/auth/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Login usando Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    if (!data.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Buscar dados adicionais do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
    }
    
    // Mapear para o modelo de usuário
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: userData?.name || '',
      created_at: data.user.created_at,
      last_login: data.user.last_sign_in_at,
      is_active: userData?.is_active || true,
      restaurantId: userData?.restaurant_id,
      restaurantSlug: userData?.restaurant_slug,
      role: userData?.role
    };
    
    return res.json({
      success: true,
      user,
      session: data.session
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.post('/api/auth/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { name, email, password, restaurantName } = req.body;
    
    console.log('Tentativa de registro:', { email, name, restaurantName });
    
    // 1. Verificar se o email já está em uso
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está em uso'
      });
    }
    
    // 2. Registro usando Supabase Auth
    console.log('Iniciando signUp com Supabase');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) {
      console.error('Erro no signUp do Supabase:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (!data || !data.user) {
      console.error('Supabase não retornou dados do usuário');
      return res.status(400).json({
        success: false,
        message: 'Erro ao criar usuário'
      });
    }
    
    console.log('Usuário criado no Supabase Auth:', data.user.id);
    
    // 3. Gerar slug único para o restaurante
    let slug = restaurantName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Adicionar timestamp para garantir unicidade
    slug = `${slug}-${Date.now().toString().slice(-5)}`;
    
    // 4. Criar restaurante para o usuário
    console.log('Criando restaurante:', { restaurantName, slug });
    
    // Criar entrada na tabela de usuários
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        name,
        password_hash: 'gerenciado_pelo_supabase_auth',
        created_at: new Date().toISOString(),
        is_active: true,
        role: 'owner'
      });
    
    if (insertError) {
      console.error('Erro ao criar usuário na tabela de usuários:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário'
      });
    }
    
    // Criar restaurante para o usuário
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        owner_id: data.user.id,
        name: restaurantName,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();
      
    if (restaurantError) {
      console.error('Erro ao criar restaurante:', restaurantError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar restaurante'
      });
    }
    
    console.log('Restaurante criado com sucesso:', restaurantData.id);
    
    // Atualizar usuário com ID do restaurante
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        restaurant_id: restaurantData.id,
        restaurant_slug: restaurantData.slug
      })
      .eq('id', data.user.id);
      
    if (updateError) {
      console.error('Erro ao atualizar usuário com ID do restaurante:', updateError);
    }
    
    // 7. Verificar se uma sessão foi criada pelo Supabase Auth
    if (!data.session) {
      console.log('Nenhuma sessão criada pelo Supabase Auth, tentando fazer login');
      // Tentar criar uma sessão manualmente
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (sessionError) {
        console.error('Erro ao criar sessão:', sessionError);
      } else if (sessionData.session) {
        data.session = sessionData.session;
        console.log('Sessão criada com sucesso');
      }
    } else {
      console.log('Sessão criada pelo Supabase Auth:', !!data.session);
    }
    
    const user = {
      id: data.user.id,
      email: data.user.email,
      name,
      created_at: data.user.created_at,
      is_active: true,
      restaurantId: restaurantData.id,
      restaurantSlug: restaurantData.slug,
      role: 'owner'
    };
    
    // Configurar cookie seguro para o token
    if (data.session && data.session.access_token) {
      console.log('Configurando cookie de autenticação');
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias em milissegundos
        path: '/'
      };
      
      // Definir o cookie com o token de autenticação
      res.cookie('comandeja_auth_token', data.session.access_token, cookieOptions);
    } else {
      console.warn('Aviso: Nenhum token de acesso disponível para configurar cookie');
    }
    
    console.log('Registro concluído com sucesso, enviando resposta');
    
    return res.json({
      success: true,
      user,
      session: data.session
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor: ' + (error.message || 'Erro desconhecido')
    });
  }
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
    
    return res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para forçar o login logo após o registro
app.post('/api/auth/force-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }
    
    console.log('Tentando forçar login para:', email);
    
    // Login usando Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Erro ao forçar login:', error);
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    if (!data.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Buscar dados adicionais do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
    }
    
    // Mapear para o modelo de usuário
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: userData?.name || '',
      created_at: data.user.created_at,
      last_login: data.user.last_sign_in_at,
      is_active: userData?.is_active || true,
      restaurantId: userData?.restaurant_id,
      restaurantSlug: userData?.restaurant_slug,
      role: userData?.role
    };
    
    console.log('Login forçado com sucesso para:', email);
    
    return res.json({
      success: true,
      user,
      session: data.session
    });
  } catch (error) {
    console.error('Erro ao forçar login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// === API DE RESTAURANTES ===
app.get('/api/restaurants/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário está tentando acessar seu próprio restaurante
    const { data: userData } = await supabase.auth.getUser();
    
    // Buscar o restaurante
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado'
      });
    }
    
    // Verificar propriedade (apenas o proprietário pode ver)
    if (data.owner_id !== userData.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado'
      });
    }
    
    // Mapear para o modelo do restaurante
    const restaurant = {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      phone: data.phone,
      address: data.address,
      openingHours: data.opening_hours,
      logoUrl: data.logo_url,
      bannerUrl: data.banner_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    };
    
    return res.json({
      success: true,
      restaurant
    });
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/restaurants/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Buscar o restaurante pelo slug
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado'
      });
    }
    
    // Mapear para o modelo do restaurante
    const restaurant = {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      phone: data.phone,
      address: data.address,
      openingHours: data.opening_hours,
      logoUrl: data.logo_url,
      bannerUrl: data.banner_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    };
    
    return res.json({
      success: true,
      restaurant
    });
  } catch (error) {
    console.error('Erro ao buscar restaurante por slug:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.put('/api/restaurants/:id', authMiddleware, validateRequest(updateRestaurantSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantData = req.body;
    
    // Verificar propriedade
    const { data: restaurantCheck, error: checkError } = await supabase
      .from('restaurants')
      .select('owner_id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado'
      });
    }
    
    if (restaurantCheck.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado'
      });
    }
    
    // Atualizar o restaurante
    const { error } = await supabase
      .from('restaurants')
      .update({
        name: restaurantData.name,
        description: restaurantData.description,
        phone: restaurantData.phone,
        address: restaurantData.address,
        opening_hours: restaurantData.openingHours,
        logo_url: restaurantData.logoUrl,
        banner_url: restaurantData.bannerUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar restaurante'
      });
    }
    
    return res.json({
      success: true,
      message: 'Restaurante atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar restaurante:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  if (supabaseUrl && supabaseAnonKey) {
    console.log('O servidor está pronto para ser integrado com Supabase');
  } else {
    console.log('⚠️ AVISO: Credenciais do Supabase não configuradas - algumas funcionalidades não estarão disponíveis');
  }
});