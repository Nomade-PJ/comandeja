
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
  Clipboard, 
  MoreHorizontal, 
  Download, 
  Plus,
  ArrowUpDown,
  Users,
  Search
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// In a real implementation, this would be fetched from PostgreSQL
const clients = [
  {
    id: '001',
    restaurantName: 'Pizzaria Napolitana',
    owner: 'Maria Silva',
    email: 'contato@pizzarianapolitana.com',
    phone: '(11) 98765-4321',
    plan: 'Pro',
    status: 'active',
    createdAt: '2025-01-15',
    ordersCount: 1245
  },
  {
    id: '002',
    restaurantName: 'Café Expresso',
    owner: 'João Oliveira',
    email: 'contato@cafeexpresso.com',
    phone: '(11) 91234-5678',
    plan: 'Premium',
    status: 'active',
    createdAt: '2025-02-03',
    ordersCount: 987
  },
  {
    id: '003',
    restaurantName: 'Hamburgueria Top',
    owner: 'Pedro Santos',
    email: 'contato@hamburgueriatop.com',
    phone: '(11) 92345-6789',
    plan: 'Starter',
    status: 'trial',
    createdAt: '2025-05-01',
    ordersCount: 56
  },
  {
    id: '004',
    restaurantName: 'Restaurante Sabor Brasileiro',
    owner: 'Ana Costa',
    email: 'contato@saborbrasileiro.com',
    phone: '(11) 93456-7890',
    plan: 'Pro',
    status: 'suspended',
    createdAt: '2025-01-20',
    ordersCount: 789
  },
  {
    id: '005',
    restaurantName: 'Sushiteria Oriental',
    owner: 'Lucas Tanaka',
    email: 'contato@sushiteria.com',
    phone: '(11) 94567-8901',
    plan: 'Premium',
    status: 'inactive',
    createdAt: '2024-10-15',
    ordersCount: 1876
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

const AdminClients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'active' && client.status === 'active') ||
      (activeTab === 'trial' && client.status === 'trial') ||
      (activeTab === 'suspended' && client.status === 'suspended') ||
      (activeTab === 'inactive' && client.status === 'inactive');
    
    return matchesSearch && matchesTab;
  });

  return (
    <AdminDashboardLayout title="Gerenciamento de Clientes">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Gerencie todos os restaurantes cadastrados na plataforma ComandeJá
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" /> Exportar
              </Button>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Novo Cliente
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5 md:w-[600px]">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="trial">Em Teste</TabsTrigger>
              <TabsTrigger value="suspended">Suspensos</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center mb-4 relative">
            <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nome, responsável ou email..."
              className="pl-9 w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-1 cursor-pointer">
                      Nome do Restaurante <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer">
                      Pedidos <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Cliente desde</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.restaurantName}
                      </TableCell>
                      <TableCell>{client.owner}</TableCell>
                      <TableCell>
                        <div className="text-sm">{client.email}</div>
                        <div className="text-sm text-muted-foreground">{client.phone}</div>
                      </TableCell>
                      <TableCell>{client.plan}</TableCell>
                      <TableCell>
                        <StatusBadge status={client.status} />
                      </TableCell>
                      <TableCell>{client.ordersCount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(client.createdAt).toLocaleDateString('pt-BR')}</TableCell>
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
                            <DropdownMenuItem>Gerenciar plano</DropdownMenuItem>
                            <DropdownMenuItem>Acessar como cliente</DropdownMenuItem>
                            <DropdownMenuItem>Suspender</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Nenhum cliente encontrado com os filtros selecionados.
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

export default AdminClients;
