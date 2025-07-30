import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import NewOrderModal from "@/components/dashboard/modals/NewOrderModal";
import FiltersModal from "@/components/dashboard/modals/FiltersModal";
import { useOrders } from "@/hooks/useOrders";
// Importar a versão lazy da tabela de pedidos
import LazyOrdersTable from "@/components/dashboard/tables/LazyOrdersTable";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardOrders = () => {
  // Estados
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  
  // Hook de pedidos
  const { orders, loading, fetchOrders, createOrder, updateOrderStatus } = useOrders();

  // Buscar pedidos ao iniciar ou quando os filtros mudarem
  useEffect(() => {
    fetchOrders({ status: statusFilter, search: searchQuery });
  }, [fetchOrders, statusFilter]);

  // Função para lidar com a busca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    fetchOrders({ status: statusFilter, search: searchQuery }).finally(() => {
      setIsSearching(false);
    });
  };

  // Função para aplicar filtros
  const handleApplyFilters = (filters: { status?: string }) => {
    setStatusFilter(filters.status);
    fetchOrders({ status: filters.status, search: searchQuery });
  };

  // Renderizar estado de carregamento
  if (loading && orders.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          <Skeleton className="h-14 w-full" />

          <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600 mb-4"></div>
            <p className="text-base font-medium text-gray-700 mb-1">Carregando pedidos...</p>
            <p className="text-sm text-gray-500 mb-4">Isso pode levar alguns segundos</p>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pedidos</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie todos os pedidos do seu restaurante
            </p>
          </div>
          <Button 
            className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white text-sm sm:text-base w-full sm:w-auto"
            onClick={() => setShowNewOrderModal(true)}
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            Novo Pedido
          </Button>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar pedidos por número ou cliente..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowFiltersModal(true)}
              className="flex-1 sm:flex-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button 
              type="submit" 
              className="flex-1 sm:flex-auto"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full" />
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        </form>

        <Card className="-mx-4 sm:mx-0 border-0 sm:border rounded-none sm:rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Lista de Pedidos</CardTitle>
            <CardDescription>
              Acompanhe o status dos seus pedidos em tempo real
              {statusFilter && (
                <span className="ml-2 inline-block">
                  (Filtro: {statusFilter === 'pending' ? 'Pendentes' : 
                            statusFilter === 'confirmed' ? 'Confirmados' : 
                            statusFilter === 'preparing' ? 'Em preparo' : 
                            statusFilter === 'ready' ? 'Prontos' : 
                            statusFilter === 'out_for_delivery' ? 'Em rota' : 
                            statusFilter === 'delivered' ? 'Entregues' : 
                            statusFilter === 'cancelled' ? 'Cancelados' : statusFilter})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Usar a versão lazy da tabela de pedidos */}
            <LazyOrdersTable orders={orders} onUpdateStatus={updateOrderStatus} />
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <NewOrderModal
        open={showNewOrderModal}
        onOpenChange={setShowNewOrderModal}
        onCreateOrder={createOrder}
      />
      <FiltersModal
        open={showFiltersModal}
        onOpenChange={setShowFiltersModal}
        onApplyFilters={handleApplyFilters}
        type="orders"
        initialFilters={{ status: statusFilter }}
      />
    </DashboardLayout>
  );
};

export default DashboardOrders;
