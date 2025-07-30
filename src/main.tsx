import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Importar o filtro de console para ocultar logs desnecessários
import './utils/console-filter.js'

// Configurar a limpeza periódica do cache
import { setupCacheCleanup } from './lib/cache-utils'

// Inicializar a limpeza periódica do cache (a cada 10 minutos)
const cleanupCache = setupCacheCleanup(10 * 60 * 1000);

// Limpar o cache quando a aplicação for fechada
window.addEventListener('beforeunload', () => {
  cleanupCache();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
