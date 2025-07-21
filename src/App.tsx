import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { lazy, Suspense, useEffect } from "react";
import { realtimeService } from "./integrations/supabase/realtimeService";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./hooks/useAuth";
import enableConsoleFilter from "./utils/console-filter";

// Importações lazy para melhorar o desempenho
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardOrders = lazy(() => import("./pages/DashboardOrders"));
const DashboardProducts = lazy(() => import("./pages/DashboardProducts"));
const DashboardCategories = lazy(() => import("./pages/DashboardCategories"));
const DashboardCustomers = lazy(() => import("./pages/DashboardCustomers"));
const DashboardReports = lazy(() => import("./pages/DashboardReports"));
const DashboardReviews = lazy(() => import("./pages/DashboardReviews"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const RestaurantView = lazy(() => import("./pages/RestaurantView"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const CustomerSettings = lazy(() => import("./pages/CustomerSettings"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MeusOrders = lazy(() => import("./pages/MeusOrders"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Funcionalidades = lazy(() => import("./pages/Funcionalidades"));
const Precos = lazy(() => import("./pages/Precos"));
const Demo = lazy(() => import("./pages/Demo"));
const API = lazy(() => import("./pages/API"));
const CentralAjuda = lazy(() => import("./pages/CentralAjuda"));
const Documentacao = lazy(() => import("./pages/Documentacao"));
const Status = lazy(() => import("./pages/Status"));
const Contato = lazy(() => import("./pages/Contato"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
  </div>
);

// Componente de redirecionamento condicional
const ProfileRedirect = () => {
  const { isRestaurantOwner, isCustomer } = useAuth();
  
  if (isRestaurantOwner()) {
    return <Navigate to="/configuracoes" replace />;
  } else if (isCustomer()) {
    return <Navigate to="/cliente/perfil" replace />;
  } else {
    // Fallback para perfil padrão
    return <CustomerSettings />;
  }
};

const App = () => {
  useEffect(() => {
    // Inicializar o serviço de realtime
    realtimeService.initialize();
    
    // Garantir que o filtro de console esteja ativo
    enableConsoleFilter();

    return () => {
      realtimeService.cleanup();
    };
  }, []);

  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && isDarkMode)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/funcionalidades" element={<Funcionalidades />} />
                  <Route path="/precos" element={<Precos />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/api" element={<API />} />
                  <Route path="/central-ajuda" element={<CentralAjuda />} />
                  <Route path="/documentacao" element={<Documentacao />} />
                  <Route path="/status" element={<Status />} />
                  <Route path="/contato" element={<Contato />} />
                  <Route path="/termos-de-uso" element={<TermosDeUso />} />
                  <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
                  
                  {/* Rotas do Dashboard - usando apenas as rotas diretas em português */}
                  <Route path="/painel" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/pedidos" element={
                    <ProtectedRoute>
                      <DashboardOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/produtos" element={
                    <ProtectedRoute>
                      <DashboardProducts />
                    </ProtectedRoute>
                  } />
                  <Route path="/categorias" element={
                    <ProtectedRoute>
                      <DashboardCategories />
                    </ProtectedRoute>
                  } />
                  <Route path="/clientes" element={
                    <ProtectedRoute>
                      <DashboardCustomers />
                    </ProtectedRoute>
                  } />
                  <Route path="/relatorios" element={
                    <ProtectedRoute>
                      <DashboardReports />
                    </ProtectedRoute>
                  } />
                  <Route path="/avaliacoes" element={
                    <ProtectedRoute>
                      <DashboardReviews />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracoes" element={
                    <ProtectedRoute>
                      <DashboardSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <ProfileRedirect />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/:slug" element={<RestaurantView />} />
                  <Route path="/produto/:productId" element={<ProductDetails />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
                  <Route path="/cliente/configuracoes" element={
                    <ProtectedRoute>
                      <CustomerSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/cliente/perfil" element={
                    <ProtectedRoute>
                      <CustomerSettings />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/meus-pedidos" element={
                    <ProtectedRoute>
                      <MeusOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/rastrear-pedido" element={
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  } />
                  <Route path="/rastrear-pedido/:orderId" element={
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
      
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
}

export default App;
