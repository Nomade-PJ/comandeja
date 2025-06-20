import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ProductsReportData {
  totalProductsSold: number;
  bestSellingProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    formattedRevenue: string;
    image_url?: string;
  }>;
  categoriesBreakdown: Array<{
    category: string;
    quantity: number;
    revenue: number;
    formattedRevenue: string;
  }>;
}

interface ProductsReportDetailProps {
  data: ProductsReportData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const ProductsReportDetail = ({ data }: ProductsReportDetailProps) => {
  // Dados para o gráfico de categorias
  const categoryChartData = data.categoriesBreakdown.map((item, index) => ({
    name: item.category,
    value: item.revenue,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total de Produtos Vendidos</p>
              <p className="text-2xl font-bold mt-2">{data.totalProductsSold}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Categorias</p>
              <p className="text-2xl font-bold mt-2">{data.categoriesBreakdown.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Produtos Diferentes</p>
              <p className="text-2xl font-bold mt-2">{data.bestSellingProducts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium mb-4">Produtos Mais Vendidos</p>
            <div className="space-y-4">
              {data.bestSellingProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage 
                      src={product.image_url} 
                      alt={product.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-400 rounded-md">
                      {product.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Qtd: {product.quantity} unidades</p>
                  </div>
                  <span className="text-sm font-medium">
                    {product.formattedRevenue}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="font-medium mb-4">Distribuição por Categoria</p>
            <div className="h-[300px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Sem dados de categoria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="font-medium mb-4">Detalhamento por Categoria</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-muted-foreground border-b">
                  <th className="text-left font-medium pb-2">Categoria</th>
                  <th className="text-left font-medium pb-2">Quantidade</th>
                  <th className="text-right font-medium pb-2">Receita</th>
                  <th className="text-right font-medium pb-2">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {data.categoriesBreakdown.map((category, index) => {
                  const totalRevenue = data.categoriesBreakdown.reduce((acc, cat) => acc + cat.revenue, 0);
                  const percentage = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
                  
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3">{category.category}</td>
                      <td className="py-3">{category.quantity}</td>
                      <td className="py-3 text-right">{category.formattedRevenue}</td>
                      <td className="py-3 text-right">{percentage.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsReportDetail; 