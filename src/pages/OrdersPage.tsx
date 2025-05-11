
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRestaurant, Order, OrderStatus } from '@/contexts/RestaurantContext';
import OrderCard from '@/components/OrderCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const OrdersPage = () => {
  const { orders, updateOrderStatus } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Status filter state
  const [selectedTab, setSelectedTab] = useState<'all' | OrderStatus>('all');
  
  // Filter by status and search
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (selectedTab !== 'all' && order.status !== selectedTab) {
      return false;
    }
    
    // Search filter (search by customer name, order ID, or phone)
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        order.customerName.toLowerCase().includes(searchTermLower) ||
        order.id.toLowerCase().includes(searchTermLower) ||
        order.customerPhone.toLowerCase().includes(searchTermLower)
      );
    }
    
    return true;
  });
  
  // Sort by newest first
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Count orders by status
  const orderCounts = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, { all: 0 });
  
  // Handle order status change
  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };
  
  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  // Traduzir status de pedidos
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'all': 'Todos',
      'pending': 'Pendentes',
      'confirmed': 'Confirmados',
      'preparing': 'Preparando',
      'ready': 'Prontos',
      'delivered': 'Entregues',
      'cancelled': 'Cancelados'
    };
    return statusMap[status] || status;
  };
  
  return (
    <DashboardLayout title="Pedidos">
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="w-full md:w-1/2">
              <Input
                placeholder="Buscar por nome do cliente, telefone ou ID do pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Tabs 
          value={selectedTab} 
          onValueChange={(value) => setSelectedTab(value as 'all' | OrderStatus)}
          className="w-full"
        >
          <div className="px-4 border-b">
            <TabsList className="grid grid-flow-col auto-cols-fr">
              <TabsTrigger value="all">
                Todos
                <Badge variant="outline" className="ml-2">
                  {orderCounts.all || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes
                <Badge variant="outline" className="ml-2">
                  {orderCounts.pending || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmados
                <Badge variant="outline" className="ml-2">
                  {orderCounts.confirmed || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="preparing">
                Preparando
                <Badge variant="outline" className="ml-2">
                  {orderCounts.preparing || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ready">
                Prontos
                <Badge variant="outline" className="ml-2">
                  {orderCounts.ready || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Entregues
                <Badge variant="outline" className="ml-2">
                  {orderCounts.delivered || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelados
                <Badge variant="outline" className="ml-2">
                  {orderCounts.cancelled || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="p-0">
            <OrdersList 
              orders={sortedOrders}
              expandedOrderId={expandedOrderId}
              onToggleExpansion={toggleOrderExpansion}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="p-0">
            <OrdersList 
              orders={sortedOrders}
              expandedOrderId={expandedOrderId}
              onToggleExpansion={toggleOrderExpansion}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="confirmed" className="p-0">
            <OrdersList 
              orders={sortedOrders}
              expandedOrderId={expandedOrderId}
              onToggleExpansion={toggleOrderExpansion}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="preparing" className="p-0">
            <OrdersList 
              orders={sortedOrders}
              expandedOrderId={expandedOrderId}
              onToggleExpansion={toggleOrderExpansion}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="ready" className="p-0">
            <OrdersList 
              orders={sortedOrders}
              expandedOrderId={expandedOrderId}
              onToggleExpansion={toggleOrderExpansion}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="delivered" className="p-0">
            <OrdersList 
              orders={sortedOrders}
              expandedOrderId={expandedOrderId}
              onToggleExpansion={toggleOrderExpansion}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="cancelled" className="p-0">
            <OrdersList 
              orders={sortedOrders}
              expandedOrderId={expandedOrderId}
              onToggleExpansion={toggleOrderExpansion}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

interface OrdersListProps {
  orders: Order[];
  expandedOrderId: string | null;
  onToggleExpansion: (orderId: string) => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ 
  orders, 
  expandedOrderId, 
  onToggleExpansion, 
  onStatusChange 
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum pedido corresponde aos seus filtros.</p>
      </div>
    );
  }
  
  return (
    <div className="divide-y">
      {orders.map((order) => (
        <div key={order.id} className="p-4">
          <div onClick={() => onToggleExpansion(order.id)} className="cursor-pointer">
            <OrderCard 
              order={order} 
              onStatusChange={onStatusChange} 
              expanded={order.id === expandedOrderId}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
