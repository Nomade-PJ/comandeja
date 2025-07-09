import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          restaurants(name, logo_url)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setOrders(data || []);
    } catch (err) {
      setError(err);
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar um pedido específico por ID
  const getOrderById = async (orderId) => {
    try {
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
      
      return data;
    } catch (err) {
      console.error("Erro ao buscar pedido específico:", err);
      return null;
    }
  };

  // Função para buscar o pedido mais recente
  const getLatestOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          restaurants(name, logo_url, phone)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error("Erro ao buscar pedido mais recente:", err);
      return null;
    }
  };

  return { 
    orders, 
    loading, 
    error, 
    refetch: fetchOrders,
    getOrderById,
    getLatestOrder
  };
}; 