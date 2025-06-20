import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';
import { toast } from '@/components/ui/use-toast';
import { useCustomer } from './useCustomer';
import { Database } from '@/integrations/supabase/types';
import { realtimeService } from '@/integrations/supabase/realtimeService';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'voucher';

export interface OrderWithItems {
  id: string;
  order_number: string;
  restaurant_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total: number;
  payment_method?: PaymentMethod;
  payment_status: string;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface RestaurantSettings {
  delivery_fee?: number;
}

export const useOrders = () => {
  const { restaurant } = useRestaurant();
  const { getOrCreateCustomer } = useCustomer();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);

  // Função para buscar todos os pedidos do restaurante
  const fetchOrders = useCallback(async (filters?: { status?: string, search?: string }) => {
    if (!restaurant) return;
    
    setLoading(true);
    
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });
      
      // Aplicar filtros se fornecidos
      if (filters?.status && filters.status !== 'all') {
        // Validamos que o status fornecido é um status de pedido válido
        const validStatus = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].includes(filters.status);
        if (validStatus) {
          query = query.eq('status', filters.status as OrderStatus);
        }
      }
      
      if (filters?.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os pedidos',
          variant: 'destructive',
        });
        return;
      }
      
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurant]);

  // Função para buscar um pedido específico com seus itens
  const fetchOrderWithItems = useCallback(async (orderId: string) => {
    if (!restaurant) return null;
    
    setLoading(true);
    
    try {
      // Buscar informações do pedido
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('restaurant_id', restaurant.id)
        .single();
      
      if (orderError) {
        console.error('Erro ao buscar detalhes do pedido:', orderError);
        return null;
      }
      
      // Buscar itens do pedido
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (itemsError) {
        console.error('Erro ao buscar itens do pedido:', itemsError);
      }
      
      // Combinar dados do pedido com seus itens
      return {
        ...orderData,
        items: itemsData || []
      } as OrderWithItems;
    } catch (error) {
      console.error('Erro ao buscar pedido com itens:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [restaurant]);

  // Função para criar um novo pedido
  const createOrder = useCallback(async (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[];
    deliveryMethod: 'delivery' | 'pickup';
    deliveryAddress?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    if (!restaurant) return null;
    
    setLoading(true);
    
    try {
      // Buscar configurações do restaurante para obter a taxa de entrega
      const { data: restaurantSettings } = await supabase
        .from('restaurant_settings')
        .select('delivery_fee')
        .eq('restaurant_id', restaurant.id)
        .single();
      
      // Verificar se existe um cliente ou criar um novo
      let customerId: string | undefined;
      
      if (orderData.customerPhone && orderData.customerEmail) {
        // Buscar cliente existente pelo telefone ou email
        const { data: existingCustomers } = await supabase
          .from('customers')
          .select('id')
          .eq('restaurant_id', restaurant.id)
          .or(`phone.eq.${orderData.customerPhone},email.eq.${orderData.customerEmail}`)
          .limit(1);
        
        if (existingCustomers && existingCustomers.length > 0) {
          customerId = existingCustomers[0].id;
        } else {
          // Criar novo cliente
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({
              restaurant_id: restaurant.id,
              name: orderData.customerName,
              email: orderData.customerEmail,
              phone: orderData.customerPhone,
              created_at: new Date().toISOString(),
              total_orders: 1,
              total_spent: orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0)
            })
            .select('id')
            .single();
          
          if (customerError) {
            console.error('Erro ao criar cliente:', customerError);
          } else {
            customerId = newCustomer.id;
          }
        }
      }
      
      // Calcular valores do pedido
      const subtotal = orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const deliveryFee = orderData.deliveryMethod === 'delivery' ? (restaurantSettings?.delivery_fee || 0) : 0;
      const total = subtotal + deliveryFee;
      
      // Gerar número do pedido
      const timestamp = Date.now().toString().slice(-6);
      const randomDigits = Math.floor(Math.random() * 1000);
      const orderNumber = `ORD-${timestamp}${randomDigits}`;
      
      // Criar pedido
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant.id,
          customer_id: customerId,
          order_number: orderNumber,
          status: 'confirmed' as OrderStatus, // Pedidos criados manualmente já começam confirmados
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          discount_amount: 0,
          total: total,
          payment_method: orderData.paymentMethod,
          payment_status: 'paid',
          delivery_method: orderData.deliveryMethod,
          delivery_address: orderData.deliveryMethod === 'delivery' ? orderData.deliveryAddress : null,
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_email: orderData.customerEmail,
          notes: orderData.notes
        })
        .select('id')
        .single();
      
      if (orderError) {
        console.error('Erro ao criar pedido:', orderError);
        toast({
          title: 'Erro',
          description: 'Não foi possível criar o pedido',
          variant: 'destructive',
        });
        return null;
      }
      
      // Adicionar itens ao pedido
      for (const item of orderData.items) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: newOrder.id,
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          });
          
        if (itemError) {
          console.error('Erro ao adicionar item ao pedido:', itemError);
        }
      }
      
      // Atualizar a lista de pedidos
      fetchOrders();
      
      toast({
        title: 'Pedido criado',
        description: `Pedido #${orderNumber} criado com sucesso`,
      });
      
      return newOrder.id;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar o pedido',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [restaurant, fetchOrders]);

  // Função para atualizar o status de um pedido
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    if (!restaurant) return false;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .eq('restaurant_id', restaurant.id);
      
      if (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o status do pedido',
          variant: 'destructive',
        });
        return false;
      }
      
      // Atualizar a lista de pedidos
      fetchOrders();
      
      toast({
        title: 'Status atualizado',
        description: `Pedido atualizado para "${newStatus}"`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return false;
    }
  }, [restaurant, fetchOrders]);

  // Configurar assinatura em tempo real para pedidos
  useEffect(() => {
    if (!restaurant) return;
    
    // Usar o serviço Realtime para evitar múltiplas inscrições
    const unsubscribe = realtimeService.subscribeToTable(
      'orders',
      restaurant.id,
      () => {
        console.log('Atualização em tempo real detectada na tabela orders');
        fetchOrders();
      }
    );
    
    // Limpar assinatura quando o componente for desmontado
    return () => {
      unsubscribe();
    };
  }, [restaurant, fetchOrders]);

  return {
    orders,
    loading,
    fetchOrders,
    fetchOrderWithItems,
    createOrder,
    updateOrderStatus
  };
}; 