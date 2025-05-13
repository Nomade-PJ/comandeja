-- Remover tentativa anterior se existir
DROP INDEX IF EXISTS idx_valid_coupons;

-- Criar índice apenas na coluna is_active
CREATE INDEX idx_valid_coupons ON coupons(restaurant_id, is_active);

-- Como alternativa, você também pode criar esse índice:
-- CREATE INDEX idx_coupons_expiry ON coupons(restaurant_id, is_active, expires_at); 