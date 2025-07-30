import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PendingReview {
  id: string;
  order_number: string;
  restaurant_id: string;
  customer_name: string;
  total: number;
  delivered_at: string;
}

export const useAutoReviews = () => {
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [currentReviewOrder, setCurrentReviewOrder] = useState<PendingReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Buscar pedidos entregues sem avaliação
  const fetchPendingReviews = useCallback(async () => {
    if (!user) return;

    try {
      // Buscar pedidos entregues há mais de 1 hora sem avaliação
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          restaurant_id,
          customer_name,
          total,
          updated_at,
          reviews!left(id)
        `)
        .eq('customer_email', user.email)
        .eq('status', 'delivered')
        .lt('updated_at', oneHourAgo)
        .is('reviews.id', null); // Apenas pedidos sem avaliação

      if (error) {
        console.error('Erro ao buscar pedidos para avaliação:', error);
        return;
      }

      const pendingOrders = orders?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        restaurant_id: order.restaurant_id,
        customer_name: order.customer_name,
        total: order.total,
        delivered_at: order.updated_at
      })) || [];

      setPendingReviews(pendingOrders);

      // Se há pedidos pendentes e não há modal aberto, mostrar o primeiro
      if (pendingOrders.length > 0 && !showReviewModal) {
        setCurrentReviewOrder(pendingOrders[0]);
        setShowReviewModal(true);
      }

    } catch (error) {
      console.error('Erro ao buscar avaliações pendentes:', error);
    }
  }, [user, showReviewModal]);

  // Verificar periodicamente por novos pedidos para avaliar
  useEffect(() => {
    if (!user) return;

    // Verificar imediatamente
    fetchPendingReviews();

    // Verificar a cada 10 minutos
    const interval = setInterval(fetchPendingReviews, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, fetchPendingReviews]);

  // Listener para pedidos recém entregues
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('delivered-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_email=eq.${user.email}`
        },
        async (payload) => {
          const { new: newOrder, old: oldOrder } = payload;
          
          // Se o pedido mudou para "delivered"
          if (newOrder.status === 'delivered' && oldOrder.status !== 'delivered') {
            console.log('📦 Pedido entregue detectado:', newOrder.order_number);
            
            // Agendar solicitação de avaliação para 1 hora depois
            setTimeout(() => {
              fetchPendingReviews();
            }, 60 * 60 * 1000); // 1 hora
            
            // Para demo/teste, também verificar após 30 segundos
            setTimeout(() => {
              fetchPendingReviews();
            }, 30 * 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPendingReviews]);

  // Marcar avaliação como concluída
  const markReviewCompleted = useCallback(() => {
    if (currentReviewOrder) {
      setPendingReviews(prev => 
        prev.filter(order => order.id !== currentReviewOrder.id)
      );
    }
    setShowReviewModal(false);
    setCurrentReviewOrder(null);
  }, [currentReviewOrder]);

  // Pular avaliação atual
  const skipCurrentReview = useCallback(() => {
    if (currentReviewOrder) {
      setPendingReviews(prev => 
        prev.filter(order => order.id !== currentReviewOrder.id)
      );
    }
    
    // Mostrar próximo pedido se houver
    const remainingReviews = pendingReviews.filter(order => 
      order.id !== currentReviewOrder?.id
    );
    
    if (remainingReviews.length > 0) {
      setCurrentReviewOrder(remainingReviews[0]);
      setShowReviewModal(true);
    } else {
      setShowReviewModal(false);
      setCurrentReviewOrder(null);
    }
  }, [currentReviewOrder, pendingReviews]);

  // Criar cupom de desconto após avaliação
  const createReviewDiscount = useCallback(async (restaurantId: string) => {
    try {
      const discountCode = `REVIEW${Date.now().toString().slice(-6)}`;
      
      const { error } = await supabase
        .from('coupons')
        .insert({
          restaurant_id: restaurantId,
          code: discountCode,
          description: 'Desconto por avaliação - 10% OFF',
          discount_type: 'percentage',
          discount_value: 10,
          minimum_order_value: 0,
          max_uses: 1,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          is_active: true
        });

      if (error) {
        console.error('Erro ao criar cupom de desconto:', error);
      } else {
        console.log('🎁 Cupom de desconto criado:', discountCode);
      }
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
    }
  }, []);

  return {
    pendingReviews,
    currentReviewOrder,
    showReviewModal,
    setShowReviewModal,
    markReviewCompleted,
    skipCurrentReview,
    createReviewDiscount,
    totalPendingReviews: pendingReviews.length
  };
};

export default useAutoReviews; 