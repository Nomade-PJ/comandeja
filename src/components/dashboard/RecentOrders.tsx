import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800 border-blue-200" },
  preparing: { label: "Preparando", color: "bg-purple-100 text-purple-800 border-purple-200" },
  ready: { label: "Pronto", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  out_for_delivery: { label: "Em rota", color: "bg-orange-100 text-orange-800 border-orange-200" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200" },
};

const getStatusDisplay = (status) => {
  return statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };
};

const RecentOrders = () => {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3"><Skeleton className="h-4 w-20" /></th>
                  <th className="text-left pb-3"><Skeleton className="h-4 w-24" /></th>
                  <th className="text-left pb-3"><Skeleton className="h-4 w-20" /></th>
                  <th className="text-left pb-3"><Skeleton className="h-4 w-16" /></th>
                  <th className="text-right pb-3"><Skeleton className="h-4 w-16 ml-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasOrders = stats.recentOrders && stats.recentOrders.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Pedidos Recentes
        </CardTitle>
        <CardDescription>
          Últimos pedidos realizados no seu restaurante
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasOrders ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left font-medium pb-3">Pedido</th>
                  <th className="text-left font-medium pb-3">Cliente</th>
                  <th className="text-left font-medium pb-3">Data</th>
                  <th className="text-left font-medium pb-3">Status</th>
                  <th className="text-right font-medium pb-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const status = getStatusDisplay(order.status);
                  return (
                    <tr key={order.id} className="border-t border-gray-100">
                      <td className="py-3 font-medium">{order.order_number}</td>
                      <td className="py-3">{order.customer_name}</td>
                      <td className="py-3">
                        {format(new Date(order.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className={`${status.color}`}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum pedido encontrado</p>
            <p className="text-gray-400 text-sm mt-2">Os pedidos aparecerão aqui quando forem realizados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
