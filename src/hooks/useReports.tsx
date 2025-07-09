import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export type ReportPeriod = 'day' | 'week' | 'month' | 'year' | 'custom';

// Adicionar interfaces para os tipos retornados pelo Supabase
interface OrderItem {
  id: string;
  quantity: number;
  total_price: number;
  product: {
    category_id: string;
    category: {
      name: string;
    }[];
  }[];
}

export interface ReportData {
  salesReport: {
    totalSales: number;
    formattedTotalSales: string;
    averageOrderValue: number;
    totalOrders: number;
    period: string;
    monthlyData: Array<{
      date: string;
      sales: number;
      orders: number;
    }>;
  };
  productsReport: {
    totalProductsSold: number;
    bestSellingProducts: Array<{
      id: string;
      name: string;
      quantity: number;
      revenue: number;
      formattedRevenue: string;
    }>;
    categoriesBreakdown: Array<{
      category: string;
      quantity: number;
      revenue: number;
      formattedRevenue: string;
    }>;
  };
  customersReport: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    topCustomers: Array<{
      id: string;
      name: string;
      totalOrders: number;
      totalSpent: number;
      formattedTotalSpent: string;
    }>;
  };
}

export function useReports(period: ReportPeriod = 'month', 
                          startDate?: Date, 
                          endDate?: Date) {
  const { restaurant } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    salesReport: {
      totalSales: 0,
      formattedTotalSales: formatCurrency(0),
      averageOrderValue: 0,
      totalOrders: 0,
      period: '',
      monthlyData: []
    },
    productsReport: {
      totalProductsSold: 0,
      bestSellingProducts: [],
      categoriesBreakdown: []
    },
    customersReport: {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      topCustomers: []
    }
  });

  // Extrair a função de busca para fora do useEffect
  const fetchReportsData = async () => {
    if (!restaurant) return;
    
    setLoading(true);

    try {
      // Determinar datas de início e fim baseado no período
      let periodStartDate: Date;
      let periodEndDate: Date = new Date();
      
      if (period === 'custom' && startDate && endDate) {
        periodStartDate = startDate;
        periodEndDate = endDate;
      } else {
        const today = new Date();
        
        switch(period) {
          case 'day':
            periodStartDate = today;
            break;
          case 'week':
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            periodStartDate = lastWeek;
            break;
          case 'month':
            periodStartDate = startOfMonth(today);
            periodEndDate = endOfMonth(today);
            break;
          case 'year':
            const lastYear = new Date(today);
            lastYear.setFullYear(today.getFullYear() - 1);
            periodStartDate = lastYear;
            break;
          default:
            periodStartDate = startOfMonth(today);
            periodEndDate = endOfMonth(today);
        }
      }
      
      const startDateStr = format(periodStartDate, 'yyyy-MM-dd');
      const endDateStr = format(periodEndDate, 'yyyy-MM-dd');
      const periodLabel = `${format(periodStartDate, 'dd/MM/yyyy')} - ${format(periodEndDate, 'dd/MM/yyyy')}`;
      
      // 1. Relatório de Vendas
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('id, total, created_at')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', startDateStr)
        .lte('created_at', `${endDateStr}T23:59:59`);
      
      if (salesError) throw salesError;
      
      const totalSales = salesData?.reduce((acc, order) => acc + Number(order.total), 0) || 0;
      const totalOrders = salesData?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Organizar dados por dia para o gráfico mensal
      const monthlyData: { [key: string]: { date: string, sales: number, orders: number } } = {};
      
      salesData?.forEach(order => {
        const orderDate = order.created_at.split('T')[0];
        
        if (!monthlyData[orderDate]) {
          monthlyData[orderDate] = { 
            date: orderDate, 
            sales: 0, 
            orders: 0 
          };
        }
        
        monthlyData[orderDate].sales += Number(order.total);
        monthlyData[orderDate].orders += 1;
      });
      
      const formattedMonthlyData = Object.values(monthlyData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // 2. Relatório de Produtos
      const topProductsResponse = await (supabase as any)
        .rpc('get_top_products', { 
          restaurant_id_param: restaurant.id,
          limit_param: 10
        });
      
      const topProductsData = topProductsResponse.data || [];
      const topProductsError = topProductsResponse.error;
      
      // Obter estatísticas de produtos por categoria
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('order_items')
        .select(`
          id, 
          quantity, 
          total_price, 
          product:products(
            category_id,
            category:categories(name)
          )
        `)
        .eq('product.restaurant_id', restaurant.id)
        .gte('created_at', startDateStr)
        .lte('created_at', `${endDateStr}T23:59:59`);
      
      if (categoriesError) throw categoriesError;
      
      const categoriesMap: { [key: string]: { 
        category: string, 
        quantity: number, 
        revenue: number,
        formattedRevenue: string
      } } = {};
      
      categoriesData?.forEach(item => {
        if (!item.product?.[0]?.category?.[0]) return;
        
        const categoryName = item.product[0].category[0].name || 'Sem categoria';
        
        if (!categoriesMap[categoryName]) {
          categoriesMap[categoryName] = { 
            category: categoryName, 
            quantity: 0, 
            revenue: 0,
            formattedRevenue: formatCurrency(0)
          };
        }
        
        categoriesMap[categoryName].quantity += item.quantity;
        categoriesMap[categoryName].revenue += Number(item.total_price);
        categoriesMap[categoryName].formattedRevenue = formatCurrency(categoriesMap[categoryName].revenue);
      });
      
      // Calcular quantidade total de produtos vendidos
      const totalProductsSold = categoriesData?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      
      // 3. Relatório de Clientes
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (customersError) throw customersError;
      
      const totalCustomers = customersData?.length || 0;
      
      // Obter novos clientes no período
      const { data: newCustomersData, error: newCustomersError } = await supabase
        .from('customers')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', startDateStr)
        .lte('created_at', `${endDateStr}T23:59:59`);
        
      if (newCustomersError) throw newCustomersError;
      
      const newCustomers = newCustomersData?.length || 0;
      const returningCustomers = Math.max(0, totalCustomers - newCustomers);
      
      // Obter top clientes por valor gasto
      const { data: topCustomersData, error: topCustomersError } = await supabase
        .from('customers')
        .select('id, name, total_orders, total_spent')
        .eq('restaurant_id', restaurant.id)
        .order('total_spent', { ascending: false })
        .limit(10);
        
      if (topCustomersError) throw topCustomersError;
      
      // Atualizar estado com todos os dados
      setReportData({
        salesReport: {
          totalSales,
          formattedTotalSales: formatCurrency(totalSales),
          averageOrderValue,
          totalOrders,
          period: periodLabel,
          monthlyData: formattedMonthlyData
        },
        productsReport: {
          totalProductsSold,
          bestSellingProducts: topProductsData.map((product: any) => ({
            id: product.id,
            name: product.name,
            quantity: Number(product.total_quantity) || 0,
            revenue: Number(product.total_revenue) || 0,
            formattedRevenue: formatCurrency(product.total_revenue || 0)
          })),
          categoriesBreakdown: Object.values(categoriesMap)
        },
        customersReport: {
          totalCustomers,
          newCustomers,
          returningCustomers,
          topCustomers: topCustomersData?.map(customer => ({
            id: customer.id,
            name: customer.name,
            totalOrders: customer.total_orders || 0,
            totalSpent: customer.total_spent || 0,
            formattedTotalSpent: formatCurrency(customer.total_spent || 0)
          })) || []
        }
      });
    } catch (error) {
      console.error('Erro ao buscar dados dos relatórios:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Effect para carregar dados iniciais
  useEffect(() => {
    if (restaurant) {
      fetchReportsData();
    }
  }, [restaurant, period, startDate, endDate]);
  
  return { reportData, loading };
} 