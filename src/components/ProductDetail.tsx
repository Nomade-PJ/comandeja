
import React, { useState } from 'react';
import { Product } from '@/contexts/RestaurantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProductDetailProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product, quantity: number, notes: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  open, 
  onOpenChange,
  onAddToCart 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  
  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleSubmit = () => {
    onAddToCart(product, quantity, notes);
    toast({
      title: "Item adicionado",
      description: `${quantity}x ${product.name} adicionado ao carrinho`,
    });
    onOpenChange(false);
    
    // Reset state for next time
    setQuantity(1);
    setNotes('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {product.imageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <p className="text-gray-600">{product.description}</p>
          
          <div className="font-bold text-lg">
            R$ {product.price.toFixed(2)}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-r-none" 
                onClick={handleDecrement}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                id="quantity"
                type="number"
                className="flex-1 border-0 text-center"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-l-none" 
                onClick={handleIncrement}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Alguma observação especial? (Ex: sem cebola, sem tomate, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Adicionar ao carrinho - R$ {(product.price * quantity).toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;
