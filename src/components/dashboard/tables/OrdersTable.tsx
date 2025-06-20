import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown, Eye, MoreVertical } from "lucide-react";
import { OrderWithItems } from "@/hooks/useOrders";
import OrderDetailsModal from "../modals/OrderDetailsModal";

interface OrdersTableProps {
  orders: OrderWithItems[];
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

const getStatusDisplay = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };
};

const OrdersTable = ({ orders, onUpdateStatus }: OrdersTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Função para abrir o modal de detalhes do pedido
  const handleViewDetails = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Função para atualizar o status do pedido
  const handleUpdateStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled') => {
    await onUpdateStatus(orderId, newStatus);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum pedido encontrado</p>
        <p className="text-gray-400 text-sm mt-2">Os pedidos aparecerão aqui quando forem realizados</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = getStatusDisplay(order.status);
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.customer_name}</span>
                      {order.customer_phone && (
                        <span className="text-xs text-gray-500">{order.customer_phone}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${status.color}`}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                          {order.status !== 'confirmed' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'confirmed')}>
                              <Badge variant="outline" className={statusConfig.confirmed.color + " mr-2"}>
                                Confirmado
                              </Badge>
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'preparing' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                              <Badge variant="outline" className={statusConfig.preparing.color + " mr-2"}>
                                Preparando
                              </Badge>
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'ready' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'ready')}>
                              <Badge variant="outline" className={statusConfig.ready.color + " mr-2"}>
                                Pronto
                              </Badge>
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'out_for_delivery' && order.delivery_method === 'delivery' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}>
                              <Badge variant="outline" className={statusConfig.out_for_delivery.color + " mr-2"}>
                                Em rota
                              </Badge>
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'delivered' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                              <Badge variant="outline" className={statusConfig.delivered.color + " mr-2"}>
                                Entregue
                              </Badge>
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'cancelled' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
                              <Badge variant="outline" className={statusConfig.cancelled.color + " mr-2"}>
                                Cancelado
                              </Badge>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          open={showDetailsModal} 
          onOpenChange={setShowDetailsModal} 
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </>
  );
};

export default OrdersTable; 