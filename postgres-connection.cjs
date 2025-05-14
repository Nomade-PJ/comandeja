// Teste da conexão direta com o PostgreSQL usando CommonJS
const { Pool } = require('pg');

// Exibe as variáveis de ambiente carregadas (sem senha)
console.log('Variáveis de ambiente para conexão:');
console.log('- Host:', process.env.VITE_DB_HOST);
console.log('- Database:', process.env.VITE_DB_NAME);
console.log('- User:', process.env.VITE_DB_USER);
console.log('- Port:', process.env.VITE_DB_PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- Password definida?', !!process.env.VITE_DB_PASSWORD);

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.VITE_DB_USER,
  host: process.env.VITE_DB_HOST,
  database: process.env.VITE_DB_NAME,
  password: process.env.VITE_DB_PASSWORD,
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false // Necessário para conexão RDS
  }
});

async function testConnection() {
  try {
    console.log('Tentando conectar ao PostgreSQL...');
    console.log(`Conectando a: ${process.env.VITE_DB_HOST}:${process.env.VITE_DB_PORT || '5432'}`);
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso!');
    console.log('Timestamp do servidor:', result.rows[0].now);
    
    // Tenta obter versão do PostgreSQL
    try {
      const versionResult = await pool.query('SELECT version()');
      console.log('Versão do PostgreSQL:', versionResult.rows[0].version);
    } catch (e) {
      console.log('Não foi possível obter a versão do PostgreSQL');
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    console.error('Detalhes da configuração:');
    console.error('- Host:', process.env.VITE_DB_HOST);
    console.error('- Database:', process.env.VITE_DB_NAME);
    console.error('- User:', process.env.VITE_DB_USER);
    console.error('- Port:', process.env.VITE_DB_PORT);
    pool.end();
  }
}

testConnection(); 