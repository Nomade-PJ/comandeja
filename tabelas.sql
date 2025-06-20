-- ========================================
-- SISTEMA COMANDEJÁ - ESTRUTURA DO BANCO
-- ========================================
-- Este arquivo contém todas as tabelas do sistema ComandeJá
-- Para uso em projetos futuros e referência

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed', 
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

CREATE TYPE payment_method AS ENUM (
  'credit_card',
  'debit_card',
  'pix',
  'cash',
  'voucher'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE TYPE delivery_method AS ENUM (
  'delivery',
  'pickup'
);

CREATE TYPE user_role AS ENUM (
  'admin',
  'restaurant_owner',
  'customer'
);

-- ========================================
-- TABELA DE PERFIS DE USUÁRIOS
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA DE RESTAURANTES
-- ========================================
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  logo_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN DEFAULT true,
  opening_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CONFIGURAÇÕES DO RESTAURANTE
-- ========================================
CREATE TABLE public.restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  minimum_order_value DECIMAL DEFAULT 0,
  delivery_fee DECIMAL DEFAULT 0,
  delivery_radius DECIMAL DEFAULT 10,
  estimated_delivery_time INTEGER DEFAULT 30,
  accepts_orders BOOLEAN DEFAULT true,
  accepted_payment_methods TEXT[] DEFAULT ARRAY['credit_card', 'debit_card', 'pix', 'cash'],
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id)
);

-- ========================================
-- CATEGORIAS DE PRODUTOS
-- ========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PRODUTOS
-- ========================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 15,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- OPÇÕES DE PRODUTOS
-- ========================================
CREATE TABLE public.product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- VALORES DE OPÇÕES DE PRODUTOS
-- ========================================
CREATE TABLE public.product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES public.product_options(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment DECIMAL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CLIENTES
-- ========================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL DEFAULT 0,
  last_order_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CUPONS DE DESCONTO
-- ========================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL NOT NULL CHECK (discount_value > 0),
  minimum_order_value DECIMAL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, code)
);

-- ========================================
-- PEDIDOS
-- ========================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL NOT NULL CHECK (subtotal >= 0),
  delivery_fee DECIMAL DEFAULT 0,
  discount_amount DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL CHECK (total >= 0),
  payment_method payment_method,
  payment_status payment_status DEFAULT 'pending',
  delivery_method delivery_method NOT NULL,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_zip_code TEXT,
  delivery_latitude DECIMAL,
  delivery_longitude DECIMAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  notes TEXT,
  coupon_code TEXT,
  estimated_delivery_time INTEGER,
  scheduled_delivery_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ITENS DOS PEDIDOS
-- ========================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_price DECIMAL NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL NOT NULL,
  total_price DECIMAL NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- AVALIAÇÕES
-- ========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ESTATÍSTICAS DO DASHBOARD
-- ========================================
CREATE TABLE public.dashboard_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  average_order_value DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, date)
);

-- ========================================
-- TEMAS DE RESTAURANTES
-- ========================================
CREATE TABLE public.restaurant_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  accent_color TEXT DEFAULT '#F59E0B',
  text_color TEXT DEFAULT '#111827',
  background_color TEXT DEFAULT '#F9FAFB',
  font_family TEXT DEFAULT 'Inter, sans-serif',
  logo_position TEXT DEFAULT 'center',
  banner_style TEXT DEFAULT 'full',
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ========================================

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_themes ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Políticas para restaurants
CREATE POLICY "Restaurant owners can manage their restaurants" ON public.restaurants
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Public can view active restaurants" ON public.restaurants
  FOR SELECT USING (is_active = true);

-- Políticas para restaurant_settings
CREATE POLICY "Restaurant owners can manage their settings" ON public.restaurant_settings
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Políticas para categories
CREATE POLICY "Restaurant owners can manage their categories" ON public.categories
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (
    is_active = true AND 
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE is_active = true
    )
  );

-- Políticas para products
CREATE POLICY "Restaurant owners can manage their products" ON public.products
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (
    is_active = true AND 
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE is_active = true
    )
  );

-- Políticas para product_options
CREATE POLICY "Restaurant owners can manage their product options" ON public.product_options
  FOR ALL USING (product_id IN (
    SELECT id FROM public.products WHERE restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  ));
CREATE POLICY "Public can view product options" ON public.product_options
  FOR SELECT USING (product_id IN (
    SELECT id FROM public.products WHERE is_active = true AND restaurant_id IN (
      SELECT id FROM public.restaurants WHERE is_active = true
    )
  ));

