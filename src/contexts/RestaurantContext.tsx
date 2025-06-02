import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { RestaurantService } from '@/lib/services/restaurant-service';
import * as Models from '@/lib/models';
import supabase from '@/lib/supabase';

// Types para uso no contexto
export type Category = Models.Category;
export type Product = Models.Product;
export type OrderItem = Models.OrderItem;
export type OrderStatus = Models.OrderStatus;
export type Order = Models.Order;
export type Restaurant = Models.Restaurant;

type RestaurantContextType = {
  restaurant: Restaurant | null;
  settings: Models.RestaurantSettings | null;
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Models.Customer[];
  reviews: Models.Review[];
  coupons: Models.Coupon[];
  updateRestaurantInfo: (info: Partial<Restaurant>) => Promise<boolean>;
  updateRestaurantSettings: (settings: Partial<Models.RestaurantSettings>) => Promise<boolean>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<string | null>;
  updateCategory: (category: Category) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string | null>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<string | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<boolean>;
  fetchOrders: (page?: number, limit?: number, status?: string) => Promise<void>;
  fetchCustomers: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchReviews: (page?: number, limit?: number) => Promise<void>;
  fetchCoupons: (activeOnly?: boolean) => Promise<void>;
  validateCoupon: (code: string, orderValue: number) => Promise<Models.Coupon | null>;
  isLoading: boolean;
  pagination: {
    orders: { page: number, total: number, limit: number },
    customers: { page: number, total: number, limit: number },
    reviews: { page: number, total: number, limit: number }
  };
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados principais
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<Models.RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Models.Customer[]>([]);
  const [reviews, setReviews] = useState<Models.Review[]>([]);
  const [coupons, setCoupons] = useState<Models.Coupon[]>([]);
  
  // Estados de paginação
  const [pagination, setPagination] = useState({
    orders: { page: 1, total: 0, limit: 20 },
    customers: { page: 1, total: 0, limit: 20 },
    reviews: { page: 1, total: 0, limit: 20 }
  });

  // Carregar dados do restaurante quando o usuário estiver autenticado
  useEffect(() => {
    if (user?.restaurantId) {
      loadRestaurantData();
    }
  }, [user]);

  // Função para carregar todos os dados do restaurante
  const loadRestaurantData = async () => {
    if (!user?.restaurantId) return;
    
    setIsLoading(true);
    try {
      // Buscar dados do restaurante
      const restaurantData = await RestaurantService.getRestaurantById(user.restaurantId);
      if (restaurantData) {
        setRestaurant(restaurantData);
      }
      
      // Buscar configurações
      const settingsData = await RestaurantService.getRestaurantSettings(user.restaurantId);
      if (settingsData) {
        setSettings(settingsData);
      }
      
      // Buscar categorias
      const categoriesData = await RestaurantService.getCategories(user.restaurantId);
      setCategories(categoriesData);
      
      // Buscar produtos
      const productsData = await RestaurantService.getProducts(user.restaurantId);
      setProducts(productsData);
      
      // Buscar pedidos (página 1)
      await fetchOrders(1);
      
      // Buscar cupons
      await fetchCoupons();
      
    } catch (error) {
      console.error('Erro ao carregar dados do restaurante:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do restaurante. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar informações do restaurante
  const updateRestaurantInfo = async (info: Partial<Restaurant>): Promise<boolean> => {
    if (!restaurant?.id) return false;
    
    setIsLoading(true);
    try {
      const success = await RestaurantService.updateRestaurant(restaurant.id, info);
      
      if (success) {
        setRestaurant(prev => prev ? { ...prev, ...info } : null);
        toast({
          title: "Dados atualizados",
          description: "As informações do restaurante foram atualizadas com sucesso."
        });
      } else {
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar as informações do restaurante.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao atualizar informações do restaurante:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar as informações do restaurante.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar configurações do restaurante
  const updateRestaurantSettings = async (settingsData: Partial<Models.RestaurantSettings>): Promise<boolean> => {
    if (!restaurant?.id) return false;
    
    setIsLoading(true);
    try {
      const success = await RestaurantService.updateRestaurantSettings(restaurant.id, settingsData);
      
      if (success) {
        setSettings(prev => prev ? { ...prev, ...settingsData } : null);
        toast({
          title: "Configurações atualizadas",
          description: "As configurações do restaurante foram atualizadas com sucesso."
        });
      } else {
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar as configurações do restaurante.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao atualizar configurações do restaurante:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar as configurações do restaurante.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar categoria
  const addCategory = async (category: Omit<Category, 'id'>): Promise<string | null> => {
    if (!restaurant?.id) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Erro ao adicionar categoria:', error);
        toast({
          title: "Erro ao adicionar categoria",
          description: "Não foi possível adicionar a categoria.",
          variant: "destructive"
        });
        return null;
      }
      
      // Adicionar categoria ao estado
      const newCategory = { ...category, id: data.id } as Category;
      setCategories(prev => [...prev, newCategory]);
      
      toast({
        title: "Categoria adicionada",
        description: "A categoria foi adicionada com sucesso."
      });
      
      return data.id;
    } catch (error) {
      console.error('Erro inesperado ao adicionar categoria:', error);
      toast({
        title: "Erro ao adicionar categoria",
        description: "Ocorreu um erro ao adicionar a categoria.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar categoria
  const updateCategory = async (category: Category): Promise<boolean> => {
    if (!restaurant?.id) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description,
          is_active: category.is_active,
          sort_order: category.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id);
      
      if (error) {
        console.error('Erro ao atualizar categoria:', error);
        toast({
          title: "Erro ao atualizar categoria",
          description: "Não foi possível atualizar a categoria.",
          variant: "destructive"
        });
        return false;
      }
      
      // Atualizar categoria no estado
      setCategories(prev => 
        prev.map(c => c.id === category.id ? category : c)
      );
      
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar categoria:', error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Ocorreu um erro ao atualizar a categoria.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir categoria
  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    if (!restaurant?.id) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);
      
      if (error) {
        console.error('Erro ao excluir categoria:', error);
        toast({
          title: "Erro ao excluir categoria",
          description: "Não foi possível excluir a categoria.",
          variant: "destructive"
        });
        return false;
      }
      
      // Remover categoria do estado
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao excluir categoria:', error);
      toast({
        title: "Erro ao excluir categoria",
        description: "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar produto
  const addProduct = async (product: Omit<Product, 'id'>): Promise<string | null> => {
    if (!restaurant?.id) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Erro ao adicionar produto:', error);
        toast({
          title: "Erro ao adicionar produto",
          description: "Não foi possível adicionar o produto.",
          variant: "destructive"
        });
        return null;
      }
      
      // Adicionar produto ao estado
      const newProduct = { ...product, id: data.id } as Product;
      setProducts(prev => [...prev, newProduct]);
      
      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso."
      });
      
      return data.id;
    } catch (error) {
      console.error('Erro inesperado ao adicionar produto:', error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Ocorreu um erro ao adicionar o produto.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar produto
  const updateProduct = async (product: Product): Promise<boolean> => {
    if (!restaurant?.id) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          category_id: product.category_id,
          image_url: product.image_url,
          is_active: product.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);
      
      if (error) {
        console.error('Erro ao atualizar produto:', error);
        toast({
          title: "Erro ao atualizar produto",
          description: "Não foi possível atualizar o produto.",
          variant: "destructive"
        });
        return false;
      }
      
      // Atualizar produto no estado
      setProducts(prev => 
        prev.map(p => p.id === product.id ? product : p)
      );
      
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar produto:', error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Ocorreu um erro ao atualizar o produto.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir produto
  const deleteProduct = async (productId: string): Promise<boolean> => {
    if (!restaurant?.id) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);
      
      if (error) {
        console.error('Erro ao excluir produto:', error);
        toast({
          title: "Erro ao excluir produto",
          description: "Não foi possível excluir o produto.",
          variant: "destructive"
        });
        return false;
      }
      
      // Remover produto do estado
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao excluir produto:', error);
      toast({
        title: "Erro ao excluir produto",
        description: "Ocorreu um erro ao excluir o produto.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar pedido
  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    if (!restaurant?.id) return null;
    
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          created_at: now,
          updated_at: now
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Erro ao adicionar pedido:', error);
        toast({
          title: "Erro ao criar pedido",
          description: "Não foi possível criar o pedido.",
          variant: "destructive"
        });
        return null;
      }
      
      // Adicionar pedido ao estado com tipagem correta
      const newOrder = { 
        ...orderData, 
        id: data.id,
        created_at: new Date(),
        updated_at: new Date()
      } as unknown as Order;
      
      setOrders(prev => [newOrder, ...prev]);
      
      toast({
        title: "Pedido criado",
        description: "O pedido foi criado com sucesso."
      });
      
      return data.id;
    } catch (error) {
      console.error('Erro inesperado ao criar pedido:', error);
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro ao criar o pedido.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar status do pedido
  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string): Promise<boolean> => {
    if (!restaurant?.id) return false;
    
    setIsLoading(true);
    try {
      const result = await RestaurantService.updateOrderStatus(orderId, status, notes);
      
      if (!result) {
        toast({
          title: "Erro ao atualizar status",
          description: "Não foi possível atualizar o status do pedido.",
          variant: "destructive"
        });
        return false;
      }
      
      // Atualizar pedido no estado com tipagem correta
      setOrders(prev => 
        prev.map(order => {
          if (order.id === orderId) {
            const updatedOrder = { 
              ...order, 
              status,
              notes: notes || order.notes,
              updated_at: new Date()
            };
            return updatedOrder;
          }
          return order;
        })
      );
      
      toast({
        title: "Status atualizado",
        description: `O status do pedido foi atualizado para ${status}.`
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do pedido.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Buscar pedidos (com paginação)
  const fetchOrders = async (page: number = 1, limit: number = 20, status?: string): Promise<void> => {
    if (!restaurant?.id) return;
    
    setIsLoading(true);
    try {
      const result = await RestaurantService.getOrders(restaurant.id, page, limit, status);
      
      setOrders(result.data);
      setPagination(prev => ({
        ...prev,
        orders: {
          page,
          total: result.count,
          limit
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Não foi possível carregar os pedidos. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Buscar clientes (com paginação)
  const fetchCustomers = async (page: number = 1, limit: number = 20, search?: string): Promise<void> => {
    if (!restaurant?.id) return;
    
    setIsLoading(true);
    try {
      const result = await RestaurantService.getCustomers(restaurant.id, page, limit, search);
      
      setCustomers(result.data);
      setPagination(prev => ({
        ...prev,
        customers: {
          page,
          total: result.count,
          limit
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar os clientes. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Buscar avaliações (com paginação)
  const fetchReviews = async (page: number = 1, limit: number = 20): Promise<void> => {
    if (!restaurant?.id) return;
    
    setIsLoading(true);
    try {
      const result = await RestaurantService.getReviews(restaurant.id, page, limit);
      
      setReviews(result.data);
      setPagination(prev => ({
        ...prev,
        reviews: {
          page,
          total: result.count,
          limit
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      toast({
        title: "Erro ao carregar avaliações",
        description: "Não foi possível carregar as avaliações. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Buscar cupons
  const fetchCoupons = async (activeOnly: boolean = false): Promise<void> => {
    if (!restaurant?.id) return;
    
    setIsLoading(true);
    try {
      const couponsData = await RestaurantService.getCoupons(restaurant.id, activeOnly);
      setCoupons(couponsData);
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      toast({
        title: "Erro ao carregar cupons",
        description: "Não foi possível carregar os cupons. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Validar cupom
  const validateCoupon = async (code: string, orderValue: number): Promise<Models.Coupon | null> => {
    if (!restaurant?.id) return null;
    
    try {
      return await RestaurantService.validateCoupon(restaurant.id, code, orderValue);
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      toast({
        title: "Erro ao validar cupom",
        description: "Não foi possível validar o cupom. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return null;
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        settings,
        categories,
        products,
        orders,
        customers,
        reviews,
        coupons,
        updateRestaurantInfo,
        updateRestaurantSettings,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrderStatus,
        fetchOrders,
        fetchCustomers,
        fetchReviews,
        fetchCoupons,
        validateCoupon,
        isLoading,
        pagination
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
