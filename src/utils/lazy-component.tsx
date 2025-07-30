import React, { Suspense, lazy as reactLazy } from 'react';

// Componente de fallback padrão para usar durante o carregamento
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-4 min-h-[100px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
  </div>
);

// Componente de fallback para gráficos
export const ChartFallback = () => (
  <div className="flex flex-col items-center justify-center p-4 min-h-[300px] border rounded-lg bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4"></div>
    <p className="text-sm text-gray-500">Carregando gráfico...</p>
  </div>
);

// Componente de fallback para tabelas
export const TableFallback = () => (
  <div className="flex flex-col items-center justify-center p-6 min-h-[300px] border rounded-lg bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600 mb-4"></div>
    <p className="text-base font-medium text-gray-700 mb-1">Carregando dados...</p>
    <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
    <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-brand-500 rounded-full animate-pulse"></div>
    </div>
  </div>
);

// Função para criar componentes lazy com fallback personalizado
export function lazyWithFallback<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  FallbackComponent: React.ComponentType = DefaultFallback
) {
  const LazyComponent = reactLazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export default lazyWithFallback; 