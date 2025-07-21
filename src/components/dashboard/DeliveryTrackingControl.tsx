import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';
import { MapPin, Navigation, Truck, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DeliveryTrackingControlProps {
  orderId: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  onStatusChange?: (status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled') => void;
}

const DeliveryTrackingControl = ({
  orderId,
  deliveryPersonId,
  deliveryPersonName,
  onStatusChange
}: DeliveryTrackingControlProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'>('out_for_delivery');
  const { toast } = useToast();
  
  const {
    trackingInfo,
    loading,
    error,
    startTracking,
    updateLocation,
    updateStatus,
    finishTracking,
    getCurrentPosition,
    startAutoTracking
  } = useDeliveryTracking({ orderId, isDeliveryPerson: true });

  // Iniciar rastreamento quando o componente carregar
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // Obter a posição atual
        const position = await getCurrentPosition();
        
        // Iniciar o rastreamento
        await startTracking({
          order_id: orderId,
          delivery_person_id: deliveryPersonId,
          delivery_person_name: deliveryPersonName,
          current_latitude: position.latitude,
          current_longitude: position.longitude,
          status: 'out_for_delivery'
        });
        
        setIsTracking(true);
        setCurrentStatus('out_for_delivery');
        
        if (onStatusChange) {
          onStatusChange('out_for_delivery');
        }
        
        toast({
          title: "Rastreamento iniciado",
          description: "Sua localização está sendo compartilhada com o cliente.",
        });
      } catch (err) {
        console.error('Erro ao iniciar rastreamento:', err);
        toast({
          title: "Erro ao iniciar rastreamento",
          description: "Verifique se o acesso à sua localização está permitido.",
          variant: "destructive"
        });
      }
    };

    if (orderId && deliveryPersonId && !trackingInfo) {
      initializeTracking();
    }
  }, [orderId, deliveryPersonId, deliveryPersonName, trackingInfo]);

  // Iniciar rastreamento automático quando o trackingInfo estiver disponível
  useEffect(() => {
    if (!trackingInfo || !isTracking) return;
    
    // Iniciar rastreamento automático a cada 15 segundos
    const stopAutoTracking = startAutoTracking(15);
    
    return () => {
      stopAutoTracking();
    };
  }, [trackingInfo, isTracking, startAutoTracking]);

  // Manipulador para atualizar o status
  const handleUpdateStatus = async (status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled') => {
    try {
      const success = await updateStatus(status);
      
      if (success) {
        setCurrentStatus(status);
        
        if (onStatusChange) {
          onStatusChange(status);
        }
        
        toast({
          title: "Status atualizado",
          description: `O status da entrega foi atualizado para ${
            status === 'delivered' ? 'Entregue' : 
            status === 'out_for_delivery' ? 'Em rota de entrega' : 
            status === 'cancelled' ? 'Cancelado' : status
          }.`,
        });
        
        // Se o status for entregue, finalizar o rastreamento
        if (status === 'delivered') {
          await finishTracking();
          setIsTracking(false);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da entrega.",
        variant: "destructive"
      });
    }
  };

  // Manipulador para atualização manual da localização
  const handleUpdateLocation = async () => {
    try {
      const position = await getCurrentPosition();
      const success = await updateLocation(position.latitude, position.longitude);
      
      if (success) {
        toast({
          title: "Localização atualizada",
          description: "Sua localização foi atualizada com sucesso.",
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar localização:', err);
      toast({
        title: "Erro ao atualizar localização",
        description: "Verifique se o acesso à sua localização está permitido.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center py-6">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-3" />
            <h3 className="text-lg font-medium mb-2">Erro no rastreamento</h3>
            <p className="text-gray-500 text-center mb-4">
              Não foi possível iniciar o rastreamento da entrega.
            </p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Truck className="h-5 w-5 mr-2 text-green-600" />
          Controle de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status atual */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge className={
              currentStatus === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
              currentStatus === 'out_for_delivery' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              currentStatus === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-gray-100 text-gray-800 border-gray-200'
            }>
              {currentStatus === 'delivered' ? 'Entregue' :
               currentStatus === 'out_for_delivery' ? 'Em rota de entrega' :
               currentStatus === 'cancelled' ? 'Cancelado' : currentStatus}
            </Badge>
          </div>

          {/* Rastreamento ativo */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Rastreamento:</span>
            <Badge className={isTracking ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
              {isTracking ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Última atualização */}
          {trackingInfo?.last_updated && (
            <div className="text-sm text-gray-500">
              Última atualização: {new Date(trackingInfo.last_updated).toLocaleTimeString()}
            </div>
          )}

          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleUpdateLocation}
              disabled={!isTracking}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Atualizar Localização
            </Button>

            {currentStatus !== 'delivered' ? (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleUpdateStatus('delivered')}
                disabled={!isTracking}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar Entrega
              </Button>
            ) : (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={true}
              >
                <Check className="h-4 w-4 mr-2" />
                Entrega Confirmada
              </Button>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-4">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Instruções</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
              <li>Seu GPS está sendo compartilhado automaticamente a cada 15 segundos</li>
              <li>Clique em "Atualizar Localização" se precisar atualizar manualmente</li>
              <li>Quando entregar o pedido, clique em "Confirmar Entrega"</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTrackingControl; 