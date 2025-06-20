import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SalesReportData {
  totalSales: number;
  formattedTotalSales: string;
  averageOrderValue: number;
  totalOrders: number;
  period: string;
  monthlyData: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

interface SalesReportDetailProps {
  data: SalesReportData;
}

const SalesReportDetail = ({ data }: SalesReportDetailProps) => {
  const chartData = data.monthlyData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    salesFormatted: formatCurrency(item.sales)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold mt-2">{data.formattedTotalSales}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pedidos</p>
              <p className="text-2xl font-bold mt-2">{data.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(data.averageOrderValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="font-medium mb-4">Evolução de Vendas</p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                formatter={(value: any) => formatCurrency(value)}
                labelFormatter={(value) => `Data: ${value}`}
              />
              <Bar 
                name="Vendas"
                dataKey="sales" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="font-medium mb-4">Detalhamento por Dia</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-muted-foreground border-b">
                  <th className="text-left font-medium pb-2">Data</th>
                  <th className="text-left font-medium pb-2">Pedidos</th>
                  <th className="text-right font-medium pb-2">Vendas</th>
                  <th className="text-right font-medium pb-2">Média por Pedido</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3">{item.date}</td>
                    <td className="py-3">{item.orders}</td>
                    <td className="py-3 text-right">{formatCurrency(item.sales)}</td>
                    <td className="py-3 text-right">
                      {item.orders > 0 
                        ? formatCurrency(item.sales / item.orders) 
                        : formatCurrency(0)
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReportDetail; 