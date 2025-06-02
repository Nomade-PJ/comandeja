
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MapPin, Check } from 'lucide-react';

// Mock order data - in real app would come from API
const mockOrder = {
  id: 'ord-1234',
  restaurantName: 'Burger Palace',
  status: 'preparing',
  statusHistory: [
    { status: 'pending', time: '10:30', completed: true },
    { status: 'confirmed', time: '10:32', completed: true },
    { status: 'preparing', time: '10:35', completed: true },
    { status: 'ready', time: '10:50', completed: false },
    { status: 'out_for_delivery', time: '11:00', completed: false },
    { status: 'delivered', time: '11:15', completed: false },
  ],
  items: [
    { name: 'Classic Burger', quantity: 2, price: 12.99 },
    { name: 'Fries', quantity: 1, price: 5.99 },
    { name: 'Coca-Cola', quantity: 2, price: 2.99 }
  ],
  subtotal: 37.95,
  deliveryFee: 5.00,
  total: 42.95,
  address: 'Rua das Flores, 123, Apto 45 - São Paulo/SP',
  estimatedDelivery: '11:15'
};

// Helper to get percentage completion based on status
const getProgressPercentage = (statusHistory: any[]) => {
  const totalSteps = statusHistory.length;
  const completedSteps = statusHistory.filter(step => step.completed).length;
  return Math.round((completedSteps / totalSteps) * 100);
};

const getStatusLabel = (status: string) => {
  switch(status) {
    case 'pending': return 'Aguardando confirmação';
    case 'confirmed': return 'Confirmado';
    case 'preparing': return 'Em preparação';
    case 'ready': return 'Pronto para entrega';
    case 'out_for_delivery': return 'Saiu para entrega';
    case 'delivered': return 'Entregue';
    default: return 'Desconhecido';
  }
};

const getStatusVariant = (status: string, completed: boolean) => {
  if (completed) return 'success';
  return 'secondary';
};

const CustomerOrderTracking = () => {
  const { orderId, restaurantSlug } = useParams<{ orderId: string; restaurantSlug: string }>();
  const [order, setOrder] = useState<any>(mockOrder);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // In real app, would fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        // In real app, would set order from API response
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Erro ao buscar detalhes do pedido",
          description: "Não foi possível carregar os detalhes. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p>Carregando detalhes do pedido...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/r/${restaurantSlug}`}>
                  <ArrowLeft className="h-4 w-4 mr-2 inline" />
                  Voltar ao menu
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/r/${restaurantSlug}/pedidos`}>Meus Pedidos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Pedido #{order.id.split('-')[1]}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Status do Pedido</span>
                  <Badge variant="outline" className="ml-2">
                    #{order.id.split('-')[1]}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Acompanhe o status do seu pedido em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Progress value={getProgressPercentage(order.statusHistory)} className="h-2" />
                </div>
                
                <div className="space-y-4">
                  {order.statusHistory.map((step: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                                       ${step.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {step.completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="ml-3 flex-grow">
                        <div className="flex justify-between items-center">
                          <p className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                            {getStatusLabel(step.status)}
                          </p>
                          <span className="text-sm text-gray-500">{step.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Endereço de entrega</p>
                      <p className="text-gray-600">{order.address}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        Tempo estimado de entrega: <span className="font-medium">{order.estimatedDelivery}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
                <CardDescription>
                  Detalhes dos itens e valores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between pb-2 border-b">
                      <div>
                        <p>{item.quantity}x {item.name}</p>
                      </div>
                      <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>R$ {order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de entrega</span>
                      <span>R$ {order.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2">
                      <span>Total</span>
                      <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    Suporte ao cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderTracking;
