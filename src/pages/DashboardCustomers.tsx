import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
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

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yy", { locale: ptBR });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie seus clientes e histórico de pedidos
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="submit" className="flex-1 sm:flex-auto">
              Buscar
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowFiltersModal(true)}
              className="flex-1 sm:flex-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">clientes registrados</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Novos Este Mês</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold">{stats.newThisMonth}</div>
                  <p className="text-xs text-muted-foreground">novos clientes</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold">{formatCurrency(stats.averageTicket)}</div>
                  <p className="text-xs text-muted-foreground">valor médio por pedido</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Cliente Fiel</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold">{stats.mostLoyal ? stats.mostLoyal.name.split(' ')[0] : '-'}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.mostLoyal ? `${stats.mostLoyal.total_orders} pedidos` : 'nenhum cliente'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="-mx-4 sm:mx-0 border-0 sm:border rounded-none sm:rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Lista de Clientes</CardTitle>
            <CardDescription>
              Acompanhe todos os seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 pt-0">
            {loading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : customers.length > 0 ? (
              <>
                {/* Versão mobile (cards) */}
                <div className="sm:hidden space-y-4 px-4">
                  {customers.map((customer) => (
                    <Card key={customer.id} className="overflow-hidden border shadow-sm">
                      <div className="p-3">
                        <h3 className="font-medium text-lg mb-1">{customer.name}</h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                            <span className="text-gray-700">{customer.email || '-'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                            <span className="text-gray-700">{customer.phone || '-'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                            <span className="text-gray-700">{formatDateShort(customer.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <Badge variant={customer.total_orders > 0 ? "default" : "secondary"}>
                              {customer.total_orders || 0} pedido{customer.total_orders !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="font-medium text-right">
                            {formatCurrency(customer.total_spent || 0)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {/* Versão desktop (tabela) */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-3 sm:px-4">Cliente</TableHead>
                        <TableHead className="px-3 sm:px-4">Contato</TableHead>
                        <TableHead className="px-3 sm:px-4">Data de cadastro</TableHead>
                        <TableHead className="px-3 sm:px-4">Pedidos</TableHead>
                        <TableHead className="px-3 sm:px-4">Gasto total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                            {customer.name}
                          </TableCell>
                          <TableCell className="px-3 sm:px-4 py-2 sm:py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                <Mail className="w-3 h-3 mr-1" />
                                {customer.email || '-'}
                              </div>
                              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {customer.phone || '-'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 sm:px-4 py-2 sm:py-4">
                            <div className="flex items-center text-xs sm:text-sm">
                              <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                              <span>
                                {formatDate(customer.created_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 sm:px-4 py-2 sm:py-4">
                            <Badge variant={customer.total_orders > 0 ? "default" : "secondary"}>
                              {customer.total_orders || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                            {formatCurrency(customer.total_spent || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">Nenhum cliente encontrado</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">Os clientes aparecerão aqui quando fizerem pedidos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FiltersModal 
        open={showFiltersModal} 
        onOpenChange={setShowFiltersModal}
        type="customers"
      />
    </DashboardLayout>
  );
};

export default DashboardCustomers;
