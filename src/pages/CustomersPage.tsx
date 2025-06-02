import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Search, UserPlus } from 'lucide-react';

// Tipo para clientes
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: Date;
};

// Dados de exemplo
const mockCustomers: Customer[] = [
  {
    id: 'cus-1',
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    phone: '(11) 98765-4321',
    orders: 8,
    totalSpent: 450.75,
    lastOrder: new Date(2025, 4, 5)
  },
  {
    id: 'cus-2',
    name: 'Maria Santos',
    email: 'maria.santos@exemplo.com',
    phone: '(11) 91234-5678',
    orders: 5,
    totalSpent: 275.30,
    lastOrder: new Date(2025, 4, 8)
  },
  {
    id: 'cus-3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@exemplo.com',
    phone: '(21) 99876-5432',
    orders: 3,
    totalSpent: 125.50,
    lastOrder: new Date(2025, 4, 10)
  },
];

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers] = useState<Customer[]>(mockCustomers);
  const isMobile = useIsMobile();
  
  // Filtra clientes por nome, email ou telefone
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Formata valor para moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formata data para padrão brasileiro
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Renderiza lista de clientes para mobile
  const renderMobileCustomerList = () => {
    return (
      <div className="space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-sm border-t pt-3">
                  <div>
                    <p className="text-gray-500">Pedidos</p>
                    <p className="font-medium">{customer.orders}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Último</p>
                    <p className="font-medium">{formatDate(customer.lastOrder)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Renderiza tabela para desktop
  const renderDesktopCustomerTable = () => {
    return (
      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="w-full">
            <Table>
              <TableCaption>Lista de clientes cadastrados</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-center">Pedidos</TableHead>
                  <TableHead className="text-right">Total Gasto</TableHead>
                  <TableHead>Último Pedido</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="text-center">{customer.orders}</TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
                      <TableCell>{formatDate(customer.lastOrder)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Ver detalhes</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title="Clientes">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Gerenciar Clientes</CardTitle>
          <CardDescription>
            Adicione e gerencie os clientes do seu restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/2 relative">
              <Input
                placeholder="Buscar clientes por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <Button className="w-full md:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      {isMobile ? renderMobileCustomerList() : renderDesktopCustomerTable()}
    </DashboardLayout>
  );
};

export default CustomersPage;
