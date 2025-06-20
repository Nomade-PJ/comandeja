import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, Users, Clock } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

type ChangeType = "positive" | "negative" | "neutral";

const StatsCards = () => {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Vendas Hoje",
      value: stats.todaySales.value,
      change: stats.todaySales.change,
      changeType: stats.todaySales.changeType as ChangeType,
      icon: TrendingUp,
    },
    {
      title: "Pedidos Hoje",
      value: stats.todayOrders.value,
      change: stats.todayOrders.change,
      changeType: stats.todayOrders.changeType as ChangeType,
      icon: ShoppingBag,
    },
    {
      title: "Novos Clientes",
      value: stats.newCustomers.value,
      change: stats.newCustomers.change,
      changeType: stats.newCustomers.changeType as ChangeType,
      icon: Users,
    },
    {
      title: "Tempo Médio",
      value: stats.averageTime.value,
      change: stats.averageTime.change,
      changeType: stats.averageTime.changeType as ChangeType,
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
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className={`text-xs flex items-center mt-1 ${
              stat.changeType === 'positive' ? 'text-green-600' : 
              stat.changeType === 'negative' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              <span>{stat.change} vs. ontem</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
