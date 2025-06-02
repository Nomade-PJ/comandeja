import supabase from '@/lib/supabase';
import { Restaurant, Product, Category, Order, RestaurantSettings, Customer, Review, Coupon, OrderStatus } from '@/lib/models';

export class RestaurantService {
  static async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar restaurante por ID:', error);
        return null;
      }

      return data as Restaurant;
    } catch (error) {
      console.error('Erro inesperado ao buscar restaurante por ID:', error);
      return null;
    }
  }

  static async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Erro ao buscar restaurante:', error);
        return null;
      }

      return data as Restaurant;
    } catch (error) {
      console.error('Erro inesperado:', error);
      return null;
    }
  }

  static async getRestaurantSettings(restaurantId: string): Promise<RestaurantSettings | null> {
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single();

      if (error) {
        console.error('Erro ao buscar configurações do restaurante:', error);
        return null;
      }

      return data as RestaurantSettings;
    } catch (error) {
      console.error('Erro inesperado ao buscar configurações:', error);
      return null;
    }
  }

  static async updateRestaurant(id: string, info: Partial<Restaurant>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          ...info,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar restaurante:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar restaurante:', error);
      return false;
    }
  }

  static async updateRestaurantSettings(restaurantId: string, settings: Partial<RestaurantSettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurant_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.error('Erro ao atualizar configurações do restaurante:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar configurações:', error);
      return false;
    }
  }

  static async getProducts(restaurantId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true);

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }

      return data as Product[];
    } catch (error) {
      console.error('Erro inesperado:', error);
      return [];
    }
  }

  static async getCategories(restaurantId: string): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
      }

      return data as Category[];
    } catch (error) {
      console.error('Erro inesperado:', error);
      return [];
    }
  }

  static async getOrders(restaurantId: string, page: number = 1, limit: number = 20, status?: string): Promise<{ data: Order[], count: number }> {
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        return { data: [], count: 0 };
      }
      
      return { data: data as Order[], count: count || 0 };
    } catch (error) {
      console.error('Erro inesperado ao buscar pedidos:', error);
      return { data: [], count: 0 };
    }
  }

  static async getCustomers(restaurantId: string, page: number = 1, limit: number = 20, search?: string): Promise<{ data: Customer[], count: number }> {
    try {
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        return { data: [], count: 0 };
      }
      
      return { data: data as Customer[], count: count || 0 };
    } catch (error) {
      console.error('Erro inesperado ao buscar clientes:', error);
      return { data: [], count: 0 };
    }
  }

  static async getReviews(restaurantId: string, page: number = 1, limit: number = 20): Promise<{ data: Review[], count: number }> {
    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) {
        console.error('Erro ao buscar avaliações:', error);
        return { data: [], count: 0 };
      }
      
      return { data: data as Review[], count: count || 0 };
    } catch (error) {
      console.error('Erro inesperado ao buscar avaliações:', error);
      return { data: [], count: 0 };
    }
  }

  static async getCoupons(restaurantId: string, activeOnly: boolean = false): Promise<Coupon[]> {
    try {
      let query = supabase
        .from('coupons')
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (activeOnly) {
        const now = new Date().toISOString();
        query = query
          .eq('is_active', true)
          .lt('start_date', now)
          .gt('end_date', now);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar cupons:', error);
        return [];
      }
      
      return data as Coupon[];
    } catch (error) {
      console.error('Erro inesperado ao buscar cupons:', error);
      return [];
    }
  }

  static async validateCoupon(restaurantId: string, code: string, orderValue: number): Promise<Coupon | null> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('code', code)
        .eq('is_active', true)
        .lt('start_date', now)
        .gt('end_date', now)
        .lte('min_order_value', orderValue)
        .single();
      
      if (error) {
        console.error('Erro ao validar cupom:', error);
        return null;
      }
      
      return data as Coupon;
    } catch (error) {
      console.error('Erro inesperado ao validar cupom:', error);
      return null;
    }
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          status_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar status do pedido:', error);
      return false;
    }
  }
}
