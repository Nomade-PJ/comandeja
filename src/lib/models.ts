/**
 * Interfaces de modelos de dados para o ComandeJá, adaptadas para trabalhar com Supabase
 */

// Usuário (proprietário de restaurante)
export interface User {
  id: string;
  email: string;
  password_hash?: string;  // Omitido durante envio para o cliente
  name: string;
  created_at: Date;
  last_login?: Date;
  is_active: boolean;
  reset_password_token?: string;
  reset_password_expires?: Date;
  // Campos adicionais para a aplicação
  restaurantId?: string;  // ID do restaurante associado
  restaurantSlug?: string; // Slug do restaurante associado
  role?: 'owner' | 'customer' | 'team_member';
}

// Restaurante
export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  address?: string;
  opening_hours?: string;
  logo_url?: string;
  banner_url?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  // Documentos
  document_type?: string;
  document_number?: string;
  // Campos de compatibilidade
  logo?: string;
  openingHours?: string;
}

// Configurações do restaurante
export interface RestaurantSettings {
  restaurant_id: string;
  min_order_value: number;
  delivery_fee: number;
  delivery_time_min: number;
  delivery_time_max: number;
  accept_orders: boolean;
  accept_scheduled_orders: boolean;
  auto_confirm_orders: boolean;
  accept_credit_card: boolean;
  accept_debit_card: boolean;
  accept_pix: boolean;
  accept_cash: boolean;
  pix_key?: string;
  delivery_radius: number;
  has_delivery_fee_by_distance: boolean;
  self_pickup: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sound_alerts: boolean;
  new_order_notification: boolean;
  status_change_notification: boolean;
  updated_at: Date;
}

// Taxas de entrega por distância
export interface DeliveryFee {
  id: string;
  restaurant_id: string;
  min_distance: number;
  max_distance: number;
  fee: number;
}

// Categoria de produtos
export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// Produto
export interface Product {
  id: string;
  restaurant_id?: string;  // Tornando opcional para compatibilidade com mock products
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
  has_variations?: boolean;
  preparation_time?: number;
  created_at?: Date;
  updated_at?: Date;
  // Campos de compatibilidade
  available?: boolean;
  imageUrl?: string;
  categoryId?: string;
}

// Interface para objetos de produto mock (usado em CustomerRestaurantView)
export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  available: boolean;
}

// Item de pedido
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variation_id?: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  // Campos de compatibilidade
  product?: Product;
  price?: number;
  productId?: string;
}

// Status de pedido
export type OrderStatus = 
  'pending' | 
  'confirmed' | 
  'preparing' | 
  'ready' | 
  'out_for_delivery' | 
  'delivered' | 
  'canceled';

// Status de pagamento
export type PaymentStatus = 
  'pending' | 
  'approved' | 
  'rejected' | 
  'refunded';

// Método de pagamento
export type PaymentMethod = 
  'credit_card' | 
  'debit_card' | 
  'pix' | 
  'cash';

// Método de entrega
export type DeliveryMethod = 
  'delivery' | 
  'pickup';

// Pedido
export interface Order {
  id: string;
  restaurant_id: string;
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_method: DeliveryMethod;
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  estimated_delivery_time?: Date;
  delivery_driver_id?: string;
  notes?: string;
  scheduled_for?: Date;
  created_at: Date;
  updated_at: Date;
  // Campos de compatibilidade para o frontend
  customerName?: string;
  customerPhone?: string;
  deliveryType?: string;
  items?: OrderItem[];
  totalAmount?: number;
  createdAt?: Date; // Campo de compatibilidade para código existente
}

// Interface para criar pedidos no MenuPage
export interface OrderCreateInput {
  restaurant_id: string;
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_method: DeliveryMethod;
  delivery_address?: string;
  customer_name: string;
  customer_phone: string;
  notes?: string;
  items?: OrderItem[];
}

// Cliente
export interface Customer {
  id: string;
  restaurant_id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  last_order_at?: Date;
  total_orders: number;
  total_spent: number;
  password_hash?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
}

// Avaliação de cliente
export interface Review {
  id: string;
  restaurant_id: string;
  order_id?: string;
  customer_id: string;
  rating: number;
  comment?: string;
  response?: string;
  response_date?: Date;
  created_at: Date;
  is_approved: boolean;
  // Campos adicionais
  customer_name?: string;
}

// Tipo de desconto de cupom
export type DiscountType = 'percentage' | 'fixed';

// Cupom de desconto
export interface Coupon {
  id: string;
  restaurant_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  starts_at: Date;
  expires_at?: Date;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  created_at: Date;
}
