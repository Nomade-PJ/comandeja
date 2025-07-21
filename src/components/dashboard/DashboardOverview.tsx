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
import { realtimeService } from "@/integrations/supabase/realtimeService";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardOverviewProps {
  onRealtimeError?: () => void;
}

const DashboardOverview = ({ onRealtimeError }: DashboardOverviewProps) => {
  const { restaurant, loading } = useRestaurant();
  const { stats, error: statsError, refetch } = useDashboardStats();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Verificar se o restaurante existe (mesmo que parcialmente configurado)
  const hasRestaurant = restaurant !== null;
  
  // Verificar se o restaurante tem slug para mostrar o cardápio
  const hasRestaurantSlug = restaurant?.slug ? true : false;

  // Marcar quando o carregamento inicial estiver completo
  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading]);

  // Registrar handler de erro para o serviço de realtime e tentar reconectar silenciosamente
  useEffect(() => {
    const handleReconnect = () => {
      refetch?.();
    };
    
    const removeHandler = realtimeService.onError(handleReconnect);
    
    return () => {
      removeHandler();
    };
  }, [refetch]);

  // Mostrar mensagem de erro se houver falha no carregamento
  if (statsError) {
    return (
      <Alert className="max-w-lg mx-auto border-red-200 bg-red-50">
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
    );
  }

  // Mostrar um indicador de carregamento enquanto os dados estão sendo buscados
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta!</h2>
          <p className="text-muted-foreground">
            Aqui está o resumo do seu restaurante hoje.
          </p>
        </div>
        {hasRestaurantSlug ? (
          <Link to={`/${restaurant.slug}`}>
            <Button className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white">
              Ver Cardápio do Cliente
            </Button>
          </Link>
        ) : (
          <Link to="/configuracoes?tab=restaurant-info">
            <Button className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white">
              {hasRestaurant ? "Completar Configuração" : "Configurar Restaurante"}
            </Button>
          </Link>
        )}
      </div>

      {/* Mostrar alerta apenas para usuários totalmente novos (sem nenhum registro de restaurante) e apenas após o carregamento inicial */}
      {initialLoadComplete && !hasRestaurant && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração necessária</AlertTitle>
          <AlertDescription>
            Você ainda não configurou seu restaurante. 
            <Link to="/configuracoes?tab=restaurant-info" className="ml-1 text-brand-600 hover:text-brand-700 font-medium">
              Configure agora
            </Link>.
          </AlertDescription>
        </Alert>
      )}

      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <TopProducts />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <RecentOrders />
      </div>
    </div>
  );
}

export default DashboardOverview;
