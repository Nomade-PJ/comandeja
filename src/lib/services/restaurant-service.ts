import { query } from '../db';
import { 
  Restaurant, 
  RestaurantSettings, 
  Product, 
  Category, 
  Order,
  Customer,
  Review,
  Coupon
} from '../models';

/**
 * Serviço para gerenciar restaurantes e seus recursos
 */
export class RestaurantService {
  /**
   * Retorna os detalhes de um restaurante pelo ID
   * @param id ID do restaurante
   * @returns Detalhes do restaurante ou null se não existir
   */
  public static async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const result = await query(
        'SELECT * FROM restaurants WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Restaurant;
    } catch (error) {
      console.error('Erro ao buscar restaurante por ID:', error);
      return null;
    }
  }
  
  /**
   * Retorna um restaurante pelo slug
   * @param slug Slug do restaurante
   * @returns Detalhes do restaurante ou null se não existir
   */
  public static async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    try {
      const result = await query(
        'SELECT * FROM restaurants WHERE slug = $1',
        [slug]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Restaurant;
    } catch (error) {
      console.error('Erro ao buscar restaurante por slug:', error);
      return null;
    }
  }

  /**
   * Retorna todos os restaurantes de um proprietário
   * @param ownerId ID do proprietário
   * @returns Lista de restaurantes
   */
  public static async getRestaurantsByOwnerId(ownerId: string): Promise<Restaurant[]> {
    try {
      const result = await query(
        'SELECT * FROM restaurants WHERE owner_id = $1 ORDER BY name',
        [ownerId]
      );
      
      return result.rows as Restaurant[];
    } catch (error) {
      console.error('Erro ao buscar restaurantes do proprietário:', error);
      return [];
    }
  }

  /**
   * Atualiza as informações de um restaurante
   * @param id ID do restaurante
   * @param data Dados a serem atualizados
   * @returns Verdadeiro se atualizado com sucesso
   */
  public static async updateRestaurant(id: string, data: Partial<Restaurant>): Promise<boolean> {
    try {
      // Remover campos que não devem ser atualizados
      const { id: _, owner_id, created_at, updated_at, ...updateData } = data as any;
      
      // Construir a query dinâmica
      const keys = Object.keys(updateData);
      if (keys.length === 0) return true;
      
      const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
      const values = Object.values(updateData);
      
      const result = await query(
        `UPDATE restaurants SET ${setClause}, updated_at = NOW() WHERE id = $1`,
        [id, ...values]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      return false;
    }
  }

  /**
   * Busca as configurações de um restaurante
   * @param restaurantId ID do restaurante
   * @returns Configurações do restaurante ou null se não existir
   */
  public static async getRestaurantSettings(restaurantId: string): Promise<RestaurantSettings | null> {
    try {
      const result = await query(
        'SELECT * FROM restaurant_settings WHERE restaurant_id = $1',
        [restaurantId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as RestaurantSettings;
    } catch (error) {
      console.error('Erro ao buscar configurações do restaurante:', error);
      return null;
    }
  }

  /**
   * Atualiza as configurações de um restaurante
   * @param restaurantId ID do restaurante
   * @param data Dados a serem atualizados
   * @returns Verdadeiro se atualizado com sucesso
   */
  public static async updateRestaurantSettings(restaurantId: string, data: Partial<RestaurantSettings>): Promise<boolean> {
    try {
      // Remover campos que não devem ser atualizados
      const { restaurant_id, updated_at, ...updateData } = data as any;
      
      // Construir a query dinâmica
      const keys = Object.keys(updateData);
      if (keys.length === 0) return true;
      
      const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
      const values = Object.values(updateData);
      
      const result = await query(
        `UPDATE restaurant_settings SET ${setClause}, updated_at = NOW() WHERE restaurant_id = $1`,
        [restaurantId, ...values]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Erro ao atualizar configurações do restaurante:', error);
      return false;
    }
  }

  /**
   * Busca todas as categorias de um restaurante
   * @param restaurantId ID do restaurante
   * @param activeOnly Se verdadeiro, retorna apenas categorias ativas
   * @returns Lista de categorias
   */
  public static async getCategories(restaurantId: string, activeOnly: boolean = false): Promise<Category[]> {
    try {
      let sql = 'SELECT * FROM categories WHERE restaurant_id = $1';
      const params = [restaurantId];
      
      if (activeOnly) {
        sql += ' AND is_active = true';
      }
      
      sql += ' ORDER BY sort_order, name';
      
      const result = await query(sql, params);
      
      return result.rows as Category[];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Busca todos os produtos de um restaurante
   * @param restaurantId ID do restaurante
   * @param categoryId ID da categoria (opcional)
   * @param activeOnly Se verdadeiro, retorna apenas produtos ativos
   * @returns Lista de produtos
   */
  public static async getProducts(
    restaurantId: string, 
    categoryId?: string, 
    activeOnly: boolean = false
  ): Promise<Product[]> {
    try {
      let sql = 'SELECT * FROM products WHERE restaurant_id = $1';
      const params: any[] = [restaurantId];
      
      if (categoryId) {
        sql += ' AND category_id = $2';
        params.push(categoryId);
      }
      
      if (activeOnly) {
        sql += ' AND is_active = true';
      }
      
      sql += ' ORDER BY name';
      
      const result = await query(sql, params);
      
      return result.rows as Product[];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  /**
   * Busca os pedidos de um restaurante
   * @param restaurantId ID do restaurante
   * @param page Número da página
   * @param limit Limite de itens por página
   * @param status Status para filtrar (opcional)
   * @returns Lista de pedidos paginados
   */
  public static async getOrders(
    restaurantId: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ orders: Order[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      let countSql = 'SELECT COUNT(*) FROM orders WHERE restaurant_id = $1';
      let dataSql = 'SELECT * FROM orders WHERE restaurant_id = $1';
      const params: any[] = [restaurantId];
      
      if (status) {
        countSql += ' AND status = $2';
        dataSql += ' AND status = $2';
        params.push(status);
      }
      
      dataSql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      
      const countResult = await query(countSql, params);
      const dataResult = await query(dataSql, [...params, limit, offset]);
      
      return {
        orders: dataResult.rows as Order[],
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return { orders: [], total: 0 };
    }
  }

  /**
   * Busca os clientes de um restaurante
   * @param restaurantId ID do restaurante
   * @param page Número da página
   * @param limit Limite de itens por página
   * @param search Termo de busca (opcional)
   * @returns Lista de clientes paginados
   */
  public static async getCustomers(
    restaurantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ customers: Customer[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      let countSql = 'SELECT COUNT(*) FROM customers WHERE restaurant_id = $1';
      let dataSql = 'SELECT * FROM customers WHERE restaurant_id = $1';
      const params: any[] = [restaurantId];
      
      if (search) {
        countSql += ' AND (name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2)';
        dataSql += ' AND (name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2)';
        params.push(`%${search}%`);
      }
      
      dataSql += ' ORDER BY name LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      
      const countResult = await query(countSql, params);
      const dataResult = await query(dataSql, [...params, limit, offset]);
      
      return {
        customers: dataResult.rows as Customer[],
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return { customers: [], total: 0 };
    }
  }

  /**
   * Busca as avaliações de um restaurante
   * @param restaurantId ID do restaurante
   * @param page Número da página
   * @param limit Limite de itens por página
   * @returns Lista de avaliações paginadas
   */
  public static async getReviews(
    restaurantId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ reviews: Review[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      const countSql = 'SELECT COUNT(*) FROM reviews WHERE restaurant_id = $1';
      const dataSql = 'SELECT * FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      
      const countResult = await query(countSql, [restaurantId]);
      const dataResult = await query(dataSql, [restaurantId, limit, offset]);
      
      return {
        reviews: dataResult.rows as Review[],
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return { reviews: [], total: 0 };
    }
  }

  /**
   * Busca os cupons de um restaurante
   * @param restaurantId ID do restaurante
   * @param activeOnly Se verdadeiro, retorna apenas cupons ativos
   * @returns Lista de cupons
   */
  public static async getCoupons(restaurantId: string, activeOnly: boolean = false): Promise<Coupon[]> {
    try {
      let sql = 'SELECT * FROM coupons WHERE restaurant_id = $1';
      const params = [restaurantId];
      
      if (activeOnly) {
        sql += ' AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())';
      }
      
      sql += ' ORDER BY created_at DESC';
      
      const result = await query(sql, params);
      
      return result.rows as Coupon[];
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      return [];
    }
  }

  /**
   * Valida um cupom para um restaurante
   * @param restaurantId ID do restaurante
   * @param code Código do cupom
   * @param orderValue Valor do pedido
   * @returns Detalhes do cupom se válido, ou null
   */
  public static async validateCoupon(
    restaurantId: string,
    code: string,
    orderValue: number
  ): Promise<Coupon | null> {
    try {
      const result = await query(
        `SELECT * FROM coupons 
         WHERE restaurant_id = $1 
         AND code = $2 
         AND is_active = true 
         AND (expires_at IS NULL OR expires_at > NOW()) 
         AND (usage_limit IS NULL OR usage_count < usage_limit)
         AND min_order_value <= $3`,
        [restaurantId, code, orderValue]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Coupon;
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return null;
    }
  }
} 