import lazyWithFallback, { ChartFallback } from "@/utils/lazy-component";

// Importar o SalesChart usando lazy loading
const LazySalesChart = lazyWithFallback(
  () => import("./SalesChart"),
  ChartFallback
);

export default LazySalesChart; 