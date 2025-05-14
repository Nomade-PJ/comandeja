// Script simples para testar conexão com o banco de dados em produção
const { Pool } = require('pg');

// Valores de produção hard-coded para garantir o teste
const pool = new Pool({
  user: 'postgres',
  host: 'comandeja-saas.clag2oe2ce06.sa-east-1.rds.amazonaws.com',
  database: 'ComandeJa_SaaS',
  password: 'Carlos2444h',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

async function testConnection() {
  let client;
  try {
    console.log('Tentando conectar ao PostgreSQL...');
    console.log(`Host: comandeja-saas.clag2oe2ce06.sa-east-1.rds.amazonaws.com:5432`);
    console.log('Usuário: postgres');
    console.log('Database: ComandeJa_SaaS');
    
    client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Tenta realizar uma query simples
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query executada com sucesso!');
    console.log('Timestamp do servidor:', result.rows[0].now);
    
    // Tenta obter informações do banco
    try {
      const versionResult = await client.query('SELECT version()');
      console.log('Versão do PostgreSQL:', versionResult.rows[0].version);
      
      // Verifica se a tabela users existe
      const tableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      console.log('Tabela users existe:', tableResult.rows[0].exists);
      
      // Conta registros na tabela users
      if (tableResult.rows[0].exists) {
        const countResult = await client.query('SELECT COUNT(*) FROM users');
        console.log('Número de usuários na tabela:', countResult.rows[0].count);
      }
    } catch (e) {
      console.log('Erro ao consultar informações adicionais:', e.message);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:');
    console.error('Código do erro:', error.code);
    console.error('Mensagem:', error.message);
    console.error('Detalhes:', error.detail || 'Sem detalhes adicionais');
    
    if (error.code === 'ENOTFOUND') {
      console.error('O host não foi encontrado. Verifique o nome do servidor.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('A conexão excedeu o tempo limite. O servidor está bloqueando conexões externas?');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Conexão recusada. Verifique se o servidor está ativo e aceitando conexões.');
    } else if (error.code === '28000' || error.code === '28P01') {
      console.error('Autenticação falhou. Verifique usuário e senha.');
    }
  } finally {
    if (client) {
      client.release();
    }
    // Fecha o pool
    await pool.end();
  }
}

// Executa o teste
console.log('Iniciando teste de conexão com banco de dados de produção...');
testConnection().catch(err => {
  console.error('Erro não tratado:', err);
}); 