import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { realtimeService } from '@/integrations/supabase/realtimeService';
import { useRestaurant } from '@/hooks/useRestaurant';
import { formatCurrency } from '@/lib/utils';

export interface DashboardStats {
  todaySales: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  todayOrders: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  newCustomers: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  averageTime: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  monthlySales: {
    data: {
      name: string;
      vendas: number;
    }[];
  };
  topProducts: {
    id: string;
    name: string;
    quantity: number;
    total: number;
    image_url?: string;
  }[];
  recentOrders: {
    id: string;
    order_number: string;
    customer_name: string;
    created_at: string;
    status: string;
    total: number;
  }[];
}

export function useDashboardStats() {
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: { value: formatCurrency(0), change: '0%', changeType: 'neutral' },
    todayOrders: { value: '0', change: '0%', changeType: 'neutral' },
    newCustomers: { value: '0', change: '0%', changeType: 'neutral' },
    averageTime: { value: '0 min', change: '0%', changeType: 'neutral' },
    monthlySales: {
      data: Array.from({ length: 12 }, (_, i) => ({
        name: String(i + 1).padStart(2, '0'),
        vendas: 0,
      })),
    },
    topProducts: [],
    recentOrders: [],
  });

  // Função para buscar pedidos recentes com retry
  const fetchRecentOrders = useCallback(async () => {
    if (!restaurant) return;
    
    try {
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, created_at, status, total')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentOrdersError) throw recentOrdersError;
      
      if (recentOrdersData) {
        setStats(prevStats => ({
          ...prevStats,
          recentOrders: recentOrdersData
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
      throw error; // Propagar erro para ser tratado pelo fetchDashboardStats
    }
  }, [restaurant]);

  // Definir fetchDashboardStats fora do useEffect para poder usar em diferentes effects
  const fetchDashboardStats = useCallback(async () => {
    if (!restaurant) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Obter a data de hoje e ontem
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Fazer todas as chamadas em paralelo
      const [salesResponse, ordersResponse, customersResponse, ordersTimeResponse] = await Promise.all([
        // 1. Vendas
        supabase
          .from('dashboard_statistics')
          .select('date, total_revenue')
          .eq('restaurant_id', restaurant.id)
          .in('date', [todayStr, yesterdayStr]),
        
        // 2. Pedidos
        supabase
          .from('dashboard_statistics')
          .select('date, total_orders')
          .eq('restaurant_id', restaurant.id)
          .in('date', [todayStr, yesterdayStr]),
        
        // 3. Clientes
        supabase
          .from('dashboard_statistics')
          .select('date, total_customers')
          .eq('restaurant_id', restaurant.id)
          .in('date', [todayStr, yesterdayStr]),
        
        // 4. Tempo médio
        supabase
          .from('orders')
          .select('created_at, updated_at, status')
          .eq('restaurant_id', restaurant.id)
          .eq('status', 'delivered')
          .gte('created_at', today.toISOString().split('T')[0])
      ]);

      // Verificar erros
      if (salesResponse.error) throw salesResponse.error;
      if (ordersResponse.error) throw ordersResponse.error;
      if (customersResponse.error) throw customersResponse.error;
      if (ordersTimeResponse.error) throw ordersTimeResponse.error;

      const todaySalesData = salesResponse.data?.find(item => item.date === todayStr);
      const yesterdaySalesData = salesResponse.data?.find(item => item.date === yesterdayStr);
      
      const todaySales = todaySalesData?.total_revenue || 0;
      const yesterdaySales = yesterdaySalesData?.total_revenue || 0;
      
      // Calcular a mudança percentual nas vendas
      const salesChange = yesterdaySales > 0 
        ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 
        : 0;
      
      const salesChangeType = 
        salesChange > 0 ? 'positive' : 
        salesChange < 0 ? 'negative' : 
        'neutral';
      
      const todayOrdersData = ordersResponse.data?.find(item => item.date === todayStr);
      const yesterdayOrdersData = ordersResponse.data?.find(item => item.date === yesterdayStr);
      
      const todayOrders = todayOrdersData?.total_orders || 0;
      const yesterdayOrders = yesterdayOrdersData?.total_orders || 0;
      
      // Calcular a mudança percentual nos pedidos
      const ordersChange = yesterdayOrders > 0 
        ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 
        : 0;
      
      const ordersChangeType = 
        ordersChange > 0 ? 'positive' : 
        ordersChange < 0 ? 'negative' : 
        'neutral';
      
      const todayCustomersData = customersResponse.data?.find(item => item.date === todayStr);
      const yesterdayCustomersData = customersResponse.data?.find(item => item.date === yesterdayStr);
      
      const todayCustomers = todayCustomersData?.total_customers || 0;
      const yesterdayCustomers = yesterdayCustomersData?.total_customers || 0;
      
      // Calcular a mudança percentual nos clientes
      const customersChange = yesterdayCustomers > 0 
        ? ((todayCustomers - yesterdayCustomers) / yesterdayCustomers) * 100 
        : 0;
      
      const customersChangeType = 
        customersChange > 0 ? 'positive' : 
        customersChange < 0 ? 'negative' : 
        'neutral';
      
      // 4. Calcular tempo médio dos pedidos
      const ordersTimeData = ordersTimeResponse.data;
      
      let averageTime = 0;
      let averageTimeChange = 0;
      let averageTimeChangeType: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      if (ordersTimeData && ordersTimeData.length > 0) {
        // Calcular tempo médio de entrega de hoje
        const totalMinutes = ordersTimeData.reduce((acc, order) => {
          const createdAt = new Date(order.created_at);
          const updatedAt = new Date(order.updated_at);
          const diffMinutes = (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60);
          return acc + diffMinutes;
        }, 0);
        
        averageTime = Math.round(totalMinutes / ordersTimeData.length);
        
        // Obter tempo médio de ontem para comparação
        const yesterdayTimeData = ordersTimeData.filter(item => {
          const createdAt = new Date(item.created_at);
          const yesterdayStrDate = new Date(yesterdayStr);
          return createdAt >= yesterdayStrDate && createdAt < today;
        });
        
        if (yesterdayTimeData && yesterdayTimeData.length > 0) {
          const yesterdayTotalMinutes = yesterdayTimeData.reduce((acc, order) => {
            const createdAt = new Date(order.created_at);
            const updatedAt = new Date(order.updated_at);
            const diffMinutes = (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60);
            return acc + diffMinutes;
          }, 0);
          
          const yesterdayAverageTime = Math.round(yesterdayTotalMinutes / yesterdayTimeData.length);
          
          // Calcular mudança percentual no tempo médio
          averageTimeChange = yesterdayAverageTime > 0 
            ? ((averageTime - yesterdayAverageTime) / yesterdayAverageTime) * 100 
            : 0;
          
          // Para tempo, menor é melhor, então invertemos a lógica
          averageTimeChangeType = 
            averageTimeChange < 0 ? 'positive' : 
            averageTimeChange > 0 ? 'negative' : 
            'neutral';
        }
      }
      
      // 5. Obter vendas mensais
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: monthlySalesData, error: monthlySalesError } = await supabase
        .from('dashboard_statistics')
        .select('date, total_revenue')
        .eq('restaurant_id', restaurant.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      let monthlySales = Array.from({ length: 12 }, (_, i) => ({
        name: String(i + 1).padStart(2, '0'),
        vendas: 0,
      }));
      
      if (!monthlySalesError && monthlySalesData) {
        // Processar os dados dos últimos 12 dias
        const last12Days = monthlySalesData.slice(-12);
        
        monthlySales = last12Days.map((item, index) => {
          const day = new Date(item.date).getDate().toString().padStart(2, '0');
          return {
            name: day,
            vendas: Number(item.total_revenue || 0),
          };
        });
        
        // Se temos menos de 12 dias de dados, preencher com zeros
        if (monthlySales.length < 12) {
          const daysToAdd = 12 - monthlySales.length;
          const lastDate = monthlySales.length > 0 
            ? new Date(monthlySalesData[monthlySalesData.length - 1].date) 
            : new Date();
          
          for (let i = 1; i <= daysToAdd; i++) {
            const nextDay = new Date(lastDate);
            nextDay.setDate(nextDay.getDate() + i);
            monthlySales.push({
              name: nextDay.getDate().toString().padStart(2, '0'),
              vendas: 0,
            });
          }
        }
      }
      
      // 6. Obter produtos mais vendidos
      const topProductsResponse = await (supabase as any)
        .rpc('get_top_products', { 
          restaurant_id_param: restaurant.id,
          limit_param: 5
        });
      
      const topProductsData = topProductsResponse.data;
      const topProductsError = topProductsResponse.error;
      
      const topProducts = !topProductsError && topProductsData 
        ? topProductsData.map((product: any) => ({
            id: product.id,
            name: product.name,
            quantity: Number(product.total_quantity) || 0,
            total: Number(product.total_revenue) || 0,
            image_url: product.image_url,
          }))
        : [];
      
      // Buscar pedidos recentes
      await fetchRecentOrders();
      
      // Resetar contador de tentativas após sucesso
      setRetryCount(0);
      
      // Atualizar o estado com todos os dados
      setStats({
        todaySales: {
          value: formatCurrency(todaySales),
          change: `${Math.abs(salesChange).toFixed(1)}%`,
          changeType: salesChangeType,
        },
        todayOrders: {
          value: String(todayOrders),
          change: `${Math.abs(ordersChange).toFixed(1)}%`,
          changeType: ordersChangeType,
        },
        newCustomers: {
          value: todayCustomers.toString(),
          change: `${customersChange.toFixed(0)}%`,
          changeType: customersChangeType,
        },
        averageTime: {
          value: `${averageTime} min`,
          change: `${averageTimeChange.toFixed(0)}%`,
          changeType: averageTimeChangeType,
        },
        monthlySales: {
          data: monthlySales,
        },
        topProducts,
        recentOrders: stats.recentOrders,
      });
    } catch (error) {
      setError(error as Error);
      console.error('Erro ao carregar estatísticas:', error);
      
      // Tentar novamente se ainda não atingiu o limite
      if (retryCount < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchDashboardStats();
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [restaurant, retryCount, fetchRecentOrders]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (!restaurantLoading && restaurant) {
      fetchDashboardStats();
    }
  }, [restaurant, restaurantLoading, fetchDashboardStats]);

  // Configurar assinatura em tempo real para pedidos
  useEffect(() => {
    if (!restaurant) return;
    
    // Usar o serviço Realtime para evitar múltiplas inscrições no mesmo canal
    const unsubscribe = realtimeService.subscribeToTable(
      'orders',
      restaurant.id,
      () => {
        // Atualizar pedidos recentes e estatísticas silenciosamente
        fetchRecentOrders();
        fetchDashboardStats();
      }
    );
    
    // Limpar assinatura quando o componente for desmontado
    return () => {
      unsubscribe();
    };
  }, [restaurant, fetchRecentOrders, fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchDashboardStats
  };
} 