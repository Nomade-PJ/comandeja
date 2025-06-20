import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useRestaurant } from './useRestaurant';

export interface Customer {
  id: string;
  restaurant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  total_orders: number;
  total_spent: number;
  user_id?: string | null;
  last_order_at: string | null;
  created_at: string;
  updated_at?: string;
}

interface CustomerStats {
  total: number;
  newThisMonth: number;
  averageTicket: number;
  mostLoyal: Customer | null;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    newThisMonth: 0,
    averageTicket: 0,
    mostLoyal: null
  });
  const { toast } = useToast();
  const { restaurant } = useRestaurant();

  useEffect(() => {
    if (restaurant?.id) {
      fetchCustomers();
    }
  }, [restaurant]);

  const fetchCustomers = async () => {
    if (!restaurant?.id) return;

    setLoading(true);
    try {
      // Buscar clientes do restaurante
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCustomers(data || []);
      setFilteredCustomers(data || []);

      // Calcular estatísticas
      calculateStats(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customersData: Customer[]) => {
    // Total de clientes
    const total = customersData.length;

    // Novos clientes este mês
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = customersData.filter(
      customer => new Date(customer.created_at) >= firstDayOfMonth
    ).length;

    // Ticket médio
    const totalSpent = customersData.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
    const totalOrders = customersData.reduce((sum, customer) => sum + (customer.total_orders || 0), 0);
    const averageTicket = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Cliente mais leal (com mais pedidos)
    const sortedByOrders = [...customersData].sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));
    const mostLoyal = sortedByOrders.length > 0 ? sortedByOrders[0] : null;

    setStats({
      total,
      newThisMonth,
      averageTicket,
      mostLoyal
    });
  };

  const searchCustomers = (query: string) => {
    if (!query.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery)) ||
      (customer.phone && customer.phone.includes(query))
    );

    setFilteredCustomers(filtered);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return { 
    customers: filteredCustomers,
    loading,
    stats,
    searchCustomers,
    refetch: fetchCustomers,
    formatCurrency
  };
}; 