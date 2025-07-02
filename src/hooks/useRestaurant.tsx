import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  banner_url?: string;
  social_media?: string | Record<string, string> | any; // Pode ser string ou objeto
  is_active: boolean;
  owner_id?: string;
}

export const useRestaurant = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error('Erro ao obter usuário autenticado');
      }
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrou restaurante - isso é normal para novos usuários
          setRestaurant(null);
        } else {
          throw error;
        }
      } else {
        setRestaurant(data);
        setRetryCount(0); // Resetar contagem de tentativas após sucesso
      }
    } catch (error) {
      setError(error as Error);
      console.error('Erro ao carregar restaurante:', error);
      
      // Tentar novamente se ainda não atingiu o limite
      if (retryCount < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchRestaurant();
        }, delay);
      } else {
        toast({
          title: "Erro de conexão",
          description: "Não foi possível carregar os dados do restaurante. Tente novamente mais tarde.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para garantir que o perfil do usuário existe
  const ensureUserProfile = async (user) => {
    try {
      // Verificar se o perfil já existe
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
        return false;
      }
      
      // Se o perfil não existir, criar um novo
      if (!existingProfile) {
        console.log('Creating profile for user:', user.id);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            role: 'restaurant_owner'
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return false;
    }
  };

  const createRestaurant = async (restaurantData: Omit<Restaurant, 'id' | 'slug' | 'owner_id' | 'is_active'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um restaurante",
          variant: "destructive"
        });
        return null;
      }
      
      // Garantir que o perfil existe antes de criar o restaurante
      const profileExists = await ensureUserProfile(user);
      
      if (!profileExists) {
        toast({
          title: "Erro",
          description: "Não foi possível criar ou verificar o perfil do usuário",
          variant: "destructive"
        });
        return null;
      }

      // Incluir o slug vazio para que o trigger possa gerar automaticamente
      const { data, error } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantData.name,
          description: restaurantData.description,
          phone: restaurantData.phone,
          email: restaurantData.email,
          address: restaurantData.address,
          city: restaurantData.city,
          state: restaurantData.state,
          zip_code: restaurantData.zip_code,
          logo_url: restaurantData.logo_url,
          banner_url: restaurantData.banner_url,
          social_media: restaurantData.social_media,
          slug: '', // Será preenchido pelo trigger automaticamente
          owner_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating restaurant:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar restaurante: " + error.message,
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Restaurante criado com sucesso!"
      });

      setRestaurant(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    if (!restaurant) return null;

    try {
      console.log('Atualizando restaurante com dados:', updates);

      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurant.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar restaurante: " + error.message,
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Restaurante atualizado com sucesso!"
      });

      setRestaurant(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  return {
    restaurant,
    loading,
    error,
    refetch: fetchRestaurant,
    createRestaurant,
    updateRestaurant,
  };
};
