// Nome do cache
const CACHE_NAME = 'comandeja-cache-v1';

// Recursos para cache inicial
const INITIAL_CACHE_URLS = [
  '/',
  '/index.html',
  '/logo.png',
  '/icons/img.png'
];

// Instalar o service worker e fazer cache dos recursos iniciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(INITIAL_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Limpar caches antigos quando uma nova versão do service worker for ativada
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache: Cache First, Network Fallback para recursos estáticos
// Estratégia de cache: Network First, Cache Fallback para API e dados dinâmicos
self.addEventListener('fetch', (event) => {
  // Ignorar requisições para o Supabase
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  // Verificar se é uma requisição para recursos estáticos
  const isStaticResource = 
    event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) ||
    event.request.url.endsWith('/') ||
    event.request.url.includes('/index.html');
  
  if (isStaticResource) {
    // Para recursos estáticos: Cache First, Network Fallback
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Retornar do cache se disponível
          if (response) {
            return response;
          }
          
          // Caso contrário, buscar da rede
          return fetch(event.request)
            .then((networkResponse) => {
              // Verificar se a resposta é válida
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              
              // Clonar a resposta para armazenar no cache
              const responseToCache = networkResponse.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                
              return networkResponse;
            });
        })
    );
  } else {
    // Para API e dados dinâmicos: Network First, Cache Fallback
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Verificar se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar a resposta para armazenar no cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // Se falhar, tentar buscar do cache
          return caches.match(event.request);
        })
    );
  }
}); 