-- Políticas para product_option_values
CREATE POLICY "Restaurant owners can manage their product option values" ON public.product_option_values
  FOR ALL USING (option_id IN (
    SELECT id FROM public.product_options WHERE product_id IN (
      SELECT id FROM public.products WHERE restaurant_id IN (
        SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
      )
    )
  ));
CREATE POLICY "Public can view product option values" ON public.product_option_values
  FOR SELECT USING (option_id IN (
    SELECT id FROM public.product_options WHERE product_id IN (
      SELECT id FROM public.products WHERE is_active = true AND restaurant_id IN (
        SELECT id FROM public.restaurants WHERE is_active = true
      )
    )
  ));

-- Políticas para customers
CREATE POLICY "Restaurant owners can manage their customers" ON public.customers
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Políticas para coupons
CREATE POLICY "Restaurant owners can manage their coupons" ON public.coupons
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Políticas para orders
CREATE POLICY "Restaurant owners can manage their orders" ON public.orders
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));
CREATE POLICY "Public can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE id = auth.uid()
    )
  );

-- Políticas para order_items
CREATE POLICY "Restaurant owners can view their order items" ON public.order_items
  FOR SELECT USING (order_id IN (
    SELECT o.id FROM public.orders o
    JOIN public.restaurants r ON o.restaurant_id = r.id
    WHERE r.owner_id = auth.uid()
  ));
CREATE POLICY "Public can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Políticas para reviews
CREATE POLICY "Restaurant owners can manage reviews for their restaurants" ON public.reviews
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));
CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Public can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);

-- Políticas para dashboard_statistics
CREATE POLICY "Restaurant owners can manage their statistics" ON public.dashboard_statistics
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Políticas para restaurant_themes
CREATE POLICY "Restaurant owners can manage their theme" ON public.restaurant_themes
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));
CREATE POLICY "Public can view restaurant themes" ON public.restaurant_themes
  FOR SELECT USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE is_active = true
  ));

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX idx_restaurants_owner_id ON public.restaurants(owner_id);
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX idx_products_restaurant_id ON public.products(restaurant_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_product_options_product_id ON public.product_options(product_id);
CREATE INDEX idx_product_option_values_option_id ON public.product_option_values(option_id);
CREATE INDEX idx_customers_restaurant_id ON public.customers(restaurant_id);
CREATE INDEX idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_reviews_restaurant_id ON public.reviews(restaurant_id);
CREATE INDEX idx_dashboard_statistics_restaurant_date ON public.dashboard_statistics(restaurant_id, date);

-- ========================================
-- FUNÇÕES E TRIGGERS
-- ========================================

-- Função para gerar slugs automáticos para restaurantes
CREATE OR REPLACE FUNCTION public.generate_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Converter para minúsculas e substituir caracteres especiais
  base_slug := LOWER(name);
  base_slug := REPLACE(base_slug, ' ', '-');
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\-]', '', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '\-+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Verificar se o slug já existe
  final_slug := base_slug;
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.restaurants WHERE slug = final_slug
    );
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar slug automaticamente se não for fornecido
CREATE OR REPLACE FUNCTION public.set_restaurant_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger para gerar slug
DROP TRIGGER IF EXISTS set_restaurant_slug_trigger ON public.restaurants;
CREATE TRIGGER set_restaurant_slug_trigger
  BEFORE INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_restaurant_slug();

-- Função para registrar novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT DO UPDATE para lidar com possíveis conflitos de email
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (CASE 
        WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL AND NEW.raw_user_meta_data->>'role' != '' 
        THEN NEW.raw_user_meta_data->>'role'
        ELSE 'customer'
      END)::user_role,
      'customer'::user_role
    )
  )
  ON CONFLICT (email) DO UPDATE SET
    id = NEW.id,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
    role = COALESCE(
      (CASE 
        WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL AND NEW.raw_user_meta_data->>'role' != '' 
        THEN NEW.raw_user_meta_data->>'role'
        ELSE profiles.role::text
      END)::user_role,
      profiles.role
    ),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log o erro mas não falhe a transação
    RAISE WARNING 'Erro em handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurant_settings_updated_at BEFORE UPDATE ON public.restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_options_updated_at BEFORE UPDATE ON public.product_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_option_values_updated_at BEFORE UPDATE ON public.product_option_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dashboard_statistics_updated_at BEFORE UPDATE ON public.dashboard_statistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurant_themes_updated_at BEFORE UPDATE ON public.restaurant_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar números de pedido
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Sequência para números de pedido
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Função para atualizar estatísticas do cliente
CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.customers
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total,
      last_order_at = NEW.created_at
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas do cliente
CREATE TRIGGER update_customer_stats_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_stats();

