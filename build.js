// Script para construir o projeto e copiar arquivos necessários para a pasta dist
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Iniciando build do projeto...');

try {
  // Executar o build padrão do Vite
  console.log('🚀 Executando build do Vite...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Copiar server.cjs para a pasta dist
  console.log('📋 Copiando server.cjs para pasta dist...');
  fs.copyFileSync('server.cjs', path.join('dist', 'server.cjs'));
  
  // Copiar package.json sem as devDependencies
  console.log('📋 Preparando package.json para produção...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Manter apenas as dependências necessárias para produção
  const prodPackage = {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private,
    dependencies: {
      express: packageJson.dependencies.express,
      pg: packageJson.dependencies.pg,
      cors: packageJson.dependencies.cors
    },
    scripts: {
      start: "node server.cjs"
    }
  };
  
  fs.writeFileSync(
    path.join('dist', 'package.json'),
    JSON.stringify(prodPackage, null, 2),
    'utf8'
  );
  
  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
} 