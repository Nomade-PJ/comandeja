import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, Clock, MapPin, Phone, Check, 
  ChefHat, Truck, Package, AlertTriangle, Navigation 
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [restaurantMarker, setRestaurantMarker] = useState<google.maps.Marker | null>(null);
  const [customerMarker, setCustomerMarker] = useState<google.maps.Marker | null>(null);
  
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
  const { order, loading: orderLoading, error: orderError, getStatusStep, getStatusText } = useOrderTracking(activeOrderId);
  
  // Usar o hook de rastreamento de entrega
  const { 
    trackingInfo, 
    loading: trackingLoading, 
    error: trackingError
  } = useDeliveryTracking({ orderId: activeOrderId });
  
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

  // Carregar a API do Google Maps
  useEffect(() => {
    if (window.google?.maps || mapLoaded) return;

    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [mapLoaded]);

  // Inicializar o mapa quando os dados estiverem disponíveis
  useEffect(() => {
    if (!mapLoaded || !window.google?.maps || !order || !trackingInfo || orderLoading || trackingLoading) return;

    // Coordenadas do entregador (ou padrão se não disponível)
    const deliveryPosition = {
      lat: trackingInfo.current_latitude || -23.550520,
      lng: trackingInfo.current_longitude || -46.633308
    };

    // Coordenadas do restaurante (ou padrão se não disponível)
    const restaurantPosition = {
      lat: order.restaurants?.latitude || -23.550520,
      lng: order.restaurants?.longitude || -46.633308
    };

    // Coordenadas do cliente (ou padrão se não disponível)
    const customerPosition = {
      lat: order.delivery_latitude || -23.550520,
      lng: order.delivery_longitude || -46.633308
    };

    // Inicializar o mapa
    if (!map) {
      const mapInstance = new google.maps.Map(document.getElementById("delivery-map") as HTMLElement, {
        center: deliveryPosition,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      setMap(mapInstance);

      // Adicionar marcador do entregador
      const deliveryMarker = new google.maps.Marker({
        position: deliveryPosition,
        map: mapInstance,
        title: "Entregador",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new google.maps.Size(40, 40)
        }
      });
      setMarker(deliveryMarker);

      // Adicionar marcador do restaurante
      const restMarker = new google.maps.Marker({
        position: restaurantPosition,
        map: mapInstance,
        title: order.restaurants?.name || "Restaurante",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new google.maps.Size(40, 40)
        }
      });
      setRestaurantMarker(restMarker);

      // Adicionar marcador do cliente
      const custMarker = new google.maps.Marker({
        position: customerPosition,
        map: mapInstance,
        title: "Seu endereço",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new google.maps.Size(40, 40)
        }
      });
      setCustomerMarker(custMarker);

      // Desenhar rota
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4CAF50",
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      });
      directionsRenderer.setMap(mapInstance);

      // Calcular rota do restaurante até o cliente
      directionsService.route(
        {
          origin: restaurantPosition,
          destination: customerPosition,
          waypoints: [{ location: deliveryPosition, stopover: true }],
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    } else {
      // Atualizar posição do entregador
      marker?.setPosition(deliveryPosition);
      
      // Centralizar o mapa na posição do entregador
      map.panTo(deliveryPosition);
    }
  }, [mapLoaded, order, trackingInfo, orderLoading, trackingLoading, map, marker]);

  // Atualizar a posição do entregador quando o trackingInfo mudar
  useEffect(() => {
    if (!map || !marker || !trackingInfo?.current_latitude || !trackingInfo?.current_longitude) return;
    
    const newPosition = {
      lat: trackingInfo.current_latitude,
      lng: trackingInfo.current_longitude
    };
    
    marker.setPosition(newPosition);
  }, [trackingInfo, map, marker]);

  if (orderLoading || trackingLoading) {
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

  if (orderError || !order) {
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
                    {order.estimated_delivery_time && `Entrega prevista: ${order.estimated_delivery_time} min`}
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

        {/* Mapa de rastreamento - Novo componente */}
        {!isCanceled && statusStep >= 3 && statusStep < 4 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Rastreamento em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trackingInfo ? (
                <>
                  <div 
                    id="delivery-map" 
                    className="w-full h-64 rounded-md overflow-hidden mb-3"
                    style={{ border: "1px solid #e2e8f0" }}
                  ></div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Entregador</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Restaurante</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Seu endereço</span>
                    </div>
                  </div>

                  {trackingInfo.estimated_arrival_time && (
                    <div className="mt-4 bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Tempo estimado de chegada
                          </p>
                          <p className="text-sm text-green-700">
                            {format(new Date(trackingInfo.estimated_arrival_time), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {trackingInfo.delivery_person_name && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <Navigation className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{trackingInfo.delivery_person_name}</p>
                          <p className="text-sm text-gray-500">Entregador</p>
                        </div>
                      </div>
                      {order.restaurants?.phone && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(`tel:${order.restaurants.phone}`)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Ligar
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertTriangle className="h-10 w-10 text-yellow-500 mb-3" />
                  <p className="text-center text-gray-500">
                    Informações de rastreamento não disponíveis no momento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
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
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x </span>
                        <span>{item.product_name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Linha divisória */}
              <div className="border-t border-gray-200 my-3"></div>
              
              {/* Resumo de valores */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                
                {order.delivery_fee !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de entrega</span>
                    <span>{formatCurrency(order.delivery_fee || 0)}</span>
                  </div>
                )}
                
                {order.discount_amount !== null && order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desconto</span>
                    <span className="text-green-600">-{formatCurrency(order.discount_amount || 0)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
              
              {/* Informações adicionais */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div>
                  <h4 className="font-medium mb-1">Método de entrega</h4>
                  <p className="text-gray-600">
                    {order.delivery_method === 'delivery' ? 'Entrega' : 'Retirada'}
                  </p>
                </div>
                
                {order.delivery_method === 'delivery' && order.delivery_address && (
                  <div>
                    <h4 className="font-medium mb-1">Endereço de entrega</h4>
                    <p className="text-gray-600">
                      {order.delivery_address}
                      {order.delivery_city && `, ${order.delivery_city}`}
                      {order.delivery_state && ` - ${order.delivery_state}`}
                      {order.delivery_zip_code && `, ${order.delivery_zip_code}`}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-1">Forma de pagamento</h4>
                  <p className="text-gray-600">
                    {order.payment_method === 'credit_card' ? 'Cartão de Crédito' :
                     order.payment_method === 'debit_card' ? 'Cartão de Débito' :
                     order.payment_method === 'pix' ? 'PIX' :
                     order.payment_method === 'cash' ? 'Dinheiro' :
                     order.payment_method === 'voucher' ? 'Vale-Refeição' :
                     'Não especificado'}
                  </p>
                </div>
                
                {order.notes && (
                  <div>
                    <h4 className="font-medium mb-1">Observações</h4>
                    <p className="text-gray-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {restaurantSlug && <CustomerBottomNav restaurantSlug={restaurantSlug} />}
    </div>
  );
};

export default OrderTracking; 