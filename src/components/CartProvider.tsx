
import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/contexts/RestaurantContext';
import { useToast } from "@/components/ui/use-toast";

export type CartItem = {
  product: Product;
  quantity: number;
  notes?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; restaurantId?: string }> = ({ 
  children, 
  restaurantId 
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // All localStorage references removed - in a real implementation, this would use PostgreSQL
  // to store and retrieve cart information
  
  const addToCart = (product: Product, quantity: number, notes?: string) => {
    setItems(currentItems => {
      // Check if product is already in cart
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update existing item
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        );
      } else {
        // Add new item
        return [...currentItems, { product, quantity, notes }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name}`,
    });
  };
  
  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  const updateNotes = (productId: string, notes: string) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, notes }
          : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
  };
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );
  
  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
