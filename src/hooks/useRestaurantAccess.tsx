import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RestaurantAccessResult {
  hasAccess: boolean;
  loading: boolean;
  error: Error | null;
  registeredRestaurantId: string | null;
  registeredRestaurantSlug: string | null;
  checkAccess: (restaurantId: string) => Promise<boolean>;
  registerRestaurant: (restaurantId: string) => Promise<boolean>;
}

export function useRestaurantAccess(): RestaurantAccessResult {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [registeredRestaurantId, setRegisteredRestaurantId] = useState<string | null>(null);
  const [registeredRestaurantSlug, setRegisteredRestaurantSlug] = useState<string | null>(null);

  // Carregar o restaurante registrado do usuário quando o hook for montado
  useEffect(() => {
    const loadRegisteredRestaurant = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Verificar primeiro nos metadados do usuário
        let restaurantId = user.user_metadata?.registered_restaurant_id || null;
        
        // Se não encontrar nos metadados, verificar no perfil
        if (!restaurantId) {
          const { data, error } = await supabase
            .from('profiles')
            .select('registered_restaurant_id')
            .eq('id', user.id)
            .single();
            
          if (!error && data && data.registered_restaurant_id) {
            restaurantId = data.registered_restaurant_id;
          }
        }
        
        setRegisteredRestaurantId(restaurantId);
        
        // Se encontrou um restaurante registrado, buscar o slug
        if (restaurantId) {
          const { data, error } = await supabase
            .from('restaurants')
            .select('slug')
            .eq('id', restaurantId)
            .single();
            
          if (!error && data) {
            setRegisteredRestaurantSlug(data.slug);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };
    
    loadRegisteredRestaurant();
  }, [user]);

  // Verificar se o usuário tem acesso a um restaurante específico
  const checkAccess = async (restaurantId: string): Promise<boolean> => {
    if (!user) return false;
    
    // Se for dono de restaurante, tem acesso a todos os restaurantes
    if (user.user_metadata?.role === 'restaurant_owner') return true;
    
    // Se não for cliente, não tem acesso
    if (user.user_metadata?.role !== 'customer') return false;
    
    try {
      // Se já carregamos o restaurante registrado, comparar diretamente
      if (registeredRestaurantId) {
        return registeredRestaurantId === restaurantId;
      }
      
      // Caso contrário, verificar no banco de dados
      const { data, error } = await supabase
        .from('profiles')
        .select('registered_restaurant_id')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      // Se não tem restaurante registrado, pode acessar qualquer um (primeira visita)
      if (!data.registered_restaurant_id) return true;
      
      // Verificar se o restaurante registrado é o mesmo que está tentando acessar
      return data.registered_restaurant_id === restaurantId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao verificar acesso'));
      return false;
    }
  };

  // Registrar um restaurante para o usuário
  const registerRestaurant = async (restaurantId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Atualizar o perfil com o restaurante
      const { error } = await supabase
        .from('profiles')
        .update({ registered_restaurant_id: restaurantId })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Atualizar o estado local
      setRegisteredRestaurantId(restaurantId);
      
      // Buscar o slug do restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('slug')
        .eq('id', restaurantId)
        .single();
        
      if (!restaurantError && restaurantData) {
        setRegisteredRestaurantSlug(restaurantData.slug);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao registrar restaurante'));
      return false;
    }
  };

  return {
    hasAccess: registeredRestaurantId === null || user?.user_metadata?.role === 'restaurant_owner',
    loading,
    error,
    registeredRestaurantId,
    registeredRestaurantSlug,
    checkAccess,
    registerRestaurant
  };
} 