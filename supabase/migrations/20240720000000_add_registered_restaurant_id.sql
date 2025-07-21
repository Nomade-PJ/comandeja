-- Adicionar coluna registered_restaurant_id à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registered_restaurant_id UUID REFERENCES public.restaurants(id);

-- Adicionar comentário à coluna
COMMENT ON COLUMN public.profiles.registered_restaurant_id IS 'ID do restaurante onde o usuário foi cadastrado. Usado para restringir acesso.';

-- Remover políticas existentes que possam conflitar
DROP POLICY IF EXISTS "Clientes só podem acessar seu restaurante registrado" ON public.restaurants;
DROP POLICY IF EXISTS "Clientes só podem fazer pedidos no seu restaurante registrado" ON public.orders;
DROP POLICY IF EXISTS "Clientes só podem adicionar itens ao carrinho do seu restaurante registrado" ON public.cart_items;

-- Criar política simplificada para visualização de restaurantes
-- Esta política permite que todos os usuários vejam todos os restaurantes, mas
-- a lógica de restrição será aplicada no nível da aplicação
CREATE POLICY "Permitir visualização de restaurantes" 
ON public.restaurants 
FOR SELECT 
TO authenticated
USING (true);

-- Índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_profiles_registered_restaurant_id ON public.profiles(registered_restaurant_id); 