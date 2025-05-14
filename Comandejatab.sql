-- ############################################################
-- #          ComandeJá - Consolidated Database Schema            #
-- ############################################################

-- This file contains all database objects for the ComandeJá SaaS platform
-- Organized by dependency order: extensions, functions, tables, triggers, indexes, and initial data

-- ================================
-- SECTION 1: EXTENSIONS
-- ================================

-- Create pgcrypto extension needed for UUID and password encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================
-- SECTION 2: UTILITY FUNCTIONS
-- ================================

-- Function to automatically update timestamp columns
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- SECTION 3: CORE TABLES
-- ================================

-- Users table - stores all application users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMP WITH TIME ZONE
);

-- Admin users table - stores system administrators
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Restaurants table - stores restaurant information
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  phone TEXT,
  address TEXT,
  opening_hours TEXT,
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT restaurant_slug_format CHECK (slug ~* '^[a-z0-9\-]+$')
);

-- Notifications table - stores system notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL,  -- 'restaurant', 'admin', 'customer'
  recipient_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'info', 'warning', 'error', 'success'
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table - stores available subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL,  -- 'monthly', 'six-months', 'yearly'
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history table - tracks subscription plan price changes
CREATE TABLE IF NOT EXISTS subscription_plan_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  previous_price DECIMAL(10,2) NOT NULL,
  new_price DECIMAL(10,2) NOT NULL,
  change_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID REFERENCES admin_users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods table - stores user payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL, -- 'credit_card', 'debit_card', 'pix', 'bank_account'
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Credit/debit card information
  card_last_four TEXT,
  card_brand TEXT,
  card_holder_name TEXT,
  card_expiry_month TEXT,
  card_expiry_year TEXT,
  card_token TEXT,
  
  -- PIX information
  pix_key_type TEXT, -- 'cpf', 'cnpj', 'email', 'phone', 'random'
  pix_key TEXT,
  
  -- Bank account information
  bank_code TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch_number TEXT,
  bank_account_type TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Subscriptions table - stores customer subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'cancelled', 'expired'
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  contracted_price DECIMAL(10,2),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'six-months', 'yearly'
  next_billing_date TIMESTAMP WITH TIME ZONE,
  payment_method_id UUID REFERENCES payment_methods(id),
  trial_id UUID, -- Will be properly referenced after trial_periods table is created
  cancellation_reason TEXT,
  auto_renew BOOLEAN DEFAULT TRUE,
  renewal_reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trial periods table - stores free trial periods information
CREATE TABLE IF NOT EXISTS trial_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'converted', 'cancelled'
  converted_to_subscription BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMP WITH TIME ZONE,
  subscription_id UUID REFERENCES subscriptions(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id)
);

-- Add foreign key reference from subscriptions to trial_periods now that both tables exist
ALTER TABLE subscriptions
ADD CONSTRAINT fk_subscriptions_trial_id
FOREIGN KEY (trial_id) REFERENCES trial_periods(id);

-- Promotions table - stores promotional discounts and offers
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value DECIMAL(10,2) NOT NULL,
  applies_to TEXT NOT NULL, -- 'all_plans', 'monthly', 'six-months', 'yearly', specific plan IDs
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotion uses table - tracks which users have used promotions
CREATE TABLE IF NOT EXISTS promotion_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  subscription_id UUID REFERENCES subscriptions(id),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table - stores payment transaction records
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  gateway TEXT NOT NULL, -- 'mercadopago', 'stripe', 'pagseguro', etc.
  gateway_transaction_id TEXT,
  gateway_response JSONB,
  pix_qr_code TEXT,
  pix_expiration_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- SECTION 4: FUNCTIONS
-- ================================

