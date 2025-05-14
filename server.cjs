// Servidor Express que usa sintaxe CommonJS para compatibilidade
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
const paymentController = require('./payment-controller.cjs');

// Cria o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000;

// Log das variáveis de ambiente (sem mostrar a senha)
console.log('Variáveis de ambiente para conexão:');
console.log('VITE_DB_USER:', process.env.VITE_DB_USER);
console.log('VITE_DB_HOST:', process.env.VITE_DB_HOST);
console.log('VITE_DB_NAME:', process.env.VITE_DB_NAME);
console.log('VITE_DB_PORT:', process.env.VITE_DB_PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Senha definida?', !!process.env.VITE_DB_PASSWORD);

// Configuração do banco de dados PostgreSQL - com fallback para valores padrão em caso de falha
const dbConfig = {
  user: process.env.VITE_DB_USER || 'postgres',
  host: process.env.VITE_DB_HOST || 'comandeja-saas.clag2oe2ce06.sa-east-1.rds.amazonaws.com',
  database: process.env.VITE_DB_NAME || 'ComandeJa_SaaS',
  password: process.env.VITE_DB_PASSWORD || 'Carlos2444h',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false // Necessário para conexão RDS
  },
  // Aumentando timeout para debug
  connectionTimeoutMillis: 10000,
  query_timeout: 10000
};

console.log('Configuração DB final (sem senha):', {
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: dbConfig.ssl
});

const pool = new Pool(dbConfig);

// Evento para monitorar erros de conexão
pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexão:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API de diagnóstico de variáveis de ambiente (sem exibir a senha)
app.get('/api/diagnostics', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    database: {
      host: process.env.VITE_DB_HOST || dbConfig.host,
      database: process.env.VITE_DB_NAME || dbConfig.database,
      user: process.env.VITE_DB_USER || dbConfig.user,
      port: process.env.VITE_DB_PORT || dbConfig.port,
      hasPassword: !!process.env.VITE_DB_PASSWORD,
      usingSSL: !!dbConfig.ssl
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage()
    }
  });
});

