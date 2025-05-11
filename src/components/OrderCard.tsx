
import React from 'react';
import { Order } from '@/contexts/RestaurantContext';
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (status: Order['status']): Order['status'] | null => {
    switch (status) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return order.deliveryType === 'delivery' ? 'delivered' : null;
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const nextStatusLabel = nextStatus ? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1) : null;

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
            Order #{order.id.split('-')[1]}
            <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </CardTitle>
          <div className="text-sm text-gray-500">
            {formatTime(order.createdAt)} - {formatDate(order.createdAt)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.customerPhone}</p>
          </div>
          <Badge variant="outline">
            {order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
          </Badge>
        </div>

        {expanded && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Items:</p>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.product.name}
                    {item.notes && <p className="text-xs text-gray-500">Note: {item.notes}</p>}
                  </div>
                  <div>R$ {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            {order.notes && (
              <div className="mt-3 text-sm">
                <p className="font-medium">Order Notes:</p>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
            
            {order.customerAddress && order.deliveryType === 'delivery' && (
              <div className="mt-3 text-sm">
                <p className="font-medium">Delivery Address:</p>
                <p className="text-gray-600">{order.customerAddress}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="font-bold">
            Total: R$ {order.totalAmount.toFixed(2)}
          </div>
          <div className="text-sm">
            {order.items.reduce((total, item) => total + item.quantity, 0)} items
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onStatusChange(order.id, 'cancelled')}
          disabled={['delivered', 'cancelled'].includes(order.status)}
        >
          Cancel
        </Button>
        
        {nextStatus && (
          <Button 
            variant="default"
            size="sm"
            onClick={() => onStatusChange(order.id, nextStatus)}
          >
            Mark as {nextStatusLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
