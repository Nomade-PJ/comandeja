import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TopProducts = () => {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasProducts = stats.topProducts && stats.topProducts.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Produtos em Alta
        </CardTitle>
        <CardDescription>
          Produtos mais vendidos hoje
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasProducts ? (
          <div className="space-y-4">
            {stats.topProducts.map((product) => (
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
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Qtd: {product.quantity} unidades</p>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(product.total)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum produto vendido</p>
            <p className="text-gray-400 text-sm mt-2">Os produtos mais vendidos aparecerão aqui</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProducts;
