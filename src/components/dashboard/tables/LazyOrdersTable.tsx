import lazyWithFallback, { TableFallback } from "@/utils/lazy-component";
import { Suspense } from 'react';

// Componente de fallback específico para tabela de pedidos
const OrdersTableFallback = () => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[400px] border rounded-lg bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600 mb-4"></div>
    <p className="text-base font-medium text-gray-700 mb-1">Carregando pedidos...</p>
    <p className="text-sm text-gray-500 mb-4">Estamos buscando seus pedidos mais recentes</p>
    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-brand-500 rounded-full animate-pulse"></div>
    </div>
  </div>
);

// Importar o OrdersTable usando lazy loading com fallback personalizado
const LazyOrdersTable = lazyWithFallback(
  () => import("./OrdersTable"),
  OrdersTableFallback
);

export default LazyOrdersTable; 