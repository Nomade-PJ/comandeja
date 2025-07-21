import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Importar o filtro de console para ocultar logs desnecessários
import './utils/console-filter.js'

// Substituir os métodos de console para ocultar logs de autenticação e perfil
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Filtrar console.log
console.log = function(...args) {
  // Verificar se o log contém informações sensíveis
  const message = JSON.stringify(args);
  if (typeof message === 'string' && (
    // Autenticação
    message.includes('Iniciando processo de registro') ||
    message.includes('Criando usuário no Auth') ||
    message.includes('Usuário criado com sucesso') ||
    message.includes('Criando perfil para o usuário') ||
    message.includes('Perfil criado com sucesso') ||
    // Emails e dados pessoais
    message.includes('canalstvoficial@gmail.com') ||
    message.includes('jonplaycomercial@gmail.com') ||
    message.includes('@gmail.com') ||
    // Dados de perfil
    message.includes('Dados do perfil') ||
    message.includes('Perfil encontrado') ||
    message.includes('Iniciando carregamento do perfil') ||
    message.includes('Buscando perfil') ||
    message.includes('Dados de cliente encontrados') ||
    message.includes('Dados combinados do perfil') ||
    message.includes('Perfil não encontrado') ||
    message.includes('Cliente não encontrado') ||
    // Campos sensíveis
    message.includes('role:') ||
    message.includes('full_name:') ||
    message.includes('email:') ||
    message.includes('id:') ||
    message.includes('phone:') ||
    message.includes('user_id') ||
    message.includes('005b759f') ||
    message.includes('4db7b825')
  )) {
    return; // Não mostrar logs com informações sensíveis
  }
  originalConsoleLog.apply(console, args);
};

// Filtrar console.error
console.error = function(...args) {
  // Verificar se o erro contém informações sensíveis
  const message = JSON.stringify(args);
  if (typeof message === 'string' && (
    message.includes('Erro ao buscar perfil') ||
    message.includes('Erro ao carregar perfil') ||
    message.includes('Usuário não encontrado') ||
    message.includes('Erro ao criar novo perfil') ||
    message.includes('Erro ao fazer upload do avatar') ||
    message.includes('Erro ao remover avatar') ||
    message.includes('Erro ao salvar perfil') ||
    message.includes('Erro ao excluir conta')
  )) {
    return; // Não mostrar erros com informações sensíveis
  }
  originalConsoleError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