// API de teste de conexão com o banco de dados
app.get('/api/test-connection', async (req, res) => {
  let client;
  try {
    console.log('Tentando conectar ao PostgreSQL...');
    client = await pool.connect();
    console.log('Conexão obtida, executando query...');
    
    const result = await client.query('SELECT NOW()');
    console.log('Query executada com sucesso');
    
    res.json({
      success: true,
      timestamp: result.rows[0].now,
      message: 'Conexão com o PostgreSQL estabelecida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao conectar ao PostgreSQL: ${error.message}`,
      errorCode: error.code,
      errorDetail: error.detail,
      stack: error.stack
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// API para executar queries
app.post('/api/query', async (req, res) => {
  try {
    const { text, params } = req.body;
    const result = await pool.query(text, params);
    res.json(result);
  } catch (error) {
    console.error('Erro ao executar query:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao executar query: ${error.message}`
    });
  }
});

// API de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Criamos o hash da senha
    const passwordHash = crypto.createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Verificamos o usuário no banco
    const result = await pool.query(
      'SELECT id, email, name, created_at, last_login, is_active FROM users WHERE email = $1 AND password_hash = $2',
      [email, passwordHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Atualiza a data do último login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [result.rows[0].id]
    );

    // Busca o restaurante do usuário
    const restaurantResult = await pool.query(
      'SELECT id, slug FROM restaurants WHERE owner_id = $1',
      [result.rows[0].id]
    );

    // Cria o objeto de resposta
    const user = {
      ...result.rows[0],
      restaurantId: restaurantResult.rows.length > 0 ? restaurantResult.rows[0].id : undefined,
      restaurantSlug: restaurantResult.rows.length > 0 ? restaurantResult.rows[0].slug : undefined,
    };

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

// API de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, restaurantName } = req.body;
    
    // Validação de dados
    if (!name || !email || !password || !restaurantName) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }
    
    // Criamos o hash da senha
    const passwordHash = crypto.createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Gera o slug a partir do nome do restaurante
    const slug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    console.log('📝 Slug gerado para o restaurante:', slug);
    
    // Verificar se o e-mail já está em uso
    const checkEmail = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este e-mail já está em uso'
      });
    }
    
    // Verificar se o slug já existe
    const checkSlug = await pool.query(
      'SELECT id FROM restaurants WHERE slug = $1',
      [slug]
    );
    
    if (checkSlug.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este nome de restaurante já está em uso'
      });
    }
    
    // Inicia uma transação
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insere o usuário
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [email, passwordHash, name]
      );
      
      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(500).json({
          success: false,
          message: 'Falha ao inserir usuário'
        });
      }
      
      const userId = userResult.rows[0].id;
      
      // Insere o restaurante
      const restaurantResult = await client.query(
        'INSERT INTO restaurants (owner_id, name, slug, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
        [userId, restaurantName, slug]
      );
      
      if (restaurantResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(500).json({
          success: false,
          message: 'Falha ao inserir restaurante'
        });
      }
      
      const restaurantId = restaurantResult.rows[0].id;
      
      // Insere as configurações iniciais do restaurante
      await client.query(
        'INSERT INTO restaurant_settings (restaurant_id) VALUES ($1)',
        [restaurantId]
      );
      
      // Confirma a transação
      await client.query('COMMIT');
      
      // Cria e retorna o usuário com os dados necessários
      const user = {
        id: userId,
        email: email,
        name: name,
        created_at: userResult.rows[0].created_at,
        is_active: true,
        restaurantId: restaurantId,
        restaurantSlug: slug
      };
      
      res.status(201).json({
        success: true,
        message: 'Usuário e restaurante criados com sucesso',
        user
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

// API de autenticação administrativa
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Criamos o hash da senha
    const passwordHash = crypto.createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Verificamos o usuário no banco
    const result = await pool.query(
      'SELECT id, email, name, role FROM admin_users WHERE email = $1 AND password_hash = $2',
      [email, passwordHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Atualiza a data do último login
    await pool.query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
      [result.rows[0].id]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

// API de pagamentos
app.post('/api/payments/card', async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Validação básica dos dados
    if (!paymentData.amount || !paymentData.cardToken || !paymentData.paymentMethodId || 
        !paymentData.email || !paymentData.userId || !paymentData.restaurantId || !paymentData.planId) {
      return res.status(400).json({
        success: false,
        message: 'Dados de pagamento incompletos'
      });
    }
    
    const result = await paymentController.createCardPayment(paymentData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao processar pagamento com cartão:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

app.post('/api/payments/pix', async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Validação básica dos dados
    if (!paymentData.amount || !paymentData.email || !paymentData.userId || 
        !paymentData.restaurantId || !paymentData.planId) {
      return res.status(400).json({
        success: false,
        message: 'Dados de pagamento incompletos'
      });
    }
    
    const result = await paymentController.createPixPayment(paymentData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao processar pagamento com PIX:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

app.get('/api/payments/pix/status/:transactionId', async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'ID da transação é obrigatório'
      });
    }
    
    const result = await paymentController.checkPixPaymentStatus(transactionId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao verificar status do pagamento PIX:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

app.post('/api/payment-methods', async (req, res) => {
  try {
    const methodData = req.body;
    
    // Validação básica dos dados
    if (!methodData.userId || !methodData.restaurantId || !methodData.paymentType) {
      return res.status(400).json({
        success: false,
        message: 'Dados do método de pagamento incompletos'
      });
    }
    
    // Validação específica para tipo de pagamento
    if (methodData.paymentType.includes('card') && 
        (!methodData.cardLastFour || !methodData.cardBrand || !methodData.cardExpiryMonth || !methodData.cardExpiryYear)) {
      return res.status(400).json({
        success: false,
        message: 'Dados do cartão incompletos'
      });
    }
    
    if (methodData.paymentType === 'pix' && (!methodData.pixKeyType || !methodData.pixKey)) {
      return res.status(400).json({
        success: false,
        message: 'Dados do PIX incompletos'
      });
    }
    
    const result = await paymentController.savePaymentMethod(methodData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao salvar método de pagamento:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

app.get('/api/payment-methods/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }
    
    const result = await pool.query(
      `SELECT 
        id,
        payment_type,
        is_default,
        card_last_four,
        card_brand,
        card_holder_name,
        card_expiry_month,
        card_expiry_year,
        pix_key_type,
        pix_key,
        created_at
      FROM payment_methods
      WHERE user_id = $1 AND is_active = true
      ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      paymentMethods: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

// API para obter informações do período de teste
app.get('/api/trial-periods/:restaurantId', async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'ID do restaurante é obrigatório'
      });
    }
    
    const result = await pool.query(
      `SELECT 
        id, 
        restaurant_id, 
        plan_id, 
        start_date, 
        end_date, 
        status,
        converted_to_subscription
      FROM trial_periods 
      WHERE restaurant_id = $1 AND status = 'active'
      LIMIT 1`,
      [restaurantId]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        trialPeriod: null
      });
    }
    
    res.json({
      success: true,
      trialPeriod: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar período de teste:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

// API para obter assinatura atual do restaurante
app.get('/api/subscriptions/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'ID do restaurante é obrigatório'
      });
    }
    
    const result = await pool.query(
      `SELECT 
        id, 
        restaurant_id, 
        plan_id, 
        status, 
        current_period_start,
        current_period_end,
        contracted_price,
        billing_cycle,
        next_billing_date,
        created_at,
        auto_renew
      FROM subscriptions 
      WHERE restaurant_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1`,
      [restaurantId]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        subscription: null
      });
    }
    
    res.json({
      success: true,
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({
      success: false,
      message: `Erro interno: ${error.message}`
    });
  }
});

// Rota para todas as solicitações não-API
// Isso garante que o React Router funcione corretamente
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`http://localhost:${PORT}`);
}); 