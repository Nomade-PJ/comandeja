import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, Clock, MapPin, Phone, Check, 
  ChefHat, Truck, Package, AlertTriangle 
} from "lucide-react";
import { CustomerBottomNav } from "@/components/restaurant/CustomerBottomNav";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurantSlug, setRestaurantSlug] = useState("");
  const { getLatestOrder } = useCustomerOrders();
  const [activeOrderId, setActiveOrderId] = useState(orderId || "");
  
  // Se não tiver orderId nos parâmetros, buscar o pedido mais recente
  useEffect(() => {
    const fetchLatestOrderIfNeeded = async () => {
      if (!orderId) {
        const latestOrder = await getLatestOrder();
        if (latestOrder) {
          setActiveOrderId(latestOrder.id);
        }
      }
    };
    
    fetchLatestOrderIfNeeded();
  }, [orderId, getLatestOrder]);
  
  // Usar o hook de rastreamento com o ID do pedido ativo
  const { order, loading, error, getStatusStep, getStatusText } = useOrderTracking(activeOrderId);
  
  // Buscar o slug do restaurante para o menu inferior
  useEffect(() => {
    if (order?.restaurant_id) {
      const fetchRestaurantSlug = async () => {
        const { data } = await supabase
          .from('restaurants')
          .select('slug')
          .eq('id', order.restaurant_id)
          .single();
        
        if (data) {
          setRestaurantSlug(data.slug);
        }
      };
      
      fetchRestaurantSlug();
    }
  }, [order]);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
        {restaurantSlug && <CustomerBottomNav restaurantSlug={restaurantSlug} />}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Pedido não encontrado</h3>
              <p className="text-gray-500 text-center mb-4">
                Não foi possível encontrar informações sobre este pedido.
              </p>
              <Button onClick={() => navigate("/meus-pedidos")}>
                Ver Meus Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
        {restaurantSlug && <CustomerBottomNav restaurantSlug={restaurantSlug} />}
      </div>
    );
  }

  // Calcular o progresso do pedido (1-4)
  const statusStep = getStatusStep();
  const isCanceled = order.status === 'canceled';
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Rastreamento de Pedido</h1>
        <p className="text-gray-500 mb-6">
          Pedido #{order.order_number || order.id.substring(0, 8)}
        </p>
        
        {/* Status do pedido */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            {isCanceled ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <h4 className="font-medium text-red-800">Pedido Cancelado</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Este pedido foi cancelado. Entre em contato com o restaurante para mais informações.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{getStatusText()}</span>
                  <Badge className="bg-green-100 text-green-800 border border-green-200">
                    {order.estimated_delivery && `Entrega prevista: ${order.estimated_delivery} min`}
                  </Badge>
                </div>
                
                {/* Barra de progresso */}
                <div className="relative pt-8 pb-4">
                  {/* Linha de progresso */}
                  <div className="absolute top-12 left-0 w-full h-0.5 bg-gray-200"></div>
                  
                  {/* Etapas */}
                  <div className="flex justify-between relative z-10">
                    {/* Etapa 1: Recebido */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="text-xs mt-2 text-center">Recebido</span>
                    </div>
                    
                    {/* Etapa 2: Preparando */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <ChefHat className="h-4 w-4" />
                      </div>
                      <span className="text-xs mt-2 text-center">Preparando</span>
                    </div>
                    
                    {/* Etapa 3: Em Entrega */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <span className="text-xs mt-2 text-center">Em Entrega</span>
                    </div>
                    
                    {/* Etapa 4: Entregue */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStep >= 4 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-xs mt-2 text-center">Entregue</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Informações do restaurante */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Restaurante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {order.restaurants?.logo_url && (
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-100">
                  <img 
                    src={order.restaurants.logo_url} 
                    alt={order.restaurants?.name || "Restaurante"} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium">{order.restaurants?.name || "Restaurante"}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {order.delivery_time ? `${order.delivery_time} min` : "Tempo estimado indisponível"}
                  </span>
                </div>
              </div>
            </div>
            
            {order.restaurants?.phone && (
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => window.open(`tel:${order.restaurants.phone}`)}>
                <Phone className="h-4 w-4 mr-2" />
                Ligar para o Restaurante
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* Detalhes do pedido */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detalhes do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Itens do pedido */}
              <div>
                <h4 className="font-medium mb-2">Itens</h4>
                <div className="space-y-2">
                  {order.order_items && order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.quantity}x</span> {item.product_name}
                      </div>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
              
              {/* Endereço de entrega */}
              {order.delivery_address && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Endereço de Entrega</h4>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <p className="text-gray-700">{order.delivery_address}</p>
                  </div>
                </div>
              )}
              
              {/* Data e hora do pedido */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Data e Hora</h4>
                <p className="text-gray-700">
                  {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              
              {/* Método de pagamento */}
              {order.payment_method && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Pagamento</h4>
                  <p className="text-gray-700">
                    {order.payment_method === 'credit_card' ? 'Cartão de Crédito' : 
                     order.payment_method === 'debit_card' ? 'Cartão de Débito' : 
                     order.payment_method === 'cash' ? 'Dinheiro' : 
                     order.payment_method === 'pix' ? 'PIX' : 
                     'Método de pagamento não especificado'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {restaurantSlug && <CustomerBottomNav restaurantSlug={restaurantSlug} />}
    </div>
  );
};

export default OrderTracking; 