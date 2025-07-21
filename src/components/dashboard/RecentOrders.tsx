import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const RecentOrders = () => {
  const { stats, loading } = useDashboardStats();

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  // Função para determinar a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Função para traduzir o status
  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "confirmed":
        return "Confirmado";
      case "preparing":
        return "Em preparo";
      case "ready":
        return "Pronto";
      case "out_for_delivery":
        return "Em entrega";
      case "delivered":
        return "Entregue";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
        <CardDescription>
          Os últimos pedidos recebidos pelo seu restaurante
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium"><Skeleton className="h-4 w-16" /></th>
                  <th className="text-left py-3 px-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                  <th className="text-left py-3 px-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                  <th className="text-left py-3 px-4 font-medium"><Skeleton className="h-4 w-16" /></th>
                  <th className="text-right py-3 px-4 font-medium"><Skeleton className="h-4 w-16 ml-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{order.order_number}</td>
                    <td className="py-3 px-4 text-sm">{order.customer_name}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(order.status)}>
                        {translateStatus(order.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-right">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Nenhum pedido recebido ainda
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
