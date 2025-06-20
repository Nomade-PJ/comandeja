import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import EditProductModal from "@/components/dashboard/modals/EditProductModal";
import DeleteProductDialog from "../dashboard/modals/DeleteProductDialog";
import { AlertCircle, MoreVertical, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProductsList = () => {
  const { products, isLoading, error: productsError } = useProducts();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const { toast } = useToast();

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Renderizar esqueletos de carregamento
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-0">
              <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-5 w-1/4" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Exibir mensagem de erro se houver problema ao carregar produtos
  if (productsError) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 text-red-800 rounded-lg">
        <AlertCircle className="mr-2 h-5 w-5" />
        <p>Erro ao carregar produtos. Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  // Exibir mensagem se não houver produtos
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 text-gray-500 rounded-lg">
        <p>Nenhum produto cadastrado. Crie seu primeiro produto usando o botão acima.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100 flex items-center justify-center">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback para ícone se a imagem falhar ao carregar
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sem+Imagem';
                  }}
                />
              ) : (
                <div className="text-gray-400 text-center p-4">
                  <ShieldAlert className="mx-auto h-12 w-12 mb-2" />
                  <p>Sem imagem</p>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                <Badge variant={product.is_active ? "default" : "outline"}>
                  {product.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              {product.category_id && (
                <Badge variant="secondary" className="mb-2">
                  {product.categories?.name || "Categoria"}
                </Badge>
              )}
              
              {product.description && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
              )}
              
              <p className="text-lg font-bold text-green-600">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
              
              {product.preparation_time && (
                <p className="text-xs text-gray-500">
                  Preparo: {product.preparation_time} min
                </p>
              )}
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Badge variant={product.is_featured ? "secondary" : "outline"}>
                {product.is_featured ? "Em destaque" : "Sem destaque"}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditClick(product)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(product)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <EditProductModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen} 
        product={editingProduct}
      />
      
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={productToDelete}
      />
    </>
  );
};

export default ProductsList; 