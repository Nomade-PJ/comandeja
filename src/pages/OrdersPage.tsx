import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { OrderStatus, Order } from '@/lib/models';
import { Search, Filter } from 'lucide-react';
import OrderCard from '@/components/OrderCard';
import { useIsMobile } from '@/hooks/use-mobile';

const OrdersPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { orders, updateOrderStatus } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(!isMobile);

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    // Filtro de texto (número do pedido, nome do cliente, telefone)
    const textMatch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerPhone || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de status
    const statusMatch = statusFilter === 'all' ? true : order.status === statusFilter;
    
    // Filtro de data
    let dateMatch = true;
    const orderDate = new Date(order.created_at);
    const now = new Date();
    
    if (dateFilter === 'today') {
      dateMatch = orderDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      dateMatch = orderDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      dateMatch = orderDate >= monthAgo;
    }
    
    return textMatch && statusMatch && dateMatch;
  });

  // Atualizar status do pedido
  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  return (
    <DashboardLayout title="Pedidos">
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Gerenciar Pedidos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os pedidos do seu restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Barra de busca */}
            <div className="flex items-center w-full relative">
              <Input
                type="text"
                placeholder="Buscar pedido..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 h-5 w-5 text-gray-500" />
            </div>
            
            {/* Toggle para filtros em mobile */}
            {isMobile && (
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)} 
                className="flex items-center justify-center w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
            )}
            
            {/* Área de filtros */}
            {showFilters && (
              <div className="flex flex-col md:flex-row gap-3">
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="preparing">Preparando</SelectItem>
                    <SelectItem value="ready">Pronto</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select onValueChange={setDateFilter} value={dateFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as datas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full md:w-auto"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Resultados filtrados */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusChange={handleStatusChange}
              expanded={true}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              <p>Nenhum pedido encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
