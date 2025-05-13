// Teste da conexão direta com o PostgreSQL usando CommonJS
const { Pool } = require('pg');

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.VITE_DB_USER || 'postgres',
  host: process.env.VITE_DB_HOST || 'localhost',
  database: process.env.VITE_DB_NAME || 'ComandeJa_SaaS',
  password: process.env.VITE_DB_PASSWORD || 'Carlos2444h',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } : undefined
});

async function testConnection() {
  try {
    console.log('Tentando conectar ao PostgreSQL...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso!');
    console.log('Timestamp do servidor:', result.rows[0].now);
    pool.end();
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    pool.end();
  }
}

testConnection(); 