-- Price change logging function - logs when a plan's price changes
CREATE OR REPLACE FUNCTION log_subscription_plan_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price <> NEW.price THEN
    INSERT INTO subscription_plan_price_history (
      plan_id,
      previous_price,
      new_price,
      change_date
    ) VALUES (
      NEW.id,
      OLD.price,
      NEW.price,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Payment method default function - ensures only one default method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE payment_methods 
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
    AND id <> NEW.id
    AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trial expiration function - checks for expired trials and sends notifications
CREATE OR REPLACE FUNCTION check_expired_trials()
RETURNS void AS $$
BEGIN
  -- Update trials that have expired
  UPDATE trial_periods
  SET status = 'completed', updated_at = NOW()
  WHERE status = 'active'
  AND end_date < NOW()
  AND converted_to_subscription = FALSE;
  
  -- Notify restaurants with trials expiring in 24 hours
  INSERT INTO notifications (
    recipient_type,
    recipient_id,
    title,
    message,
    type,
    action_url
  )
  SELECT 
    'restaurant',
    restaurant_id,
    'Seu período de teste está expirando',
    'Seu período de teste gratuito termina em menos de 24 horas. Assine um plano para continuar usando todos os recursos.',
    'warning',
    '/subscribe'
  FROM trial_periods
  WHERE status = 'active'
  AND end_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
  AND NOT EXISTS (
    SELECT 1 FROM notifications 
    WHERE recipient_type = 'restaurant' 
    AND recipient_id = trial_periods.restaurant_id
    AND title = 'Seu período de teste está expirando'
    AND created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

-- Notification read marking function
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_recipient_type TEXT,
  p_recipient_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all notifications as read
    UPDATE notifications
    SET read = TRUE
    WHERE recipient_type = p_recipient_type
    AND recipient_id = p_recipient_id
    AND read = FALSE;
  ELSE
    -- Mark only specified notifications as read
    UPDATE notifications
    SET read = TRUE
    WHERE recipient_type = p_recipient_type
    AND recipient_id = p_recipient_id
    AND id = ANY(p_notification_ids)
    AND read = FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Next billing date calculation function
CREATE OR REPLACE FUNCTION calculate_next_billing_date(current_period_end TIMESTAMP, billing_cycle TEXT)
RETURNS TIMESTAMP AS $$
BEGIN
  IF billing_cycle = 'monthly' THEN
    RETURN current_period_end + INTERVAL '1 month';
  ELSIF billing_cycle = 'six-months' THEN
    RETURN current_period_end + INTERVAL '6 months';
  ELSIF billing_cycle = 'yearly' THEN
    RETURN current_period_end + INTERVAL '1 year';
  ELSE
    RETURN current_period_end + INTERVAL '1 month';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Renewal reminder function - sends notifications for upcoming renewals
CREATE OR REPLACE FUNCTION send_renewal_reminders()
RETURNS void AS $$
BEGIN
  -- Mark subscriptions approaching renewal
  UPDATE subscriptions
  SET renewal_reminder_sent = TRUE
  WHERE status = 'active'
  AND auto_renew = TRUE
  AND renewal_reminder_sent = FALSE
  AND next_billing_date BETWEEN NOW() AND NOW() + INTERVAL '3 days';
  
  -- Send notifications to those restaurants
  INSERT INTO notifications (
    recipient_type,
    recipient_id,
    title,
    message,
    type,
    action_url
  )
  SELECT 
    'restaurant',
    restaurant_id,
    'Renovação de assinatura em breve',
    'Sua assinatura será renovada automaticamente em breve. Acesse as configurações da conta para revisar seu plano.',
    'info',
    '/account/subscription'
  FROM subscriptions
  WHERE status = 'active'
  AND auto_renew = TRUE
  AND renewal_reminder_sent = TRUE
  AND next_billing_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
  AND NOT EXISTS (
    SELECT 1 FROM notifications 
    WHERE recipient_type = 'restaurant' 
    AND recipient_id = subscriptions.restaurant_id
    AND title = 'Renovação de assinatura em breve'
    AND created_at > NOW() - INTERVAL '3 days'
  );
END;
$$ LANGUAGE plpgsql;

-- Promotion validation function
CREATE OR REPLACE FUNCTION is_promotion_valid(
  promotion_id UUID, 
  user_id UUID,
  plan_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  promo RECORD;
  uses_count INTEGER;
BEGIN
  -- Get promotion details
  SELECT * INTO promo 
  FROM promotions 
  WHERE id = promotion_id;
  
  -- Check if promotion exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if active
  IF NOT promo.is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check date validity
  IF NOW() < promo.start_date OR NOW() > promo.end_date THEN
    RETURN FALSE;
  END IF;
  
  -- Check usage limit
  IF promo.max_uses IS NOT NULL AND promo.current_uses >= promo.max_uses THEN
    RETURN FALSE;
  END IF;
  
  -- Check if applies to this plan
  IF promo.applies_to <> 'all_plans' AND promo.applies_to <> plan_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already used this promotion
  SELECT COUNT(*) INTO uses_count
  FROM promotion_uses
  WHERE promotion_id = promo.id AND user_id = is_promotion_valid.user_id;
  
  IF uses_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trial period creation function - creates trial when restaurant is created
CREATE OR REPLACE FUNCTION create_trial_period_on_restaurant_creation()
RETURNS TRIGGER AS $$
DECLARE
  default_plan_id UUID;
BEGIN
  -- Get the monthly plan ID (default trial plan)
  SELECT id INTO default_plan_id FROM subscription_plans 
  WHERE name = 'Mensal' AND is_active = true
  LIMIT 1;
  
  -- Create trial period if plan found
  IF default_plan_id IS NOT NULL THEN
    INSERT INTO trial_periods (
      restaurant_id,
      plan_id,
      start_date,
      end_date,
      status
    ) VALUES (
      NEW.id,
      default_plan_id,
      NOW(),
      NOW() + INTERVAL '7 days',
      'active'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Payment transaction registration function
CREATE OR REPLACE FUNCTION register_payment_transaction(
  p_restaurant_id UUID,
  p_user_id UUID,
  p_payment_method_id UUID,
  p_amount DECIMAL(10,2),
  p_gateway TEXT,
  p_gateway_transaction_id TEXT,
  p_gateway_response JSONB,
  p_status TEXT
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO payment_transactions (
    restaurant_id,
    user_id,
    payment_method_id,
    amount,
    gateway,
    gateway_transaction_id,
    gateway_response,
    status
  ) VALUES (
    p_restaurant_id,
    p_user_id,
    p_payment_method_id,
    p_amount,
    p_gateway,
    p_gateway_transaction_id,
    p_gateway_response,
    p_status
  ) RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Subscription creation function - creates subscription after payment
CREATE OR REPLACE FUNCTION create_subscription_after_payment(
  p_restaurant_id UUID,
  p_plan_id UUID,
  p_payment_method_id UUID,
  p_trial_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_record RECORD;
  v_billing_cycle TEXT;
  v_period_interval INTERVAL;
  v_contracted_price DECIMAL(10,2);
BEGIN
  -- Get plan information
  SELECT billing_cycle, price INTO v_plan_record
  FROM subscription_plans
  WHERE id = p_plan_id;
  
  v_billing_cycle := v_plan_record.billing_cycle;
  v_contracted_price := v_plan_record.price;
  
  -- Determine interval based on billing cycle
  IF v_billing_cycle = 'monthly' THEN
    v_period_interval := INTERVAL '1 month';
  ELSIF v_billing_cycle = 'six-months' THEN
    v_period_interval := INTERVAL '6 months';
  ELSIF v_billing_cycle = 'yearly' THEN
    v_period_interval := INTERVAL '1 year';
  ELSE
    v_period_interval := INTERVAL '1 month';
  END IF;
  
  -- Insert subscription record
  INSERT INTO subscriptions (
    restaurant_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    contracted_price,
    billing_cycle,
    next_billing_date,
    payment_method_id,
    trial_id,
    auto_renew
  ) VALUES (
    p_restaurant_id,
    p_plan_id,
    'active',
    NOW(),
    NOW() + v_period_interval,
    v_contracted_price,
    v_billing_cycle,
    NOW() + v_period_interval,
    p_payment_method_id,
    p_trial_id,
    TRUE
  ) RETURNING id INTO v_subscription_id;
  
  -- Update trial if converting from trial
  IF p_trial_id IS NOT NULL THEN
    UPDATE trial_periods
    SET 
      status = 'converted',
      converted_to_subscription = TRUE,
      conversion_date = NOW(),
      subscription_id = v_subscription_id
    WHERE id = p_trial_id;
    
    -- Insert notification about conversion
    INSERT INTO notifications (
      recipient_type,
      recipient_id,
      title,
      message,
      type,
      action_url
    ) VALUES (
      'restaurant',
      p_restaurant_id,
      'Assinatura ativada com sucesso',
      'Seu período de teste foi convertido em uma assinatura. Bem-vindo ao plano ' || 
      (SELECT name FROM subscription_plans WHERE id = p_plan_id) || '!',
      'success',
      '/account/subscription'
    );
  END IF;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate PIX payment data (simulation)
CREATE OR REPLACE FUNCTION generate_pix_data(
  p_transaction_id UUID,
  p_amount DECIMAL(10,2),
  p_description TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- This is a simulation. In a real environment, you would integrate with a bank API
  v_result := jsonb_build_object(
    'qr_code', 'SIMULAçÃO_DE_QR_CODE_PIX_' || p_transaction_id,
    'qr_code_base64', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'payment_key', 'SIMULAÇÃO_DE_CHAVE_PIX_' || p_transaction_id,
    'expires_at', (NOW() + INTERVAL '30 minutes')::TEXT
  );
  
  -- Update the transaction with PIX data
  UPDATE payment_transactions
  SET 
    pix_qr_code = v_result->>'qr_code',
    pix_expiration_date = (v_result->>'expires_at')::TIMESTAMP WITH TIME ZONE,
    gateway_response = v_result,
    updated_at = NOW()
  WHERE id = p_transaction_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- SECTION 5: TRIGGERS
-- ================================

-- Subscription plan price change trigger
DROP TRIGGER IF EXISTS trg_log_subscription_plan_price_change ON subscription_plans;
CREATE TRIGGER trg_log_subscription_plan_price_change
AFTER UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION log_subscription_plan_price_change();

-- Payment method default trigger
DROP TRIGGER IF EXISTS trg_ensure_single_default_payment_method ON payment_methods;
CREATE TRIGGER trg_ensure_single_default_payment_method
BEFORE INSERT OR UPDATE ON payment_methods
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION ensure_single_default_payment_method();

-- Restaurant create trial period trigger
DROP TRIGGER IF EXISTS trg_create_trial_period_on_restaurant_creation ON restaurants;
CREATE TRIGGER trg_create_trial_period_on_restaurant_creation
AFTER INSERT ON restaurants
FOR EACH ROW
EXECUTE FUNCTION create_trial_period_on_restaurant_creation();

-- Update timestamp triggers
DROP TRIGGER IF EXISTS trg_update_restaurants_timestamp ON restaurants;
CREATE TRIGGER trg_update_restaurants_timestamp
BEFORE UPDATE ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_update_subscription_plans_timestamp ON subscription_plans;
CREATE TRIGGER trg_update_subscription_plans_timestamp
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_update_subscriptions_timestamp ON subscriptions;
CREATE TRIGGER trg_update_subscriptions_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_update_trial_periods_timestamp ON trial_periods;
CREATE TRIGGER trg_update_trial_periods_timestamp
BEFORE UPDATE ON trial_periods
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_update_payment_methods_timestamp ON payment_methods;
CREATE TRIGGER trg_update_payment_methods_timestamp
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_update_promotions_timestamp ON promotions;
CREATE TRIGGER trg_update_promotions_timestamp
BEFORE UPDATE ON promotions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_update_payment_transactions_timestamp ON payment_transactions;
CREATE TRIGGER trg_update_payment_transactions_timestamp
BEFORE UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ================================
-- SECTION 6: INDEXES
-- ================================

-- Restaurant indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);

-- Subscription plan indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_billing_cycle ON subscription_plans(billing_cycle);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant ON subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Price history indexes
CREATE INDEX IF NOT EXISTS idx_price_history_plan ON subscription_plan_price_history(plan_id);

-- Payment method indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_restaurant ON payment_methods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default) WHERE is_default = TRUE;

-- Trial periods indexes
CREATE INDEX IF NOT EXISTS idx_trial_periods_restaurant ON trial_periods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_trial_periods_status ON trial_periods(status);
CREATE INDEX IF NOT EXISTS idx_trial_periods_dates ON trial_periods(start_date, end_date);

-- Promotion indexes
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_promotions_date_range ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promotion_uses_promotion ON promotion_uses(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_uses_user ON promotion_uses(user_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Payment transaction indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_restaurant ON payment_transactions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- ================================
-- SECTION 7: INITIAL DATA
-- ================================

-- Insert default subscription plans if they don't exist
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, is_active)
SELECT 'Mensal', 'Ideal para pequenos negócios ou para testar a plataforma', 89.90, 'monthly', 
  json_build_object(
    'cardapio_digital', true,
    'gestao_pedidos', true,
    'dashboard', true,
    'qr_code', true,
    'suporte_email', true
  ), true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Mensal');

INSERT INTO subscription_plans (name, description, price, billing_cycle, features, is_active)
SELECT 'Semestral', 'Economize 15% com um plano de médio prazo', 76.42, 'six-months', 
  json_build_object(
    'cardapio_digital', true,
    'gestao_pedidos', true,
    'dashboard', true,
    'qr_code', true,
    'suporte_email', true,
    'integracao_delivery', true,
    'relatorios_avancados', true,
    'suporte_prioritario', true,
    'personalizacao_basica', true
  ), true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Semestral');

INSERT INTO subscription_plans (name, description, price, billing_cycle, features, is_active)
SELECT 'Anual', 'A melhor opção para estabelecimentos em crescimento — Economize 25%', 67.42, 'yearly', 
  json_build_object(
    'cardapio_digital', true,
    'gestao_pedidos', true,
    'dashboard', true,
    'qr_code', true,
    'suporte_email', true,
    'integracao_delivery', true,
    'relatorios_avancados', true,
    'suporte_prioritario', true,
    'personalizacao_basica', true,
    'dominio_personalizado', true,
    'personalizacao_completa', true,
    'suporte_telefonico', true,
    'treinamento_equipe', true
  ), true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Anual');

-- Insert admin user if it doesn't exist
DELETE FROM admin_users WHERE email = 'comandeja@gmail.com';

INSERT INTO admin_users (
  email,
  password_hash,
  name,
  role,
  is_active
) VALUES (
  'comandeja@gmail.com',
  encode(digest('comandeja@24h', 'sha256'), 'hex'),
  'Administrador ComandeJá',
  'admin',
  true
);

-- ================================
-- SECTION 8: COMMENTS
-- ================================

COMMENT ON TABLE users IS 'Stores all application users';
COMMENT ON TABLE admin_users IS 'Stores system administrators';
COMMENT ON TABLE restaurants IS 'Stores restaurant information';
COMMENT ON TABLE subscription_plans IS 'Stores available subscription plans';
COMMENT ON TABLE subscriptions IS 'Stores customer subscriptions';
COMMENT ON TABLE trial_periods IS 'Stores free trial periods information';
COMMENT ON TABLE payment_methods IS 'Stores user payment methods';
COMMENT ON TABLE payment_transactions IS 'Stores payment transaction records';
COMMENT ON TABLE promotions IS 'Stores promotional discounts and offers';
COMMENT ON TABLE promotion_uses IS 'Tracks which users have used promotions';
COMMENT ON TABLE notifications IS 'Stores system notifications';
COMMENT ON TABLE subscription_plan_price_history IS 'Tracks subscription plan price changes';

-- End of schema script
