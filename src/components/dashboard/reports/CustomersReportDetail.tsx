import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CustomersReportData {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    formattedTotalSpent: string;
  }>;
}

interface CustomersReportDetailProps {
  data: CustomersReportData;
}

const COLORS = ['#0088FE', '#00C49F'];

const CustomersReportDetail = ({ data }: CustomersReportDetailProps) => {
  // Dados para o gráfico de tipo de clientes
  const customerTypeData = [
    { name: 'Clientes Novos', value: data.newCustomers },
    { name: 'Clientes Recorrentes', value: data.returningCustomers },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold mt-2">{data.totalCustomers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Clientes Novos</p>
              <p className="text-2xl font-bold mt-2">{data.newCustomers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
              <p className="text-2xl font-bold mt-2">
                {data.totalCustomers > 0 
                  ? `${((data.returningCustomers / data.totalCustomers) * 100).toFixed(1)}%` 
                  : '0%'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium mb-4">Clientes por Tipo</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {customerTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="font-medium mb-4">Melhores Clientes</p>
            <div className="space-y-4">
              {data.topCustomers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-full bg-brand-100 text-brand-600">
                    <AvatarFallback>
                      {customer.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">Pedidos: {customer.totalOrders}</p>
                  </div>
                  <span className="text-sm font-medium">
                    {customer.formattedTotalSpent}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="font-medium mb-4">Lista de Clientes</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-muted-foreground border-b">
                  <th className="text-left font-medium pb-2">Cliente</th>
                  <th className="text-left font-medium pb-2">Pedidos</th>
                  <th className="text-right font-medium pb-2">Valor Total</th>
                  <th className="text-right font-medium pb-2">Média por Pedido</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100">
                    <td className="py-3">{customer.name}</td>
                    <td className="py-3">{customer.totalOrders}</td>
                    <td className="py-3 text-right">{customer.formattedTotalSpent}</td>
                    <td className="py-3 text-right">
                      {customer.totalOrders > 0 
                        ? (customer.totalSpent / customer.totalOrders).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })
                        : 'R$ 0,00'
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

export default CustomersReportDetail; 