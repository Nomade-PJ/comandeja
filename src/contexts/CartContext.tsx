
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product, MockProduct } from '@/lib/models';
import { useToast } from '@/components/ui/use-toast';

// Definir o tipo para um item do carrinho
export interface CartItem {
  product: Product | MockProduct;
  quantity: number;
  notes?: string;
}

// Tipo do contexto do carrinho
interface CartContextType {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product | MockProduct, quantity: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Adicionar item ao carrinho
  const addToCart = (product: Product | MockProduct, quantity: number, notes?: string) => {
    setCartItems(prev => {
      // Verificar se o produto já existe no carrinho
      const existingItemIndex = prev.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Atualizar quantidade se o produto já existe
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          notes: notes || updatedItems[existingItemIndex].notes
        };
        return updatedItems;
      } else {
        // Adicionar novo item se o produto não existe
        return [...prev, { product, quantity, notes }];
      }
    });
    
    toast({
      title: "Item adicionado",
      description: `${quantity}x ${product.name} adicionado ao carrinho`,
    });
  };

  // Remover item do carrinho
  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    
    toast({
      title: "Item removido",
      description: "Item removido do carrinho",
    });
  };

  // Atualizar quantidade de um item no carrinho
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Limpar carrinho
  const clearCart = () => {
    setCartItems([]);
  };

  // Obter total de itens no carrinho
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Obter preço total do carrinho
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
