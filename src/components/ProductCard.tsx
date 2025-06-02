
import React from 'react';
import { Product, MockProduct } from '@/lib/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product | MockProduct;
  onAddToCart?: (product: Product | MockProduct, quantity: number) => void;
  onEdit?: (product: Product | MockProduct) => void;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  onEdit,
  isAdmin = false 
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    if (onAddToCart) {
      onAddToCart(product, 1);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    if (onEdit) {
      onEdit(product);
    }
  };
  
  // Usar imageUrl para todos os tipos de produtos
  const imageUrl = product.imageUrl;
  
  // Verificar disponibilidade pelo campo available para todos os tipos de produtos
  const isAvailable = 'available' in product ? product.available : 
                    ('is_active' in product ? product.is_active : false);
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <div className="relative h-48 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">Sem imagem</span>
          </div>
        )}
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold">Indisponível</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          <div className="font-bold text-primary">
            R$ {product.price.toFixed(2)}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        {isAdmin ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleEdit}
          >
            Editar
          </Button>
        ) : (
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleAddToCart}
            disabled={!isAvailable}
          >
            <ShoppingCart className="h-4 w-4" />
            Adicionar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
