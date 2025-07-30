import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from '@/services/notificationService';

export const useOrderNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Configurar listener para mudanças de status de pedidos do usuário
    const channel = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_email=eq.${user.email}`
        },
        async (payload) => {
          console.log('📱 Mudança de status detectada:', payload);
          
          const { new: newOrder, old: oldOrder } = payload;
          
          // Verificar se o status realmente mudou
          if (newOrder.status !== oldOrder.status) {
            // Enviar notificação para o cliente
            await notificationService.notifyStatusChange(
              newOrder.order_number,
              newOrder.status,
              newOrder.customer_name
            );
          }
        }
      )
      .subscribe();

    // Limpar subscription quando o componente for desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Solicitar permissão para notificações quando o hook for usado
  useEffect(() => {
    notificationService.requestPermission();
  }, []);
};

export default useOrderNotifications; 