import React, { useState, useEffect } from 'react';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  PieChart,
  ResponsiveContainer, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  Line,
  Pie,
  Cell
} from 'recharts';
import { CalendarIcon, Download, RefreshCw, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

// In a real implementation, this would be fetched from PostgreSQL
const revenueData = [
  {
    month: 'Jan',
    receita: 45000,
    meta: 40000,
  },
  {
    month: 'Fev',
    receita: 52000,
    meta: 45000,
  },
  {
    month: 'Mar',
    receita: 49000,
    meta: 50000,
  },
  {
    month: 'Abr',
    receita: 63000,
    meta: 55000,
  },
  {
    month: 'Mai',
    receita: 75000,
    meta: 60000,
  },
  {
    month: 'Jun',
    receita: 80000,
    meta: 65000,
  }
];

const clientsData = [
  {
    month: 'Jan',
    novos: 24,
    cancelados: 5,
    ativos: 125,
  },
  {
    month: 'Fev',
    novos: 31,
    cancelados: 8,
    ativos: 148,
  },
  {
    month: 'Mar',
    novos: 27,
    cancelados: 6,
    ativos: 169,
  },
  {
    month: 'Abr',
    novos: 35,
    cancelados: 9,
    ativos: 195,
  },
  {
    month: 'Mai',
    novos: 42,
    cancelados: 7,
    ativos: 230,
  },
  {
    month: 'Jun',
    novos: 29,
    cancelados: 11,
    ativos: 248,
  }
];

const plansData = [
  { name: 'Starter', value: 45, color: '#8884d8' },
  { name: 'Pro', value: 87, color: '#83a6ed' },
  { name: 'Premium', value: 36, color: '#8dd1e1' },
  { name: 'Enterprise', value: 5, color: '#82ca9d' },
];

// Define the proper date range type
type DateRangeType = {
  from: Date;
  to: Date;
};

const AdminReports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
    to: new Date(),
  });
  const [timeframe, setTimeframe] = useState('6months');
  const isMobile = useIsMobile();

  return (
    <AdminDashboardLayout title="Relatórios e Analytics">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Análise de Desempenho</h1>
          <p className="text-muted-foreground">
            Visualize métricas importantes do seu negócio SaaS
          </p>
        </div>
        
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-row'} items-center gap-2 self-end md:self-auto`}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`flex items-center gap-2 ${isMobile ? 'w-full justify-between' : ''}`}
              >
                <CalendarIcon className="h-4 w-4" />
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({
                      from: range.from,
                      to: range.to
                    });
                    // In a real implementation, we would fetch data for this range
                  }
                }}
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className={isMobile ? "w-full" : "w-[180px]"}>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="12months">Últimos 12 meses</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          
          <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
            <Button variant="outline" size="icon" title="Atualizar dados" className={isMobile ? "flex-1" : ""}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" className={`flex items-center gap-2 ${isMobile ? "flex-1" : ""}`}>
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="revenue">Faturamento</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="subscription">Assinaturas</TabsTrigger>
            <TabsTrigger value="support">Suporte</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Faturamento Total</CardTitle>
                <CardDescription>Período atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">R$ 75.000,00</div>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  +15% em relação ao período anterior
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Clientes Ativos</CardTitle>
                <CardDescription>Total atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">248</div>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  +18 novos este mês
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Taxa de Retenção</CardTitle>
                <CardDescription>Últimos 3 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">95%</div>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  +2% em relação ao período anterior
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle>Receita Mensal</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                  <BarChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: isMobile ? 10 : 30,
                      left: isMobile ? 0 : 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                    />
                    <Legend />
                    <Bar dataKey="receita" fill="#8884d8" name="Receita" />
                    <Bar dataKey="meta" fill="#82ca9d" name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle>Evolução de Clientes</CardTitle>
                <CardDescription>Crescimento nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                  <LineChart
                    data={clientsData}
                    margin={{
                      top: 5,
                      right: isMobile ? 10 : 30,
                      left: isMobile ? 0 : 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="ativos" 
                      stroke="#8884d8" 
                      name="Clientes Ativos"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="novos" 
                      stroke="#82ca9d" 
                      name="Novos Clientes" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cancelados" 
                      stroke="#ff7300" 
                      name="Cancelamentos" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Distribuição de Planos</CardTitle>
                <CardDescription>Clientes por plano</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                  <PieChart>
                    <Pie
                      data={plansData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {plansData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} clientes`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-8">
              <CardHeader>
                <CardTitle>Top Clientes</CardTitle>
                <CardDescription>Por volume de pedidos processados</CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? "px-2" : ""}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className={isMobile ? "max-w-[60%]" : ""}>
                      <div className="font-medium truncate">Pizzaria Napolitana</div>
                      <div className="text-sm text-muted-foreground">Plano Premium</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">1.245 pedidos</div>
                      <div className="text-sm text-muted-foreground">R$ 124.500,00</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className={isMobile ? "max-w-[60%]" : ""}>
                      <div className="font-medium truncate">Sushiteria Oriental</div>
                      <div className="text-sm text-muted-foreground">Plano Premium</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">1.876 pedidos</div>
                      <div className="text-sm text-muted-foreground">R$ 187.600,00</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className={isMobile ? "max-w-[60%]" : ""}>
                      <div className="font-medium truncate">Restaurante Sabor Brasileiro</div>
                      <div className="text-sm text-muted-foreground">Plano Pro</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">789 pedidos</div>
                      <div className="text-sm text-muted-foreground">R$ 78.900,00</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className={isMobile ? "max-w-[60%]" : ""}>
                      <div className="font-medium truncate">Café Expresso</div>
                      <div className="text-sm text-muted-foreground">Plano Premium</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">987 pedidos</div>
                      <div className="text-sm text-muted-foreground">R$ 98.700,00</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className={isMobile ? "max-w-[60%]" : ""}>
                      <div className="font-medium truncate">Hamburgueria Top</div>
                      <div className="text-sm text-muted-foreground">Plano Starter</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">56 pedidos</div>
                      <div className="text-sm text-muted-foreground">R$ 5.600,00</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">
                Relatório detalhado de faturamento em desenvolvimento. Disponível em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">
                Análise detalhada de clientes em desenvolvimento. Disponível em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">
                Métricas de assinaturas em desenvolvimento. Disponível em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="support">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">
                Análise de suporte em desenvolvimento. Disponível em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminDashboardLayout>
  );
};

export default AdminReports;
