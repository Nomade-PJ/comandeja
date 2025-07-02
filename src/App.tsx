import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ui/protected-route";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardProducts from "./pages/DashboardProducts";
import DashboardCategories from "./pages/DashboardCategories";
import DashboardCustomers from "./pages/DashboardCustomers";
import DashboardReports from "./pages/DashboardReports";
import DashboardReviews from "./pages/DashboardReviews";
import DashboardSettings from "./pages/DashboardSettings";
import RestaurantView from "./pages/RestaurantView";
import ProductDetails from "./pages/ProductDetails";
import CustomerSettings from "./pages/CustomerSettings";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { realtimeService } from "./integrations/supabase/realtimeService";
// Importar o filtro de console
import "@/utils/console-filter";

const queryClient = new QueryClient();

const App = () => {
  // Configurar tratamento global para erros do Supabase Realtime
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Quando a página fica oculta (usuário muda de aba ou minimiza), cancelar todas as subscrições
        realtimeService.unsubscribeAll();
      }
    };

    // Adicionar listener para quando o usuário mudar de aba
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas protegidas do Dashboard */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/orders" element={
                  <ProtectedRoute>
                    <DashboardOrders />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/products" element={
                  <ProtectedRoute>
                    <DashboardProducts />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/categories" element={
                  <ProtectedRoute>
                    <DashboardCategories />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/customers" element={
                  <ProtectedRoute>
                    <DashboardCustomers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/reports" element={
                  <ProtectedRoute>
                    <DashboardReports />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/reviews" element={
                  <ProtectedRoute>
                    <DashboardReviews />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/settings/profile" element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                } />
                
                {/* Rotas públicas */}
                <Route path="/restaurante/:slug" element={<RestaurantView />} />
                <Route path="/produto/:productId" element={<ProductDetails />} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
                <Route path="/configuracoes" element={
                  <ProtectedRoute>
                    <CustomerSettings />
                  </ProtectedRoute>
                } />
                <Route path="/perfil" element={
                  <ProtectedRoute>
                    <CustomerSettings />
                  </ProtectedRoute>
                } />
                
                {/* Nova rota específica para perfil do cliente */}
                <Route path="/cliente/perfil" element={<CustomerSettings />} />
                
                {/* Rota de fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
