import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { realtimeService } from "@/integrations/supabase/realtimeService";

const Dashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { loading: isRestaurantLoading, restaurant } = useRestaurant();
  const navigate = useNavigate();
  const [realtimeError, setRealtimeError] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/login");
    }
  }, [user, isAuthLoading, navigate]);

  // Detectar se o navegador está offline
  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      // Quando voltar online, tentar reconectar automaticamente
      if (realtimeError) {
        handleReload();
      }
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
  }, [realtimeError]);

  // Função para lidar com erros de conexão Realtime
  const handleReload = () => {
    setRetrying(true);
    setReconnectAttempts(prev => prev + 1);
    
    // Implementar backoff exponencial para reconexão
    const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 10000); // Máximo de 10 segundos
    
    setTimeout(() => {
      window.location.reload();
    }, delay);
  };

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

            {realtimeError && !offlineMode && (
              <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Problemas na conexão</AlertTitle>
                <AlertDescription className="text-yellow-700 flex items-center justify-between">
                  <span>Estamos com dificuldades para obter dados em tempo real. Alguns dados podem estar desatualizados.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                    onClick={handleReload}
                    disabled={retrying}
                  >
                    {retrying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reconectando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reconectar
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <DashboardOverview onRealtimeError={() => setRealtimeError(true)} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