-- Função para atualizar automaticamente as estatísticas do dashboard
CREATE OR REPLACE FUNCTION public.update_dashboard_statistics()
RETURNS TRIGGER AS $$
DECLARE
  order_date DATE;
  restaurant_id UUID;
  total_revenue DECIMAL;
  avg_order_value DECIMAL;
  total_orders INTEGER;
  total_customers INTEGER;
BEGIN
  -- Definir variáveis
  order_date := DATE(NEW.created_at);
  restaurant_id := NEW.restaurant_id;
  
  -- Calcular estatísticas
  SELECT 
    COUNT(DISTINCT o.id) AS orders_count,
    COUNT(DISTINCT o.customer_id) AS customers_count,
    COALESCE(SUM(o.total), 0) AS revenue_sum,
    CASE 
      WHEN COUNT(DISTINCT o.id) > 0 THEN COALESCE(SUM(o.total), 0) / COUNT(DISTINCT o.id)
      ELSE 0
    END AS avg_order
  INTO total_orders, total_customers, total_revenue, avg_order_value
  FROM public.orders o
  WHERE o.restaurant_id = restaurant_id
  AND DATE(o.created_at) = order_date;
  
  -- Inserir ou atualizar estatísticas
  INSERT INTO public.dashboard_statistics (
    restaurant_id, date, total_orders, total_revenue, 
    total_customers, average_order_value
  )
  VALUES (
    restaurant_id, order_date, total_orders, total_revenue,
    total_customers, avg_order_value
  )
  ON CONFLICT (restaurant_id, date) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    total_customers = EXCLUDED.total_customers,
    average_order_value = EXCLUDED.average_order_value,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger para atualizar estatísticas
DROP TRIGGER IF EXISTS update_dashboard_statistics_trigger ON public.orders;
CREATE TRIGGER update_dashboard_statistics_trigger
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_dashboard_statistics();

-- ========================================
-- POLÍTICAS DE SEGURANÇA (RLS) ADICIONAIS
-- ========================================

-- Políticas RLS alternativas (usando EXISTS em vez de IN)
CREATE POLICY "Restaurant owners can view their own restaurant (alt)" ON public.restaurants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() 
    AND public.profiles.role = 'restaurant_owner'
    AND public.restaurants.owner_id = public.profiles.id
  )
);

CREATE POLICY "Restaurant owners can update their own restaurant (alt)" ON public.restaurants
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() 
    AND public.profiles.role = 'restaurant_owner'
    AND public.restaurants.owner_id = public.profiles.id
  )
);

-- Políticas alternativas para categorias
CREATE POLICY "Restaurant owners can manage their categories (alt)" ON public.categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE r.id = public.categories.restaurant_id 
    AND r.owner_id = p.id
    AND p.role = 'restaurant_owner'
  )
);

-- Políticas alternativas para produtos
CREATE POLICY "Restaurant owners can manage their products (alt)" ON public.products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE r.id = public.products.restaurant_id 
    AND r.owner_id = p.id
    AND p.role = 'restaurant_owner'
  )
);

-- Políticas alternativas para pedidos
CREATE POLICY "Restaurant owners can manage their orders (alt)" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE r.id = public.orders.restaurant_id 
    AND r.owner_id = p.id
    AND p.role = 'restaurant_owner'
  )
);

-- Políticas alternativas para itens de pedidos
CREATE POLICY "Restaurant owners can manage their order items (alt)" ON public.order_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.restaurants r ON r.id = o.restaurant_id
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE o.id = public.order_items.order_id 
    AND r.owner_id = p.id
    AND p.role = 'restaurant_owner'
  )
);

-- Políticas alternativas para clientes
CREATE POLICY "Restaurant owners can manage their customers (alt)" ON public.customers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE r.id = public.customers.restaurant_id 
    AND r.owner_id = p.id
    AND p.role = 'restaurant_owner'
  )
);

-- Políticas alternativas para avaliações
CREATE POLICY "Restaurant owners can manage their reviews (alt)" ON public.reviews
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE r.id = public.reviews.restaurant_id 
    AND r.owner_id = p.id
    AND p.role = 'restaurant_owner'
  )
);

-- Políticas alternativas para configurações do restaurante
CREATE POLICY "Restaurant owners can manage their settings (alt)" ON public.restaurant_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE r.id = public.restaurant_settings.restaurant_id 
    AND r.owner_id = p.id
    AND p.role = 'restaurant_owner'
  )
);
