import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderWithItems } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";
import DeliveryTrackingControl from "@/components/dashboard/DeliveryTrackingControl";

interface OrderDetailsModalProps {
  order: OrderWithItems;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (orderId: string, status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled') => Promise<boolean>;
}

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800 border-blue-200" },
  preparing: { label: "Preparando", color: "bg-purple-100 text-purple-800 border-purple-200" },
  ready: { label: "Pronto", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  out_for_delivery: { label: "Em rota", color: "bg-orange-100 text-orange-800 border-orange-200" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200" },
};

const OrderDetailsModal = ({ order, open, onOpenChange, onUpdateStatus }: OrderDetailsModalProps) => {
  const status = statusConfig[order.status as keyof typeof statusConfig] || { label: order.status, color: "bg-gray-100 text-gray-800 border-gray-200" };
  const [showTrackingControls, setShowTrackingControls] = useState(false);
  const { user } = useAuth();
  
  // Função para atualizar o status do pedido
  const handleUpdateStatus = async (newStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled') => {
    const success = await onUpdateStatus(order.id, newStatus);
    
    // Se o pedido for colocado em rota de entrega, mostrar os controles de rastreamento
    if (success && newStatus === 'out_for_delivery') {
      setShowTrackingControls(true);
    }
    
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido #{order.order_number}</span>
            <Badge variant="outline" className={`${status.color}`}>
              {status.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {format(new Date(order.created_at), "dd 'de' MMMM', às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Informações do Cliente */}
          <div>
            <h4 className="text-sm font-medium mb-2">Informações do Cliente</h4>
            <div className="bg-muted rounded-md p-3 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium">Nome:</span>
                <span className="text-sm">{order.customer_name}</span>
              </div>
              {order.customer_phone && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm font-medium">Telefone:</span>
                  <span className="text-sm">{order.customer_phone}</span>
                </div>
              )}
              {order.customer_email && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{order.customer_email}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Detalhes do Pedido */}
          <div>
            <h4 className="text-sm font-medium mb-2">Detalhes do Pedido</h4>
            <div className="bg-muted rounded-md p-3 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium">Método de entrega:</span>
                <span className="text-sm">
                  {order.delivery_method === 'delivery' ? 'Entrega' : 'Retirada'}
                </span>
              </div>
              {order.delivery_method === 'delivery' && order.delivery_address && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm font-medium">Endereço:</span>
                  <span className="text-sm">{order.delivery_address}</span>
                </div>
              )}
              {order.delivery_method === 'delivery' && (order.delivery_latitude || order.delivery_longitude) && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm font-medium">Coordenadas:</span>
                  <span className="text-sm flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                    {order.delivery_latitude?.toFixed(6)}, {order.delivery_longitude?.toFixed(6)}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium">Forma de pagamento:</span>
                <span className="text-sm">
                  {order.payment_method === 'credit_card' && 'Cartão de crédito'}
                  {order.payment_method === 'debit_card' && 'Cartão de débito'}
                  {order.payment_method === 'pix' && 'PIX'}
                  {order.payment_method === 'cash' && 'Dinheiro'}
                  {order.payment_method === 'voucher' && 'Vale'}
                  {!order.payment_method && 'Não informado'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm font-medium">Status de pagamento:</span>
                <span className="text-sm">
                  {order.payment_status === 'paid' && 'Pago'}
                  {order.payment_status === 'pending' && 'Pendente'}
                  {order.payment_status === 'failed' && 'Falhou'}
                  {order.payment_status === 'refunded' && 'Reembolsado'}
                </span>
              </div>
              {order.notes && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm font-medium">Observações:</span>
                  <span className="text-sm">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h4 className="text-sm font-medium mb-2">Itens do Pedido</h4>
            <div className="border rounded-md divide-y">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted-foreground text-sm">
                  Nenhum item encontrado
                </div>
              )}
            </div>
          </div>
          
          {/* Resumo de valores */}
          <div>
            <div className="border-t pt-4">
              <div className="flex justify-between py-1">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm">Taxa de entrega</span>
                <span className="text-sm font-medium">{formatCurrency(order.delivery_fee)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-sm">Desconto</span>
                  <span className="text-sm font-medium">- {formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
          
          {/* Controle de Rastreamento - Mostrado apenas quando o pedido estiver em rota de entrega */}
          {order.status === 'out_for_delivery' && order.delivery_method === 'delivery' && (
            <>
              <Separator />
              
              {showTrackingControls ? (
                <DeliveryTrackingControl 
                  orderId={order.id} 
                  deliveryPersonId={user?.id || ''} 
                  deliveryPersonName={user?.user_metadata?.full_name || 'Entregador'}
                  onStatusChange={(status) => {
                    if (status === 'delivered') {
                      handleUpdateStatus('delivered');
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center py-4">
                  <Button 
                    onClick={() => setShowTrackingControls(true)}
                    className="flex items-center"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Iniciar Rastreamento de Entrega
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Inicie o rastreamento para compartilhar sua localização com o cliente
                  </p>
                </div>
              )}
            </>
          )}
          
          <Separator />
          
          {/* Atualizar status */}
          <div>
            <h4 className="text-sm font-medium mb-2">Atualizar Status</h4>
            <div className="flex flex-wrap gap-2">
              {order.status !== 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUpdateStatus('pending')}
                  className={statusConfig.pending.color}
                >
                  Pendente
                </Button>
              )}
              {order.status !== 'confirmed' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUpdateStatus('confirmed')}
                  className={statusConfig.confirmed.color}
                >
                  Confirmado
                </Button>
              )}
              {order.status !== 'preparing' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUpdateStatus('preparing')}
                  className={statusConfig.preparing.color}
                >
                  Preparando
                </Button>
              )}
              {order.status !== 'ready' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUpdateStatus('ready')}
                  className={statusConfig.ready.color}
                >
                  Pronto
                </Button>
              )}
              {order.status !== 'out_for_delivery' && order.delivery_method === 'delivery' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUpdateStatus('out_for_delivery')}
                  className={statusConfig.out_for_delivery.color}
                >
                  Em rota
                </Button>
              )}
              {order.status !== 'delivered' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUpdateStatus('delivered')}
                  className={statusConfig.delivered.color}
                >
                  Entregue
                </Button>
              )}
              {order.status !== 'cancelled' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUpdateStatus('cancelled')}
                  className={statusConfig.cancelled.color}
                >
                  Cancelado
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal; 