// Teste da conexão direta com o PostgreSQL usando CommonJS
const { Pool } = require('pg');

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