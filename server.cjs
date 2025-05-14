// Servidor Express que usa sintaxe CommonJS para compatibilidade
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');

// Cria o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.VITE_DB_USER || 'postgres',
  host: process.env.VITE_DB_HOST || 'comandeja-saas.clag2oe2ce06.sa-east-1.rds.amazonaws.com',
  database: process.env.VITE_DB_NAME || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'Carlos2444h',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false // Necessário para conexão RDS
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API de teste de conexão com o banco de dados
app.get('/api/test-connection', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      timestamp: result.rows[0].now,
      message: 'Conexão com o PostgreSQL estabelecida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao conectar ao PostgreSQL: ${error.message}`
    });
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