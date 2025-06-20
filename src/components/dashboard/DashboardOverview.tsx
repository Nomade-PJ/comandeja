import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentOrders from "@/components/dashboard/RecentOrders";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useEffect } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatCurrency } from "@/lib/utils";
import { realtimeService } from "@/integrations/supabase/realtimeService";

interface DashboardOverviewProps {
  onRealtimeError?: () => void;
}

const DashboardOverview = ({ onRealtimeError }: DashboardOverviewProps) => {
  const { restaurant, loading } = useRestaurant();
  const { loading: statsLoading, stats } = useDashboardStats();

  // Registrar handler de erro para o serviço de realtime
  useEffect(() => {
    if (onRealtimeError) {
      const removeHandler = realtimeService.onError(() => {
        onRealtimeError();
      });
      
      return () => {
        removeHandler();
      };
    }
  }, [onRealtimeError]);

  // Detectar possíveis problemas com os dados
  useEffect(() => {
    // Verificar se houve erro ao carregar os dados por 10 segundos
    const timeout = setTimeout(() => {
      if (statsLoading || !stats || (stats.todaySales.value === formatCurrency(0) && stats.todayOrders.value === '0')) {
        onRealtimeError?.();
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [statsLoading, stats, onRealtimeError]);

  return (
    <div className="space-y-6">
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
