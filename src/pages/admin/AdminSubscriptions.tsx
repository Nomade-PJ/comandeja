
import React, { useState } from 'react';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Filter, 
  MoreHorizontal, 
  Download, 
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// In a real implementation, this would be fetched from PostgreSQL
const subscriptions = [
  {
    id: '001',
    restaurantName: 'Pizzaria Napolitana',
    restaurantId: 'resto-1',
    plan: 'Pro',
    status: 'active',
    paymentStatus: 'paid',
    startDate: '2025-04-01',
    endDate: '2026-04-01',
    value: 199.90
  },
  {
    id: '002',
    restaurantName: 'Café Expresso',
    restaurantId: 'resto-2',
    plan: 'Premium',
    status: 'active',
    paymentStatus: 'paid',
    startDate: '2025-03-15',
    endDate: '2026-03-15',
    value: 299.90
  },
  {
    id: '003',
    restaurantName: 'Hamburgueria Top',
    restaurantId: 'resto-3',
    plan: 'Starter',
    status: 'trial',
    paymentStatus: 'free',
    startDate: '2025-05-01',
    endDate: '2025-05-15',
    value: 0
  },
  {
    id: '004',
    restaurantName: 'Restaurante Sabor Brasileiro',
    restaurantId: 'resto-4',
    plan: 'Pro',
    status: 'suspended',
    paymentStatus: 'overdue',
    startDate: '2025-02-01',
    endDate: '2026-02-01',
    value: 199.90
  },
  {
    id: '005',
    restaurantName: 'Sushiteria Oriental',
    restaurantId: 'resto-5',
    plan: 'Premium',
    status: 'inactive',
    paymentStatus: 'cancelled',
    startDate: '2024-11-01',
    endDate: '2025-05-01',
    value: 299.90
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  
  switch (status) {
    case 'active':
      variant = "default";
      break;
    case 'suspended':
      variant = "destructive";
      break;
    case 'trial':
      variant = "secondary";
      break;
    case 'inactive':
      variant = "outline";
      break;
    default:
      variant = "default";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

const PaymentBadge = ({ status }: { status: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  
  switch (status) {
    case 'paid':
      variant = "default";
      break;
    case 'overdue':
      variant = "destructive";
      break;
    case 'free':
      variant = "secondary";
      break;
    case 'cancelled':
      variant = "outline";
      break;
    default:
      variant = "default";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

const AdminSubscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <AdminDashboardLayout title="Gerenciamento de Assinaturas">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Assinaturas</CardTitle>
          <CardDescription>
            Gerencie todas as assinaturas de clientes da plataforma ComandeJá
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Buscar assinatura ou cliente..."
                className="w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="trial">Em teste</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" /> Exportar
              </Button>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Nova Assinatura
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-1 cursor-pointer">
                      Cliente <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer">
                      Plano <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer">
                      Valor (R$) <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.restaurantName}
                      </TableCell>
                      <TableCell>{subscription.plan}</TableCell>
                      <TableCell>
                        <StatusBadge status={subscription.status} />
                      </TableCell>
                      <TableCell>
                        <PaymentBadge status={subscription.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        {subscription.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{new Date(subscription.startDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{new Date(subscription.endDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Renovar</DropdownMenuItem>
                            <DropdownMenuItem>Suspender</DropdownMenuItem>
                            <DropdownMenuItem>Cancelar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Nenhuma assinatura encontrada com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminDashboardLayout>
  );
};

export default AdminSubscriptions;
