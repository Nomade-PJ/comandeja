/**
 * Interfaces de modelos de dados para o ComandeJá, baseados na estrutura do PostgreSQL
 * Estas interfaces refletem as tabelas do banco de dados
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
  // Campos adicionais para a aplicação (não estão na tabela)
  restaurantId?: string;  // ID do restaurante associado
  restaurantSlug?: string; // Slug do restaurante associado
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
  restaurant_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  has_variations: boolean;
  preparation_time?: number;
  created_at: Date;
  updated_at: Date;
}

// Variações de produto
export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
}

// Grupo de opções de produto
export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  sort_order: number;
}

// Item de opção de produto
export interface OptionItem {
  id: string;
  option_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
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
}

// Opção selecionada para item de pedido
export interface OrderItemOption {
  id: string;
  order_item_id: string;
  option_item_id: string;
  name: string;
  price: number;
}

// Histórico de status de pedido
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes?: string;
  created_by?: string;
  created_at: Date;
}

// Rastreamento de pedido
export interface OrderTracking {
  id: string;
  order_id: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: Date;
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
}

// Usuário administrador do sistema
export interface AdminUser {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  role: string;
  created_at: Date;
  last_login?: Date;
  is_active: boolean;
}

// Plano de assinatura
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features?: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Assinatura
export interface Subscription {
  id: string;
  restaurant_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: Date;
  current_period_end: Date;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Pagamento
export interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_date: Date;
  invoice_url?: string;
  created_at: Date;
}

// Ticket de suporte
export interface SupportTicket {
  id: string;
  restaurant_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

// Mensagem de ticket
export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'restaurant' | 'admin';
  sender_id: string;
  message: string;
  created_at: Date;
}

// Notificação
export interface Notification {
  id: string;
  recipient_type: 'restaurant' | 'admin' | 'customer';
  recipient_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  action_url?: string;
  created_at: Date;
}

// Função de membro da equipe
export type TeamMemberRole = 'manager' | 'attendant' | 'kitchen' | 'delivery';

// Membro da equipe
export interface TeamMember {
  id: string;
  restaurant_id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: TeamMemberRole;
  is_active: boolean;
  created_at: Date;
  last_login?: Date;
} 