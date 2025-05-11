
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

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

  return (
    <DashboardLayout title="Clientes">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/2">
              <Input
                placeholder="Buscar clientes por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>Adicionar Cliente</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CustomersPage;
