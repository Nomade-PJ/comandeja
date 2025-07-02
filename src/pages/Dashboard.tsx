import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const { loading: isRestaurantLoading, restaurant } = useRestaurant();
  const navigate = useNavigate();
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/login");
    }
  }, [user, isAuthLoading, navigate]);

  // Detectar se o navegador está offline
  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      // Quando voltar online, tentar reconectar automaticamente sem mostrar mensagem
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar estado atual
    setOfflineMode(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mostrar tela de carregamento enquanto carrega usuário e dados do restaurante
  if (isAuthLoading || (user && isRestaurantLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600 mb-4"></div>
        <h2 className="text-xl font-medium text-gray-800 mb-2">Carregando dashboard</h2>
        <p className="text-sm text-gray-500">
          {isAuthLoading 
            ? "Verificando autenticação..." 
            : isRestaurantLoading 
              ? "Carregando dados do restaurante..." 
              : "Preparando sistema..."}
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-4">
            {offlineMode && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <WifiOff className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Você está offline</AlertTitle>
                <AlertDescription className="text-red-700 flex items-center justify-between">
                  <span>Sua conexão com a internet foi perdida. Algumas funcionalidades não estão disponíveis.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Verificar conexão
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Alerta de problemas na conexão removido */}
            <DashboardOverview />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
