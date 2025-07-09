import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderTracking = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && orderId) {
      fetchOrder();
      
      // Configurar inscrição para atualizações em tempo real
      const channel = supabase
        .channel(`order_updates:${orderId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        }, (payload) => {
          setOrder(payload.new);
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          restaurants(name, logo_url, phone)
        `)
        .eq('id', orderId)
        .eq('customer_id', user.id)
        .single();
      
      if (error) throw error;
      
      setOrder(data);
    } catch (err) {
      setError(err);
      console.error("Erro ao buscar detalhes do pedido:", err);
    } finally {
      setLoading(false);
    }
  };

  // Função para mapear o status para um número de etapa
  const getStatusStep = () => {
    if (!order) return 0;
    
    const statusMap = {
      'pending': 1,      // Pedido Recebido
      'preparing': 2,    // Em Preparo
      'delivering': 3,   // Saiu para entrega
      'delivered': 4,    // Entregue
      'canceled': -1     // Cancelado
    };
    
    return statusMap[order.status] || 0;
  };

  // Função para obter texto do status em português
  const getStatusText = () => {
    if (!order) return '';
    
    const statusTextMap = {
      'pending': 'Pedido Recebido',
      'preparing': 'Em Preparo',
      'delivering': 'Saiu para entrega',
      'delivered': 'Entregue',
      'canceled': 'Cancelado'
    };
    
    return statusTextMap[order.status] || 'Status desconhecido';
  };

  return { 
    order, 
    loading, 
    error, 
    refetch: fetchOrder,
    getStatusStep,
    getStatusText
  };
}; 