/**
 * Console Filter - Oculta logs específicos no console do navegador
 * 
 * Este script pode ser executado no console do navegador para filtrar logs indesejados
 * relacionados ao Supabase e outros serviços.
 * 
 * Para usar:
 * 1. Abra o console do navegador (F12)
 * 2. Cole este script e pressione Enter
 * 3. Os logs serão filtrados a partir desse momento
 */

(function() {
  // Armazenar as funções originais
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  // Palavras-chave para filtrar (ignorar logs que contenham essas strings)
  const filterKeywords = [
    'Supabase',
    'realtime',
    'Subscription',
    'canal',
    'restaurante',
    'carrinho',
    'estatística',
    'dashboard_statistics',
    'Salvando',
    'Verificando',
    'Sincronizando',
    'Evento de autenticação',
    'Inicializando',
    'Restaurante encontrado',
    'Buscando',
    'auth.ts',
    'AuthApiError',
    'token:grant_type',
    'Email not confirmed',
    'POST',
    'auth/v1/token',
    'Não foi possível encontrar o nó',
    '400',
    'Bad Request',
    '/rest/v1/dashboard',
    'previous_day',
    'column',
    // Adicionar filtros para os erros de React
    'value prop on input',
    'changing an uncontrolled input',
    'changing a controlled input',
    'input element',
    'value={null}',
    'uncontrolled component',
    'controlled component'
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
    // Verificar se o log contém alguma das palavras-chave para filtrar
    const message = args.join(' ');
    const shouldFilter = filterKeywords.some(keyword => 
      typeof message === 'string' && message.includes(keyword)
    );
    
    // Se não deve filtrar, mostrar o log
    if (!shouldFilter) {
      originalConsoleLog.apply(console, args);
    }
  };
  
  // Substituir console.info
  console.info = function(...args) {
    // Verificar se o log contém alguma das palavras-chave para filtrar
    const message = args.join(' ');
    const shouldFilter = filterKeywords.some(keyword => 
      typeof message === 'string' && message.includes(keyword)
    );
    
    // Se não deve filtrar, mostrar o log
    if (!shouldFilter) {
      originalConsoleInfo.apply(console, args);
    }
  };
  
  // Substituir console.warn apenas para warnings específicos
  console.warn = function(...args) {
    // Verificar se o warning contém alguma das palavras-chave para filtrar
    const message = args.join(' ');
    const shouldFilter = filterKeywords.some(keyword => 
      typeof message === 'string' && message.includes(keyword)
    );
    
    // Se não deve filtrar, mostrar o warning
    if (!shouldFilter) {
      originalConsoleWarn.apply(console, args);
    }
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
    
    // Verificar se o erro contém alguma das palavras-chave para filtrar
    const message = args.join(' ');
    const shouldFilter = filterKeywords.some(keyword => 
      typeof message === 'string' && message.includes(keyword)
    );
    
    // Se não deve filtrar, mostrar o erro
    if (!shouldFilter) {
      originalConsoleError.apply(console, args);
    }
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
  
  // Mostrar mensagem de confirmação
  // originalConsoleLog.call(console, '✅ Filtro de console ativado! Logs relacionados ao Supabase e outros serviços internos foram ocultados.');
})();

// Exportar para uso em outros arquivos
export default function enableConsoleFilter() {
  // Executar o script acima
  // (já será executado automaticamente quando importado)
} 