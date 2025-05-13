// Teste de conectividade com a API do servidor Express
// Execute com: node api-server.js

import http from 'http';

console.log('Testando conexão com o servidor...');
console.log('Tentando acessar: http://localhost:3000');

http.get('http://localhost:3000', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Servidor está rodando corretamente!');
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    if (data.length < 500) {
      console.log('Dados recebidos:', data);
    } else {
      console.log('Dados recebidos (primeiros 500 caracteres):', data.substring(0, 500) + '...');
    }
  });
  
}).on('error', (err) => {
  console.error('❌ Erro ao conectar ao servidor:', err.message);
  console.log('');
  console.log('Possíveis soluções:');
  console.log('1. Verifique se o servidor está rodando (npm run start:cjs)');
  console.log('2. Verifique se a porta 3000 está disponível');
  console.log('3. Verifique se não há firewall bloqueando a conexão');
});

// Testando a API de teste de conexão com o banco de dados
console.log('\nTestando API de conexão com o banco de dados...');
console.log('Tentando acessar: http://localhost:3000/api/test-connection');

http.get('http://localhost:3000/api/test-connection', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ API está rodando corretamente!');
    console.log('Status:', res.statusCode);
    
    try {
      const jsonResponse = JSON.parse(data);
      console.log('Resposta da API:', jsonResponse);
    } catch (e) {
      console.log('Resposta bruta da API:', data);
    }
  });
  
}).on('error', (err) => {
  console.error('❌ Erro ao acessar a API:', err.message);
}); 