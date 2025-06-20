import { supabase } from '@/integrations/supabase/client';

/**
 * Atualiza as estatísticas para um pedido específico usando a função segura do banco de dados
 * @param orderId ID do pedido para atualizar as estatísticas
 * @returns Resultado da operação
 */
export async function fixDashboardStatsForOrder(orderId: string) {
  try {
    console.log(`Atualizando estatísticas para o pedido: ${orderId}`);
    
    // Usar as-any para ignorar erros de tipagem na função RPC personalizada
    const { data, error } = await (supabase as any).rpc('fix_dashboard_stats_for_order', {
      order_id_param: orderId
    });
    
    if (error) {
      console.error('Erro ao chamar função fix_dashboard_stats_for_order:', error);
      return { success: false, error };
    }
    
    console.log('Resultado da atualização via RPC:', data);
    // Corrigir comparação de tipos: o resultado da função RPC é boolean
    return { success: Boolean(data), data };
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do dashboard para o pedido:', error);
    return { success: false, error };
  }
}

/**
 * Atualiza manualmente as estatísticas do dashboard para um restaurante específico
 * Esta função é útil quando ocorrem problemas com as políticas RLS ou gatilhos
 * @param restaurantId ID do restaurante para atualizar as estatísticas
 * @param date Data para a qual atualizar as estatísticas (padrão: hoje)
 * @returns Resultado da operação
 */
export async function updateDashboardStatistics(restaurantId: string, date?: Date) {
  try {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`Atualizando estatísticas para restaurante ${restaurantId} na data ${dateStr}`);
    
    // 1. Obter dados dos pedidos para a data específica
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_id, total')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);
    
    if (ordersError) {
      console.error('Erro ao buscar pedidos:', ordersError);
      return { success: false, error: ordersError };
    }
    
    // 2. Calcular estatísticas
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Contar clientes únicos
    const uniqueCustomers = new Set();
    ordersData.forEach(order => {
      if (order.customer_id) {
        uniqueCustomers.add(order.customer_id);
      }
    });
    const totalCustomers = uniqueCustomers.size;
    
    // Calcular valor médio do pedido
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // 3. Atualizar as estatísticas no dashboard diretamente
    const { data: existingStats, error: checkError } = await supabase
      .from('dashboard_statistics')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('date', dateStr)
      .single();
      
    let result;
    
    // Se já existem estatísticas para esta data, atualize-as
    if (existingStats) {
      result = await supabase
        .from('dashboard_statistics')
        .update({
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          total_customers: totalCustomers,
          average_order_value: averageOrderValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStats.id);
    } else {
      // Caso contrário, insira um novo registro
      result = await supabase
        .from('dashboard_statistics')
        .insert({
          restaurant_id: restaurantId,
          date: dateStr,
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          total_customers: totalCustomers,
          average_order_value: averageOrderValue
        });
    }
    
    if (result.error) {
      console.error('Erro ao atualizar estatísticas do dashboard:', result.error);
      return { success: false, error: result.error };
    }
    
    return { 
      success: true, 
      data: { 
        totalOrders, 
        totalRevenue, 
        totalCustomers, 
        averageOrderValue 
      } 
    };
  } catch (error) {
    console.error('Erro na função de atualização de estatísticas:', error);
    return { success: false, error };
  }
} 