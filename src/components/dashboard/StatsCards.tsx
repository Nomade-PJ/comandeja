import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, Users, Clock } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

type ChangeType = "positive" | "negative" | "neutral";

const StatsCards = () => {
  const { stats, loading } = useDashboardStats();

  // Garantir que sempre temos valores, mesmo que stats seja undefined
  const safeStats = stats || {
    todaySales: { value: 'R$ 0,00', change: '0%', changeType: 'neutral' as ChangeType },
    todayOrders: { value: '0', change: '0%', changeType: 'neutral' as ChangeType },
    newCustomers: { value: '0', change: '0%', changeType: 'neutral' as ChangeType },
    averageTime: { value: '0 min', change: '0%', changeType: 'neutral' as ChangeType },
  };

  const statItems = [
    {
      title: "Vendas Hoje",
      value: safeStats.todaySales.value,
      change: safeStats.todaySales.change,
      changeType: safeStats.todaySales.changeType as ChangeType,
      icon: TrendingUp,
    },
    {
      title: "Pedidos Hoje",
      value: safeStats.todayOrders.value,
      change: safeStats.todayOrders.change,
      changeType: safeStats.todayOrders.changeType as ChangeType,
      icon: ShoppingBag,
    },
    {
      title: "Novos Clientes",
      value: safeStats.newCustomers.value,
      change: safeStats.newCustomers.change,
      changeType: safeStats.newCustomers.changeType as ChangeType,
      icon: Users,
    },
    {
      title: "Tempo Médio",
      value: safeStats.averageTime.value,
      change: safeStats.averageTime.change,
      changeType: safeStats.averageTime.changeType as ChangeType,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index} className="stat-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-brand-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className={`text-xs flex items-center mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  <span>{stat.change} vs. ontem</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
