import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import NewOrderModal from "@/components/dashboard/modals/NewOrderModal";
import FiltersModal from "@/components/dashboard/modals/FiltersModal";
import { useOrders } from "@/hooks/useOrders";
import OrdersTable from "@/components/dashboard/tables/OrdersTable";

const DashboardOrders = () => {
  // Estados
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  // Hook de pedidos
  const { orders, loading, fetchOrders, createOrder, updateOrderStatus } = useOrders();

  // Buscar pedidos ao iniciar ou quando os filtros mudarem
  useEffect(() => {
    fetchOrders({ status: statusFilter, search: searchQuery });
  }, [fetchOrders, statusFilter]);

  // Função para lidar com a busca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders({ status: statusFilter, search: searchQuery });
  };

  // Função para aplicar filtros
  const handleApplyFilters = (filters: { status?: string }) => {
    setStatusFilter(filters.status);
    fetchOrders({ status: filters.status, search: searchQuery });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
                  <p className="text-muted-foreground">
                    Gerencie todos os pedidos do seu restaurante
                  </p>
                </div>
                <Button 
                  className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                  onClick={() => setShowNewOrderModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Pedido
                </Button>
              </div>

              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar pedidos por número ou cliente..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowFiltersModal(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button type="submit">Buscar</Button>
              </form>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Pedidos</CardTitle>
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
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">Carregando pedidos...</p>
                    </div>
                  ) : (
                    <OrdersTable 
                      orders={orders} 
                      onUpdateStatus={updateOrderStatus} 
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <NewOrderModal 
        open={showNewOrderModal} 
        onOpenChange={setShowNewOrderModal} 
        onCreateOrder={createOrder}
      />
      <FiltersModal 
        open={showFiltersModal} 
        onOpenChange={setShowFiltersModal}
        type="orders"
        onApplyFilters={handleApplyFilters}
        initialFilters={{ status: statusFilter }}
      />
    </SidebarProvider>
  );
};

export default DashboardOrders;
