import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Users, Mail, Phone, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import FiltersModal from "@/components/dashboard/modals/FiltersModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomers } from "@/hooks/useCustomers";

const DashboardCustomers = () => {
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { customers, loading, stats, searchCustomers, formatCurrency } = useCustomers();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCustomers(searchQuery);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
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
                  <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
                  <p className="text-muted-foreground">
                    Gerencie seus clientes e histórico de pedidos
                  </p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar clientes..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit">
                  Buscar
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowFiltersModal(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total de Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">clientes registrados</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Novos Este Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold">{stats.newThisMonth}</div>
                    <p className="text-xs text-muted-foreground">novos clientes</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ticket Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold">{formatCurrency(stats.averageTicket)}</div>
                    <p className="text-xs text-muted-foreground">valor médio por pedido</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cliente Fiel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold">{stats.mostLoyal ? stats.mostLoyal.name.split(' ')[0] : '-'}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.mostLoyal ? `${stats.mostLoyal.total_orders} pedidos` : 'nenhum cliente'}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Clientes</CardTitle>
                  <CardDescription>
                    Acompanhe todos os seus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : customers.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Data de cadastro</TableHead>
                            <TableHead>Pedidos</TableHead>
                            <TableHead>Gasto total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium">
                                {customer.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {customer.email || '-'}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {customer.phone || '-'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center text-sm">
                                  <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                                  {formatDate(customer.created_at)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={customer.total_orders > 0 ? "default" : "secondary"}>
                                  {customer.total_orders || 0}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(customer.total_spent || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhum cliente encontrado</p>
                    <p className="text-gray-400 text-sm mt-2">Os clientes aparecerão aqui quando fizerem pedidos</p>
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <FiltersModal 
        open={showFiltersModal} 
        onOpenChange={setShowFiltersModal}
        type="customers"
      />
    </SidebarProvider>
  );
};

export default DashboardCustomers;
