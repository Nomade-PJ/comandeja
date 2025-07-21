import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const SalesChart = () => {
  const { stats, loading } = useDashboardStats();

  // Garantir que temos dados de vendas mensais
  const salesData = stats?.monthlySales?.data || [];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Vendas Mensais</CardTitle>
        <CardDescription>
          Acompanhe o desempenho de vendas do seu restaurante
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${value}`, 'Vendas']}
                labelFormatter={(label) => `Mês ${label}`}
              />
              <Line
                type="monotone"
                dataKey="vendas"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesChart;
