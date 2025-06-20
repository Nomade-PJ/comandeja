import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  restaurant_id: string;
}

// Interface para o formato de dados da tabela cart_items no Supabase
interface SupabaseCartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  restaurant_id: string;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  getCartTotal: () => number;
  getCartItems: () => CartItem[];
  favorites: string[];
  toggleFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
  syncingCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [syncingCart, setSyncingCart] = useState(false);
  const { user } = useAuth();

  // Load cart and favorites from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
    
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites from localStorage', error);
      }
    }
  }, []);

  // Sincronizar com o Supabase quando o usuário faz login
  useEffect(() => {
    if (user) {
      syncCartWithSupabase();
    }
  }, [user]);

  // Carregar carrinho do Supabase quando o usuário estiver autenticado
  const syncCartWithSupabase = async () => {
    if (!user) return;

    console.log('Sincronizando carrinho com Supabase');
    setSyncingCart(true);
    
    try {
      // Buscar itens do carrinho salvos no banco
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Converter para o formato do CartItem
        const supabaseItems: CartItem[] = (data as SupabaseCartItem[]).map(item => ({
          id: item.product_id,
          name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url || undefined,
          restaurant_id: item.restaurant_id
        }));
        
        // Mesclagem inteligente: Manter o carrinho local se for mais recente
        if (items.length > 0) {
          // Mesclar itens existentes do localStorage com os do Supabase
          // Preferir os itens do localStorage (mais recentes)
          const mergedItems = [...items];
          
          // Adicionar itens do Supabase que não existem no localStorage
          supabaseItems.forEach(serverItem => {
            if (!mergedItems.some(localItem => localItem.id === serverItem.id)) {
              mergedItems.push(serverItem);
            }
          });
          
          setItems(mergedItems);
          saveCartToSupabase(mergedItems);
        } else {
          // Se não há itens locais, usar os do servidor
          setItems(supabaseItems);
          localStorage.setItem('cart', JSON.stringify(supabaseItems));
        }
      } else if (items.length > 0) {
        // Se há itens no localStorage mas não no Supabase, salvar os itens do localStorage
        saveCartToSupabase(items);
      }
    } catch (error) {
      console.error('Erro ao sincronizar carrinho com Supabase:', error);
    } finally {
      setSyncingCart(false);
    }
  };

  // Salvar carrinho no Supabase
  const saveCartToSupabase = async (cartItems: CartItem[]) => {
    if (!user) return;
    
    try {
      console.log('Salvando carrinho no Supabase');
      
      // Primeiro limpar carrinho atual do usuário
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) {
        console.error('Erro ao limpar carrinho existente:', deleteError);
        return;
      }
      
      // Se não há itens, não precisa inserir nada
      if (cartItems.length === 0) return;
      
      // Preparar itens para inserção
      const itemsToInsert: SupabaseCartItem[] = cartItems.map(item => ({
        id: uuidv4(), // Usar a função uuidv4() em vez de crypto.randomUUID()
        user_id: user.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url || null,
        restaurant_id: item.restaurant_id
      }));
      
      // Inserir itens
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert(itemsToInsert);
        
      if (insertError) {
        throw insertError;
      }
    } catch (error) {
      console.error('Erro ao salvar carrinho no Supabase:', error);
    }
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    
    // Se usuário estiver logado, salvar também no Supabase
    if (user && !syncingCart) {
      saveCartToSupabase(items);
    }
  }, [items, user]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    console.log('CartContext - Adicionando item ao carrinho:', newItem);
    
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        console.log('Item existente no carrinho, atualizando quantidade');
        
        // Mostrar toast de confirmação
        toast.success(`Quantidade de ${newItem.name} atualizada no carrinho`);
        
        return updatedItems;
      } else {
        // Add new item with quantity 1
        console.log('Novo item adicionado ao carrinho');
        
        // Mostrar toast de confirmação
        toast.success(`${newItem.name} adicionado ao carrinho`);
        
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };

  const removeItem = (itemId: string) => {
    // Encontrar o item para mostrar mensagem
    const itemToRemove = items.find(item => item.id === itemId);
    
    setItems(prevItems => {
      const filteredItems = prevItems.filter(item => item.id !== itemId);
      
      if (itemToRemove) {
        toast.info(`${itemToRemove.name} removido do carrinho`);
      }
      
      return filteredItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Seu carrinho foi esvaziado');
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartTotal = () => getTotal();
  
  const getCartItems = () => items;

  const toggleFavorite = (restaurantId: string) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(restaurantId)) {
        return prevFavorites.filter(id => id !== restaurantId);
      } else {
        return [...prevFavorites, restaurantId];
      }
    });
  };

  const isFavorite = (restaurantId: string) => {
    return favorites.includes(restaurantId);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotal,
      getCartTotal,
      getCartItems,
      favorites,
      toggleFavorite,
      isFavorite,
      syncingCart
    }}>
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