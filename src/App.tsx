import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import MenuPage from "./pages/MenuPage";
import CustomersPage from "./pages/CustomersPage";
import ReportsPage from "./pages/ReportsPage";
import CouponsPage from "./pages/CouponsPage";
import ReviewsPage from "./pages/ReviewsPage";
import SettingsPage from "./pages/SettingsPage";
import DatabaseInfo from "./pages/DatabaseInfo";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import PlansPage from "./pages/PlansPage";
import CheckoutPage from "./pages/CheckoutPage";
import { AuthProvider } from "./contexts/AuthContext";
import { RestaurantProvider } from "./contexts/RestaurantContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import RequireCompletedProfile from "./components/RequireCompletedProfile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminClients from "./pages/admin/AdminClients";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminReports from "./pages/admin/AdminReports";
import AdminNotifications from "./pages/admin/AdminNotifications";
import CustomerRestaurantView from "./pages/CustomerRestaurantView";
import CustomerOrderTracking from "./pages/CustomerOrderTracking";
import { useEffect, useState } from "react";
import supabase from "./lib/supabase";

const queryClient = new QueryClient();

// Componente que garante a persistência da sessão
const SessionPersistence = () => {
  useEffect(() => {
    // Verificar se há uma sessão no carregamento da página
    const checkAndRestoreSession = async () => {
      try {
        // Verifica se há uma sessão (isso força o Supabase a verificar os cookies)
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Sessão recuperada com sucesso");
        }
      } catch (e) {
        console.error("Erro ao verificar sessão:", e);
      }
    };
    
    // Verificar sessão imediatamente
    checkAndRestoreSession();
    
    // Adicionar evento para verificar sessão quando a página for recarregada
    const handlePageLoad = () => {
      checkAndRestoreSession();
    };
    
    window.addEventListener('load', handlePageLoad);
    
    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, []);
  
  return null;
};

// Componente para rotas protegidas que exige perfil completo
const ProtectedRoute = ({ children }) => {
  return (
    <PrivateRoute>
      <RequireCompletedProfile>
        {children}
      </RequireCompletedProfile>
    </PrivateRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RestaurantProvider>
          <AdminAuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SessionPersistence />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                
                {/* Customer-facing restaurant routes */}
                <Route path="/r/:restaurantSlug" element={<CustomerRestaurantView />} />
                <Route path="/r/:restaurantSlug/pedido/:orderId" element={<CustomerOrderTracking />} />
                <Route path="/r/:restaurantSlug/*" element={<NotFound />} />
                
                {/* Rota de redirecionamento para acessar restaurante diretamente pelo slug */}
                <Route path="/:restaurantSlug" element={<RestaurantRedirect />} />
                
                {/* Legacy route - redirect to new format */}
                <Route path="/menu/:restaurantId" element={<MenuPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/subscriptions" 
                  element={
                    <AdminRoute>
                      <AdminSubscriptions />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/clients" 
                  element={
                    <AdminRoute>
                      <AdminClients />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/plans" 
                  element={
                    <AdminRoute>
                      <AdminPlans />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/support" 
                  element={
                    <AdminRoute>
                      <AdminSupport />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/reports" 
                  element={
                    <AdminRoute>
                      <AdminReports />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/notifications" 
                  element={
                    <AdminRoute>
                      <AdminNotifications />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <AdminRoute>
                      <AdminSettings />
                    </AdminRoute>
                  } 
                />
                
                {/* Database Info Route */}
                <Route
                  path="/database-info"
                  element={
                    <ProtectedRoute>
                      <DatabaseInfo />
                    </ProtectedRoute>
                  }
                />
                
                {/* Protected Restaurant Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/products" 
                  element={
                    <ProtectedRoute>
                      <ProductsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/customers" 
                  element={
                    <ProtectedRoute>
                      <CustomersPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/coupons" 
                  element={
                    <ProtectedRoute>
                      <CouponsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reviews" 
                  element={
                    <ProtectedRoute>
                      <ReviewsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AdminAuthProvider>
        </RestaurantProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Componente para redirecionar URLs diretas de slug para o formato correto /r/slug
const RestaurantRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const slug = location.pathname.substring(1); // Remove o / inicial
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar se o slug é um comando do sistema
  const systemRoutes = [
    'login', 'register', 'dashboard', 'orders', 'products', 
    'customers', 'reports', 'coupons', 'reviews', 'settings',
    'admin', 'checkout', 'plans', 'terms', 'privacy-policy'
  ];
  
  // Se for uma rota do sistema, não redirecionar
  if (systemRoutes.some(route => slug.startsWith(route))) {
    return <NotFound />;
  }
  
  useEffect(() => {
    // Verificar se o restaurante existe antes de redirecionar
    const checkRestaurant = async () => {
      setIsLoading(true);
      try {
        console.log('Verificando restaurante pelo slug:', slug);
        
        // Verificar se é o restaurante demo "kipizzaria"
        if (slug === 'kipizzaria') {
          console.log('Redirecionando para o restaurante demo');
          navigate(`/r/${slug}`, { replace: true });
          return;
        }
        
        // Verificar se existe na base de dados
        const { data, error } = await supabase
          .from('restaurants')
          .select('id')
          .eq('slug', slug)
          .single();
          
        if (error || !data) {
          console.log('Restaurante não encontrado na base, mas redirecionando para modo demo:', error);
          // Redirecionar para o formato correto mesmo se não existir
          navigate(`/r/${slug}`, { replace: true });
          return;
        }
        
        // Se o restaurante existir, redirecionar para o formato correto
        navigate(`/r/${slug}`, { replace: true });
      } catch (err) {
        console.error('Erro ao verificar restaurante:', err);
        // Mesmo em caso de erro, redirecionar para o formato correto
        navigate(`/r/${slug}`, { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRestaurant();
  }, [slug, navigate]);
  
  // Exibir estado de carregamento enquanto verifica
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Este return não será alcançado normalmente por causa dos redirecionamentos
  return null;
};

export default App;
