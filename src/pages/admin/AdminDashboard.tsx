import React from 'react';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';

const AdminDashboard = () => {
  // Mock data for dashboard metrics
  const metrics = {
    totalClients: 87,
    activeClients: 72,
    inactiveClients: 15,
    totalSubscriptions: 72,
    expiringSubscriptions: 4,
    pendingPayments: 3,
    topClients: [
      { id: 1, name: 'Restaurante Sabor Brasileiro', pedidos: 1245, plano: 'Premium' },
      { id: 2, name: 'Pizza Express', pedidos: 987, plano: 'Pro' },
      { id: 3, name: 'Café Aroma', pedidos: 876, plano: 'Premium' },
      { id: 4, name: 'Burger House', pedidos: 754, plano: 'Pro' },
      { id: 5, name: 'Sushi Nippon', pedidos: 698, plano: 'Básico' },
    ],
    recentAlerts: [
      { id: 1, type: 'payment', message: 'Pagamento pendente - Restaurante Sabor Brasileiro', date: '12/05/2025' },
      { id: 2, type: 'expiration', message: 'Assinatura expirando em 3 dias - Pizza Express', date: '13/05/2025' },
      { id: 3, type: 'support', message: 'Novo chamado aberto - Café Aroma', date: '14/05/2025' },
    ],
  };

  return (
    <AdminDashboardLayout title="Dashboard Administrativo">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClients}</div>
            <p className="text-xs text-muted-foreground">restaurantes cadastrados</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Ativos</span>
                <span>{metrics.activeClients} ({Math.round(metrics.activeClients / metrics.totalClients * 100)}%)</span>
              </div>
              <Progress value={metrics.activeClients / metrics.totalClients * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">assinaturas ativas</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Expirando em 7 dias</span>
                <span className="text-xs font-medium text-amber-600">{metrics.expiringSubscriptions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Pagamentos pendentes</span>
                <span className="text-xs font-medium text-red-600">{metrics.pendingPayments}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 24.568,00</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>12% em relação ao mês anterior</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Meta mensal</span>
                <span>R$ 30.000,00</span>
              </div>
              <Progress value={24568 / 30000 * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        <Card className="md:col-span-6">
          <CardHeader>
            <CardTitle>Top 5 Clientes</CardTitle>
            <CardDescription>
              Clientes com maior volume de pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">Plano: {client.plano}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{client.pedidos}</p>
                    <p className="text-sm text-muted-foreground">pedidos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-6">
          <CardHeader>
            <CardTitle>Alertas Recentes</CardTitle>
            <CardDescription>
              Notificações importantes do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  {alert.type === 'payment' && (
                    <CreditCard className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  {alert.type === 'expiration' && (
                    <ArrowDown className="h-5 w-5 text-amber-500 mt-0.5" />
                  )}
                  {alert.type === 'support' && (
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">{alert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
