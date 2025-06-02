
import React from 'react';
import { Order } from '@/lib/models';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  expanded?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, expanded = false }) => {
  // Funções auxiliares para formatação de data
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
  };
  
  // Obtém a cor da badge com base no status
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determina o próximo status com base no status atual
  const getNextStatus = (status: Order['status']): Order['status'] | null => {
    switch (status) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return order.delivery_method === 'delivery' ? 'delivered' : null;
      default:
        return null;
    }
  };

  // Obter informações sobre o próximo status
  const nextStatus = getNextStatus(order.status);
  const nextStatusLabel = nextStatus ? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1) : null;

  // Dados para compatibilidade
  const createdAt = order.created_at;
  const customerName = order.customerName || 'Cliente';
  const customerPhone = order.customerPhone || '';
  const deliveryType = order.delivery_method;
  const items = order.items || [];
  const customerAddress = order.delivery_address;
  const totalAmount = order.total;
  
  return (
    <Card className={`mb-4 ${
      order.status === 'pending' ? 'border-yellow-400' : 
      order.status === 'confirmed' ? 'border-blue-400' : 
      order.status === 'preparing' ? 'border-purple-400' : 
      order.status === 'ready' ? 'border-green-400' : 
      order.status === 'delivered' ? 'border-gray-400' : 
      'border-red-400'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            Order #{order.order_number || order.id.substring(0, 8)}
            <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </CardTitle>
          <div className="text-sm text-gray-500">
            {formatTime(createdAt)} - {formatDate(createdAt)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">{customerName}</p>
            <p className="text-sm text-gray-600">{customerPhone}</p>
          </div>
          <Badge variant="outline">
            {deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
          </Badge>
        </div>

        {expanded && items && items.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Itens:</p>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                    {item.notes && <p className="text-xs text-gray-500">Obs: {item.notes}</p>}
                  </div>
                  <div>R$ {(item.unit_price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            {order.notes && (
              <div className="mt-3 text-sm">
                <p className="font-medium">Observações:</p>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
            
            {customerAddress && deliveryType === 'delivery' && (
              <div className="mt-3 text-sm">
                <p className="font-medium">Endereço de entrega:</p>
                <p className="text-gray-600">{customerAddress}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="font-bold">
            Total: R$ {totalAmount.toFixed(2)}
          </div>
          <div className="text-sm">
            {items && items.length > 0 ? `${items.reduce((total, item) => total + item.quantity, 0)} itens` : '0 itens'}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onStatusChange(order.id, 'canceled')}
          disabled={['delivered', 'canceled'].includes(order.status)}
        >
          Cancelar
        </Button>
        
        {nextStatus && (
          <Button 
            variant="default"
            size="sm"
            onClick={() => onStatusChange(order.id, nextStatus)}
          >
            Marcar como {nextStatusLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
