import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

// Valores iniciais para os stats
const initialStats: DashboardStats = {
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
};

export function useDashboardStats() {
  const { restaurant } = useRestaurant();
  const queryClient = useQueryClient();
  
  // Função para buscar estatísticas principais
  const fetchMainStats = useCallback(async () => {
    if (!restaurant?.id) return initialStats;
    
    try {
      // Primeiro garantir que os dados estão inicializados
      await initializeDataForNewRestaurant(restaurant.id);
      
      // Buscar dados de hoje
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayStats, error: statsError } = await supabase
        .from('dashboard_statistics')
        .select('total_revenue, total_orders, total_customers, average_order_value')
        .eq('restaurant_id', restaurant.id)
        .eq('date', today)
        .maybeSingle();
        
      if (statsError && statsError.code !== 'PGRST116') {
        console.error("Erro ao buscar estatísticas:", statsError);
        return initialStats;
      }
      
      // Retornar estatísticas atualizadas
      return {
        ...initialStats,
        todaySales: {
          ...initialStats.todaySales,
          value: formatCurrency(todayStats?.total_revenue || 0)
        },
        todayOrders: {
          ...initialStats.todayOrders,
          value: String(todayStats?.total_orders || 0)
        },
        newCustomers: {
          ...initialStats.newCustomers,
          value: String(todayStats?.total_customers || 0)
        },
        averageTime: {
          ...initialStats.averageTime,
          value: `${todayStats?.average_order_value || 0} min`
        }
      };
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
      return initialStats;
    }
  }, [restaurant]);
  
  // Função para buscar pedidos recentes
  const fetchRecentOrders = useCallback(async () => {
    if (!restaurant?.id) return [];
    
    try {
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, created_at, status, total')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentOrdersError) {
        console.error('Erro ao buscar pedidos recentes:', recentOrdersError);
        return [];
      }
      
      return recentOrdersData || [];
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
      return [];
    }
  }, [restaurant]);
  
  // Função para inicializar dados para um novo restaurante
  const initializeDataForNewRestaurant = async (restaurantId: string) => {
    try {
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0];
      
      // Verificar se já existe registro para hoje
      const { data: existingData, error: checkError } = await supabase
        .from('dashboard_statistics')
        .select('id')
        .eq('restaurant_id', restaurantId)
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
            restaurant_id: restaurantId,
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
  };

  // Query para estatísticas principais - prioridade alta
  const { 
    data: stats = initialStats, 
    error: statsError,
    isLoading: loading,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['dashboardStats', restaurant?.id],
    queryFn: fetchMainStats,
    enabled: !!restaurant?.id,
    staleTime: 60000, // 1 minuto
    gcTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
  });
  
  // Query para pedidos recentes - prioridade secundária
  const { 
    data: recentOrders = [],
    refetch: refetchOrders 
  } = useQuery({
    queryKey: ['recentOrders', restaurant?.id],
    queryFn: fetchRecentOrders,
    enabled: !!restaurant?.id,
    staleTime: 60000, // 1 minuto
    gcTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
  });
  
  // Combinar os dados
  const combinedStats = {
    ...stats,
    recentOrders
  };

  // Efeito para registrar listener de realtime
  useEffect(() => {
    if (!restaurant?.id) return;
    
    // Subscrever a mudanças nas tabelas relevantes
    const unsubscribeOrders = realtimeService.subscribeToTable('orders', restaurant.id, () => {
      refetchOrders();
    });
    
    const unsubscribeStats = realtimeService.subscribeToTable('dashboard_statistics', restaurant.id, () => {
      refetchStats();
    });
    
    return () => {
      unsubscribeOrders();
      unsubscribeStats();
    };
  }, [restaurant, refetchOrders, refetchStats]);

  const refetch = useCallback(() => {
    refetchStats();
    refetchOrders();
  }, [refetchStats, refetchOrders]);

  // Retornar tudo junto
  return {
    stats,
    error: statsError,
    loading,
    refetch: () => {
      refetchStats();
    }
  };
} 