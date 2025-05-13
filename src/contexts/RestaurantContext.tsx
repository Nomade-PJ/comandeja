import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { RestaurantService } from '@/lib/services/restaurant-service';
import * as Models from '@/lib/models';

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
    // Esta função precisa ser implementada no RestaurantService
    // Por enquanto, apenas simulamos
    return null;
  };

  // Atualizar categoria
  const updateCategory = async (category: Category): Promise<boolean> => {
    // Esta função precisa ser implementada no RestaurantService
    // Por enquanto, apenas simulamos
    return false;
  };

  // Excluir categoria
  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    // Esta função precisa ser implementada no RestaurantService
    // Por enquanto, apenas simulamos
    return false;
  };

  // Adicionar produto
  const addProduct = async (product: Omit<Product, 'id'>): Promise<string | null> => {
    // Esta função precisa ser implementada no RestaurantService
    // Por enquanto, apenas simulamos
    return null;
  };

  // Atualizar produto
  const updateProduct = async (product: Product): Promise<boolean> => {
    // Esta função precisa ser implementada no RestaurantService
    // Por enquanto, apenas simulamos
    return false;
  };

  // Excluir produto
  const deleteProduct = async (productId: string): Promise<boolean> => {
    // Esta função precisa ser implementada no RestaurantService
    // Por enquanto, apenas simulamos
    return false;
  };

  // Adicionar pedido
  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    // Esta função precisa ser implementada no RestaurantService
    // Por enquanto, apenas simulamos
    return null;
  };

  // Atualizar status do pedido
  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string): Promise<boolean> => {
    // Esta função precisa ser implementada no RestaurantService
    // Por enquanto, apenas simulamos
    return false;
  };
  
  // Buscar pedidos (com paginação)
  const fetchOrders = async (page: number = 1, limit: number = 20, status?: string): Promise<void> => {
    if (!restaurant?.id) return;
    
    setIsLoading(true);
    try {
      const result = await RestaurantService.getOrders(restaurant.id, page, limit, status);
      setOrders(result.orders);
      
      setPagination(prev => ({
        ...prev,
        orders: {
          page,
          total: result.total,
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
      setCustomers(result.customers);
      
      setPagination(prev => ({
        ...prev,
        customers: {
          page,
          total: result.total,
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
      setReviews(result.reviews);
      
      setPagination(prev => ({
        ...prev,
        reviews: {
          page,
          total: result.total,
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
      const result = await RestaurantService.getCoupons(restaurant.id, activeOnly);
      setCoupons(result);
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
      const coupon = await RestaurantService.validateCoupon(restaurant.id, code, orderValue);
      return coupon;
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
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
