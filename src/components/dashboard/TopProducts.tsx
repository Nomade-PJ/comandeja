import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const TopProducts = () => {
  const { stats, loading } = useDashboardStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
        <CardDescription>
          Os produtos mais populares do seu restaurante
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : stats.topProducts.length > 0 ? (
          <div className="space-y-5">
            {stats.topProducts.map((product) => (
              <div key={product.id} className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={product.image_url} alt={product.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {product.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.quantity} {product.quantity === 1 ? 'unidade' : 'unidades'}
                  </p>
                </div>
                <div className="font-medium">{formatCurrency(product.total)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Nenhum produto vendido ainda
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProducts;
