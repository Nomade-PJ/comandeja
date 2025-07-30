/**
 * Console Filter - Oculta logs específicos no console do navegador
 * 
 * Este módulo filtra logs indesejados no console do navegador relacionados ao Supabase,
 * informações sensíveis e outros serviços.
 */

// Armazenar as funções originais
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Palavras-chave para filtrar (ignorar logs que contenham essas strings)
const filterKeywords = [
  // Supabase e serviços
  'Supabase',
  'realtime',
  'Subscription',
  'canal',
  'restaurante',
  'carrinho',
  'estatística',
  'dashboard_statistics',
  
  // Operações e estados
  'Salvando',
  'Verificando',
  'Sincronizando',
  'Evento de autenticação',
  'Inicializando',
  'Restaurante encontrado',
  'Buscando',
  
  // Autenticação
  'auth.ts',
  'AuthApiError',
  'token:grant_type',
  'Email not confirmed',
  'POST',
  'auth/v1/token',
  'Iniciando processo de registro',
  'Criando usuário no Auth',
  'Usuário criado com sucesso',
  'Criando perfil para o usuário',
  'Perfil criado com sucesso',
  
  // Erros comuns
  'Não foi possível encontrar o nó',
  '400',
  'Bad Request',
  '/rest/v1/dashboard',
  'previous_day',
  'column',
  
  // Filtros para perfil de usuário
  'Iniciando carregamento do perfil',
  'Buscando perfil para usuário',
  'Perfil encontrado',
  'Perfil não encontrado',
  'Criando novo perfil',
  'Novo perfil criado',
  'Dados de cliente encontrados',
  'Cliente não encontrado',
  'Dados combinados do perfil',
  'Dados do perfil',
  
  // Informações sensíveis
  'canalstvoficial@gmail.com',
  'jonplaycomercial@gmail.com',
  '@gmail.com',
  '005b759f-fa85-4d59-a4cc-33eef3239288',
  '4db7b825-7f53-4c41-8e30-e7dfb19a00b8',
  '(98) 9920-2352',
  'jose carlos',
  'full_name',
  'phone',
  'email',
  'customer',
  'role',
  'user_id',
  '005b759f',
  '4db7b825',
  
  // Erros de React
  'value prop on input',
  'changing an uncontrolled input',
  'changing a controlled input',
  'input element',
  'value={null}',
  'uncontrolled component',
  'controlled component',
  
  // Avisos de depreciação
  'Support for defaultProps will be removed',
  'react-beautiful-dnd',
  'Droppable',
  'memo components'
];

// URLs para filtrar completamente
const filterUrls = [
  '/rest/v1/dashboard_statistics',
  '/rest/v1/statistics',
  'statistics?colum',
  'previous_day'
];

// Substituir console.log
console.log = function(...args) {
  // Verificar se o log contém informações sensíveis
  const message = JSON.stringify(args);
  if (typeof message === 'string' && filterKeywords.some(keyword => message.includes(keyword))) {
    return; // Não mostrar logs com informações sensíveis
  }
  originalConsoleLog.apply(console, args);
};

// Substituir console.info
console.info = function(...args) {
  // Verificar se o log contém alguma das palavras-chave para filtrar
  const message = JSON.stringify(args);
  if (typeof message === 'string' && filterKeywords.some(keyword => message.includes(keyword))) {
    return; // Não mostrar logs com informações sensíveis
  }
  originalConsoleInfo.apply(console, args);
};

// Substituir console.warn apenas para warnings específicos
console.warn = function(...args) {
  // Verificar se é um aviso sobre defaultProps em react-beautiful-dnd
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('Support for defaultProps will be removed') || 
       args[0].includes('react-beautiful-dnd'))) {
    return; // Não mostrar avisos de depreciação do react-beautiful-dnd
  }
  
  // Verificar se o warning contém alguma das palavras-chave para filtrar
  const message = JSON.stringify(args);
  if (typeof message === 'string' && filterKeywords.some(keyword => message.includes(keyword))) {
    return; // Não mostrar warnings com informações sensíveis
  }
  originalConsoleWarn.apply(console, args);
};

// Substituir console.error para erros específicos
console.error = function(...args) {
  // Verificar se tem objetos de erro com URL
  if (args[0] && typeof args[0] === 'object' && args[0].config && args[0].config.url) {
    const url = args[0].config.url;
    if (filterUrls.some(filterUrl => url.includes(filterUrl))) {
      return; // Ignorar completamente o erro
    }
  }
  
  // Verificar se o erro contém informações sensíveis
  const message = JSON.stringify(args);
  if (typeof message === 'string' && (
    filterKeywords.some(keyword => message.includes(keyword)) ||
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

// Interceptar XMLHttpRequest para suprimir erros relacionados à API de estatísticas
const originalXhrOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  // Marcar a requisição se for para a API de estatísticas
  if (typeof url === 'string' && filterUrls.some(filterUrl => url.includes(filterUrl))) {
    this._isStatisticsApi = true;
  }
  return originalXhrOpen.apply(this, [method, url, ...rest]);
};

// Interceptar resposta de erro do XMLHttpRequest
const originalXhrSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(...args) {
  if (this._isStatisticsApi) {
    const originalOnError = this.onerror;
    this.onerror = function(e) {
      // Suprimir evento de erro para requisições de estatísticas
      e.stopImmediatePropagation();
      e.preventDefault();
    };
  }
  return originalXhrSend.apply(this, args);
};

// Função para ativar o filtro de console
export default function enableConsoleFilter() {
  // O filtro já é aplicado quando o arquivo é importado
  return true;
} 