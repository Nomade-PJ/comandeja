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
  const { restaurant } = useRestaurant();
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

  // Função para buscar pedidos recentes sem causar erros
  const fetchRecentOrders = useCallback(async () => {
    if (!restaurant) return;
    
    try {
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, created_at, status, total')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentOrdersError) {
        console.error('Erro ao buscar pedidos recentes:', recentOrdersError);
        return;
      }
      
      if (recentOrdersData) {
        setStats(prevStats => ({
          ...prevStats,
          recentOrders: recentOrdersData
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
    }
  }, [restaurant]);

  // Função para inicializar dados para um novo restaurante
  const initializeDataForNewRestaurant = useCallback(async () => {
    if (!restaurant) return false;
    
    try {
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0];
      
      // Verificar se já existe registro para hoje
      const { data: existingData, error: checkError } = await supabase
        .from('dashboard_statistics')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .eq('date', todayFormatted)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Erro ao verificar estatísticas existentes:", checkError);
        return false;
      }
      
      // Se não existir, criar registro
      if (!existingData) {
        const { error: statsError } = await supabase
          .from('dashboard_statistics')
          .insert({
            restaurant_id: restaurant.id,
            date: todayFormatted,
            total_revenue: 0,
            total_orders: 0,
            total_customers: 0,
            average_order_value: 0
          });
          
        if (statsError) {
          console.error("Erro ao inicializar estatísticas:", statsError);
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error("Erro ao inicializar dados para novo restaurante:", err);
      return false;
    }
  }, [restaurant]);

  // Definir fetchDashboardStats fora do useEffect para poder usar em diferentes effects
  const fetchDashboardStats = useCallback(async () => {
    if (!restaurant) return;
    
    try {
      setError(null);
      
      // Primeiro garantir que os dados estão inicializados
      await initializeDataForNewRestaurant();
      
      // Buscar dados de hoje
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayStats, error: statsError } = await supabase
        .from('dashboard_statistics')
        .select('total_revenue, total_orders, total_customers, average_order_value')
        .eq('restaurant_id', restaurant.id)
        .eq('date', today)
        .maybeSingle();
        
      if (statsError) {
        if (statsError.code === 'PGRST116') {
          // Se não encontrou, inicializa novamente
          await initializeDataForNewRestaurant();
        } else {
          console.error("Erro ao buscar estatísticas:", statsError);
          setError(statsError as any);
        }
      }
      
      // Atualizar estatísticas com dados do banco
      if (todayStats) {
        setStats(prev => ({
          ...prev,
          todaySales: {
            ...prev.todaySales,
            value: formatCurrency(todayStats.total_revenue || 0)
          },
          todayOrders: {
            ...prev.todayOrders,
            value: String(todayStats.total_orders || 0)
          },
          newCustomers: {
            ...prev.newCustomers,
            value: String(todayStats.total_customers || 0)
          },
          averageTime: {
            ...prev.averageTime,
            value: `${todayStats.average_order_value || 0} min`
          }
        }));
      }
      
      // Carregar dados secundários em background
      fetchRecentOrders().catch(err => {
        console.error("Erro ao buscar pedidos recentes:", err);
      });
      
      // Resetar contador de tentativas após sucesso
      setRetryCount(0);
      
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
      setError(err as Error);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchDashboardStats();
        }, 1000 * Math.pow(2, retryCount)); // Backoff exponencial
      }
    }
  }, [restaurant, fetchRecentOrders, retryCount, initializeDataForNewRestaurant]);

  // Efeito para buscar dados quando o restaurante mudar
  useEffect(() => {
    if (restaurant) {
      fetchDashboardStats();
    }
  }, [restaurant, fetchDashboardStats]);

  return {
    stats,
    error,
    refetch: fetchDashboardStats
  };
} 