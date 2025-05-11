
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dados de exemplo para os gráficos
const salesData = [
  { name: 'Segunda', vendas: 1200 },
  { name: 'Terça', vendas: 1500 },
  { name: 'Quarta', vendas: 2000 },
  { name: 'Quinta', vendas: 1800 },
  { name: 'Sexta', vendas: 2400 },
  { name: 'Sábado', vendas: 3100 },
  { name: 'Domingo', vendas: 2000 },
];

const popularItems = [
  { name: 'Classic Burger', quantidade: 124 },
  { name: 'Veggie Burger', quantidade: 85 },
  { name: 'Pepperoni Pizza', quantidade: 147 },
  { name: 'Coca-Cola', quantidade: 250 },
  { name: 'Chocolate Brownie', quantidade: 95 },
];

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <DashboardLayout title="Relatórios">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Desempenho do restaurante</h2>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">Exportar</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Faturamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 12.450,00</div>
            <p className="text-sm text-green-600 mt-1">+15% em relação à semana anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">342</div>
            <p className="text-sm text-green-600 mt-1">+8% em relação à semana anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 36,40</div>
            <p className="text-sm text-green-600 mt-1">+5% em relação à semana anterior</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sales" className="mb-8">
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="items">Itens Populares</TabsTrigger>
          <TabsTrigger value="hours">Horários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por dia da semana</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                  <Legend />
                  <Bar dataKey="vendas" name="Vendas (R$)" fill="#4E3B8D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Itens mais vendidos</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={popularItems}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" name="Quantidade vendida" fill="#FF7A21" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de pedidos por horário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Dados de horário serão carregados em breve...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-gray-500">
              Gráfico de desempenho por categoria de produtos será mostrado aqui...
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Forma de pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-gray-500">
              Gráfico de distribuição de formas de pagamento será mostrado aqui...
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
