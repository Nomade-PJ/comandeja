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
  
  // Palavras-chave para filtrar (ignorar logs que contenham essas strings)
  const filterKeywords = [
    'Supabase',
    'realtime',
    'Subscription',
    'canal',
    'restaurante',
    'carrinho',
    'estatística',
    'Salvando',
    'Verificando',
    'Sincronizando',
    'Evento de autenticação',
    'Inicializando',
    'Restaurante encontrado',
    'Buscando'
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
  
  // Mostrar mensagem de confirmação
  originalConsoleLog.call(console, '✅ Filtro de console ativado! Logs relacionados ao Supabase e outros serviços internos foram ocultados.');
})();

// Exportar para uso em outros arquivos
export default function enableConsoleFilter() {
  // Executar o script acima
  // (já será executado automaticamente quando importado)
} 