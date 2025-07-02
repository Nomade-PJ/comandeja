import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentOrders from "@/components/dashboard/RecentOrders";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useEffect, useState } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatCurrency } from "@/lib/utils";
import { realtimeService } from "@/integrations/supabase/realtimeService";
import { Loader2, AlertTriangle, WifiOff, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DashboardOverviewProps {
  onRealtimeError?: () => void;
}

const DashboardOverview = ({ onRealtimeError }: DashboardOverviewProps) => {
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant();
  const { loading: statsLoading, stats, error: statsError, refreshStats } = useDashboardStats();
  const [showConnectionError, setShowConnectionError] = useState(false);

  // Registrar handler de erro para o serviço de realtime
  useEffect(() => {
    if (onRealtimeError) {
      const removeHandler = realtimeService.onError(() => {
        // Apenas notificar erro de conexão se os dados já estiverem carregados
        if (!restaurantLoading && !statsLoading) {
          setShowConnectionError(true);
          onRealtimeError();
        }
      });
      
      return () => {
        removeHandler();
      };
    }
  }, [onRealtimeError, restaurantLoading, statsLoading]);

  // Detectar possíveis problemas com os dados
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Só iniciar o timeout após o carregamento inicial
    if (!restaurantLoading && !statsLoading) {
      timeoutId = setTimeout(() => {
        if (!stats || (stats.todaySales.value === formatCurrency(0) && stats.todayOrders.value === '0')) {
          setShowConnectionError(true);
          onRealtimeError?.();
        }
      }, 15000); // Aumentado para 15 segundos
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [restaurantLoading, statsLoading, stats, onRealtimeError]);

  // Mostrar tela de carregamento enquanto carrega dados iniciais
  if (restaurantLoading || statsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600 mb-4"></div>
        <h2 className="text-xl font-medium text-gray-800 mb-2">Carregando dashboard</h2>
        <p className="text-sm text-gray-500">
          {restaurantLoading 
            ? "Carregando dados do restaurante..." 
            : statsLoading 
              ? "Carregando estatísticas..." 
              : "Preparando sistema..."}
        </p>
      </div>
    );
  }

  // Mostrar mensagem de erro se houver falha no carregamento
  if (restaurantError || statsError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Alert className="max-w-lg mx-auto border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">Erro ao carregar dados</AlertTitle>
          <AlertDescription className="text-red-700">
            <p className="mb-4">Ocorreu um erro ao carregar os dados do dashboard. Por favor, tente novamente.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showConnectionError && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <WifiOff className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Problemas na conexão</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <p className="mb-2">Estamos com dificuldades para obter dados em tempo real. Alguns dados podem estar desatualizados.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconectar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta!</h2>
          <p className="text-muted-foreground">
            Aqui está o resumo do seu restaurante hoje.
          </p>
        </div>
        {restaurant?.slug ? (
          <Link to={`/restaurante/${restaurant.slug}`}>
            <Button className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white">
              Ver Cardápio do Cliente
            </Button>
          </Link>
        ) : (
          <Link to="/dashboard/settings">
            <Button className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white">
              Configurar Restaurante
            </Button>
          </Link>
        )}
      </div>

      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <TopProducts />
        </div>
      </div>
      
      <RecentOrders />
    </div>
  );
};

export default DashboardOverview;
