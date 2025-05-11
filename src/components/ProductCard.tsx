
import React from 'react';
import { Product } from '@/contexts/RestaurantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  onEdit?: (product: Product) => void;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  onEdit,
  isAdmin = false 
}) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, 1);
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        
        {!product.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold">Unavailable</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          <div className="font-bold text-primary">
            R$ {product.price.toFixed(2)}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {isAdmin ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleEdit}
          >
            Edit
          </Button>
        ) : (
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleAddToCart}
            disabled={!product.available}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
