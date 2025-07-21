import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DeliveryTracking, DeliveryTrackingInsert, DeliveryTrackingUpdate } from '@/integrations/supabase/types';

interface UseDeliveryTrackingProps {
  orderId?: string;
  isDeliveryPerson?: boolean;
}

export const useDeliveryTracking = ({ orderId, isDeliveryPerson = false }: UseDeliveryTrackingProps = {}) => {
  const [trackingInfo, setTrackingInfo] = useState<DeliveryTracking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Buscar informações de rastreamento
  const fetchTrackingInfo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setTrackingInfo(data);
      return data;
    } catch (err) {
      console.error('Erro ao buscar informações de rastreamento:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Iniciar rastreamento para um pedido
  const startTracking = async (orderData: DeliveryTrackingInsert): Promise<DeliveryTracking | null> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se já existe um rastreamento ativo para este pedido
      const { data: existingTracking } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderData.order_id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingTracking) {
        // Atualizar o rastreamento existente
        const { data, error } = await supabase
          .from('delivery_tracking')
          .update({
            delivery_person_id: orderData.delivery_person_id || existingTracking.delivery_person_id,
            delivery_person_name: orderData.delivery_person_name || existingTracking.delivery_person_name,
            current_latitude: orderData.current_latitude || existingTracking.current_latitude,
            current_longitude: orderData.current_longitude || existingTracking.current_longitude,
            last_updated: new Date().toISOString(),
            status: orderData.status || existingTracking.status,
            estimated_arrival_time: orderData.estimated_arrival_time || existingTracking.estimated_arrival_time,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTracking.id)
          .select()
          .single();

        if (error) throw error;
        setTrackingInfo(data);
        return data;
      } else {
        // Criar um novo rastreamento
        const { data, error } = await supabase
          .from('delivery_tracking')
          .insert({
            ...orderData,
            last_updated: new Date().toISOString(),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        setTrackingInfo(data);
        return data;
      }
    } catch (err) {
      console.error('Erro ao iniciar rastreamento:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar a localização do entregador
  const updateLocation = async (latitude: number, longitude: number): Promise<boolean> => {
    if (!trackingInfo) return false;

    try {
      setError(null);

      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', trackingInfo.id);

      if (error) throw error;

      // Atualizar o estado local
      setTrackingInfo(prev => prev ? {
        ...prev,
        current_latitude: latitude,
        current_longitude: longitude,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : null);

      return true;
    } catch (err) {
      console.error('Erro ao atualizar localização:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  // Atualizar o status da entrega
  const updateStatus = async (status: DeliveryTrackingUpdate['status']): Promise<boolean> => {
    if (!trackingInfo) return false;

    try {
      setError(null);

      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          status,
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', trackingInfo.id);

      if (error) throw error;

      // Atualizar o estado local
      setTrackingInfo(prev => prev ? {
        ...prev,
        status,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : null);

      // Também atualizar o status do pedido
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', trackingInfo.order_id);

      return true;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  // Finalizar o rastreamento
  const finishTracking = async (): Promise<boolean> => {
    if (!trackingInfo) return false;

    try {
      setError(null);

      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          is_active: false,
          status: 'delivered',
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', trackingInfo.id);

      if (error) throw error;

      // Atualizar o estado local
      setTrackingInfo(prev => prev ? {
        ...prev,
        is_active: false,
        status: 'delivered',
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : null);

      // Também atualizar o status do pedido para entregue
      await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', trackingInfo.order_id);

      return true;
    } catch (err) {
      console.error('Erro ao finalizar rastreamento:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  // Obter a localização atual do dispositivo
  const getCurrentPosition = (): Promise<{ latitude: number, longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo seu navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  // Iniciar rastreamento automático (para entregadores)
  const startAutoTracking = (intervalSeconds = 30) => {
    if (!isDeliveryPerson || !trackingInfo) return () => {};

    const intervalId = setInterval(async () => {
      try {
        const position = await getCurrentPosition();
        await updateLocation(position.latitude, position.longitude);
      } catch (err) {
        console.error('Erro ao atualizar localização automaticamente:', err);
      }
    }, intervalSeconds * 1000);

    return () => clearInterval(intervalId);
  };

  // Configurar inscrição para atualizações em tempo real
  useEffect(() => {
    if (!orderId) return;

    fetchTrackingInfo(orderId);

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel(`tracking_updates:${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_tracking',
        filter: `order_id=eq.${orderId}`
      }, (payload) => {
        setTrackingInfo(payload.new as DeliveryTracking);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return {
    trackingInfo,
    loading,
    error,
    fetchTrackingInfo,
    startTracking,
    updateLocation,
    updateStatus,
    finishTracking,
    getCurrentPosition,
    startAutoTracking
  };
}; 