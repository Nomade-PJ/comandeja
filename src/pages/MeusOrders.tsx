import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { CustomerBottomNav } from "@/components/restaurant/CustomerBottomNav";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const MeusOrders = () => {
  const { orders, loading, error } = useCustomerOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurantSlug, setRestaurantSlug] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    
    // Se tiver pedidos, pegar o slug do restaurante do primeiro pedido para o menu inferior
    if (orders && orders.length > 0 && orders[0].restaurant_id) {
      // Aqui precisamos buscar o slug do restaurante
      const fetchRestaurantSlug = async () => {
        const { data } = await supabase
          .from('restaurants')
          .select('slug')
          .eq('id', orders[0].restaurant_id)
          .single();
        
        if (data) {
          setRestaurantSlug(data.slug);
        }
      };
      
      fetchRestaurantSlug();
    }
  }, [user, orders]);

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: 'Recebido', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'preparing': { label: 'Em Preparo', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'delivering': { label: 'Em Entrega', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      'delivered': { label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200' },
      'canceled': { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const statusInfo = statusMap[status] || { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    
    return (
      <Badge className={`${statusInfo.color} border`}>
        {statusInfo.label}
      </Badge>
    );
  };

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

  if (error) {
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
            <p className="text-red-500">Erro ao carregar pedidos. Por favor, tente novamente mais tarde.</p>
          </CardContent>
        </Card>
        {restaurantSlug && <CustomerBottomNav restaurantSlug={restaurantSlug} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum pedido encontrado</h3>
              <p className="text-gray-500 text-center mb-4">
                Você ainda não fez nenhum pedido.
              </p>
              <Button onClick={() => navigate("/")}>
                Explorar Restaurantes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Pedido #{order.order_number || order.id.substring(0, 8)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{order.restaurants?.name || "Restaurante"}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {order.delivery_time ? `${order.delivery_time} min` : "Tempo estimado indisponível"}
                        </span>
                      </div>
                      <p className="font-medium text-green-600 mt-2">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <Link to={`/rastrear-pedido/${order.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center">
                        Detalhes
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {restaurantSlug && <CustomerBottomNav restaurantSlug={restaurantSlug} />}
    </div>
  );
};

export default MeusOrders; 