import { useCallback, useState, useEffect } from 'react';
import { supabase, getCachedData } from '@/integrations/supabase/client';
import type { Banner, BannerFormValues } from '@/integrations/supabase/types';
import { handleError, withErrorHandling, isOfflineError } from '@/lib/error-handler';

interface UseBannersProps {
  restaurantId: string;
  filterActive?: boolean;
}

// Duração do cache específico para banners (5 minutos)
const BANNERS_CACHE_DURATION = 5 * 60 * 1000;

export function useBanners({ restaurantId, filterActive = false }: UseBannersProps) {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [fetchAttempt, setFetchAttempt] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  // Função para obter banners com cache e tratamento de erros
  const fetchBanners = useCallback(async (forceRefresh = false) => {
    // Se não temos ID de restaurante, não fazer nada
    if (!restaurantId) {
      setLoading(false);
      return;
    }
    
    // Chave única para o cache
    const cacheKey = `banners-${restaurantId}-${filterActive ? 'active' : 'all'}`;
    
    // Se estamos forçando atualização, não usar o cache
    const cacheDuration = forceRefresh ? 0 : BANNERS_CACHE_DURATION;
    
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);
      
      // Função para buscar dados do Supabase
      const fetchData = async () => {
        let query = supabase
          .from('banners')
          .select('*')
          .eq('restaurant_id', restaurantId);

        if (filterActive) {
          query = query
            .eq('is_active', true)
            .lte('start_date', new Date().toISOString())
            .gte('end_date', new Date().toISOString());
        }

        const { data, error } = await query.order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
      };
      
      // Usar o sistema de cache
      const data = await getCachedData<Banner[]>(cacheKey, fetchData, cacheDuration);
      setBanners(data);
    } catch (err) {
      setError(err as Error);
      
      // Verificar se é um erro de conexão
      if (isOfflineError(err)) {
        setIsOffline(true);
      }
      
      // Mostrar erro apenas se não temos dados
      if (banners.length === 0) {
        handleError(err, {
          context: 'Carregamento de banners',
          fallbackMessage: 'Não foi possível carregar os banners. Tentaremos novamente em breve.',
          showToast: true
        });
      }
    } finally {
      setLoading(false);
    }
  }, [restaurantId, filterActive, banners.length]);

  // Efeito para buscar banners na montagem e quando as dependências mudarem
  useEffect(() => {
    // Só buscar banners se tivermos um ID de restaurante válido
    if (restaurantId) {
      fetchBanners();
      
      // Configurar uma atualização periódica a cada 5 minutos
      const intervalId = setInterval(() => {
        setFetchAttempt(prev => prev + 1);
      }, BANNERS_CACHE_DURATION);
      
      return () => clearInterval(intervalId);
    }
  }, [fetchBanners, restaurantId]);
  
  // Tentar novamente quando fetchAttempt mudar
  useEffect(() => {
    if (fetchAttempt > 0 && restaurantId) {
      // Usar um timeout para evitar múltiplas requisições simultâneas
      const timeoutId = setTimeout(() => {
        fetchBanners(true);
      }, 1000); // Esperar 1 segundo antes de tentar novamente
      
      return () => clearTimeout(timeoutId);
    }
  }, [fetchAttempt, fetchBanners, restaurantId]);

  const createBanner = async (data: BannerFormValues) => {
    if (!restaurantId) {
      handleError(new Error('ID do restaurante não disponível'), {
        context: 'Criação de banner',
        fallbackMessage: 'Não foi possível criar o banner: ID do restaurante não disponível.',
        showToast: true
      });
      return false;
    }
    
    return withErrorHandling(
      async () => {
        setLoading(true);
        try {
          const { error } = await supabase
            .from('banners')
            .insert([{
              ...data,
              restaurant_id: restaurantId,
            }]);

          if (error) throw error;

          // Forçar atualização do cache
          await fetchBanners(true);
          return true;
        } finally {
          setLoading(false);
        }
      },
      {
        context: 'Criação de banner',
        fallbackMessage: 'Não foi possível criar o banner. Tente novamente mais tarde.',
        showToast: true
      }
    );
  };

  const updateBanner = async (id: string, data: BannerFormValues) => {
    if (!restaurantId) {
      handleError(new Error('ID do restaurante não disponível'), {
        context: 'Atualização de banner',
        fallbackMessage: 'Não foi possível atualizar o banner: ID do restaurante não disponível.',
        showToast: true
      });
      return false;
    }
    
    return withErrorHandling(
      async () => {
        setLoading(true);
        try {
          const { error } = await supabase
            .from('banners')
            .update(data)
            .eq('id', id)
            .eq('restaurant_id', restaurantId);

          if (error) throw error;

          // Forçar atualização do cache
          await fetchBanners(true);
          return true;
        } finally {
          setLoading(false);
        }
      },
      {
        context: 'Atualização de banner',
        fallbackMessage: 'Não foi possível atualizar o banner. Tente novamente mais tarde.',
        showToast: true
      }
    );
  };

  const deleteBanner = async (id: string) => {
    if (!restaurantId) {
      handleError(new Error('ID do restaurante não disponível'), {
        context: 'Exclusão de banner',
        fallbackMessage: 'Não foi possível excluir o banner: ID do restaurante não disponível.',
        showToast: true
      });
      return false;
    }
    
    return withErrorHandling(
      async () => {
        setLoading(true);
        try {
          const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId);

          if (error) throw error;

          // Forçar atualização do cache
          await fetchBanners(true);
          return true;
        } finally {
          setLoading(false);
        }
      },
      {
        context: 'Exclusão de banner',
        fallbackMessage: 'Não foi possível excluir o banner. Tente novamente mais tarde.',
        showToast: true
      }
    );
  };

  const reorderBanners = useCallback(async (bannerId: string, newOrder: number) => {
    if (!restaurantId) {
      handleError(new Error('ID do restaurante não disponível'), {
        context: 'Reordenação de banners',
        fallbackMessage: 'Não foi possível reordenar os banners: ID do restaurante não disponível.',
        showToast: true
      });
      return false;
    }
    
    return withErrorHandling(
      async () => {
        setLoading(true);
        try {
          const { error } = await supabase
            .from('banners')
            .update({ display_order: newOrder })
            .eq('id', bannerId)
            .eq('restaurant_id', restaurantId); // Garantir que pertence ao restaurante correto

          if (error) throw error;

          // Atualizar localmente para evitar nova requisição
          setBanners(prev => {
            const updated = [...prev];
            const bannerIndex = updated.findIndex(b => b.id === bannerId);
            if (bannerIndex !== -1) {
              const [banner] = updated.splice(bannerIndex, 1);
              banner.display_order = newOrder;
              updated.splice(newOrder, 0, banner);
            }
            return updated;
          });
          return true;
        } finally {
          setLoading(false);
        }
      },
      {
        context: 'Reordenação de banners',
        fallbackMessage: 'Não foi possível reordenar os banners. Tente novamente.',
        showToast: true
      }
    );
  }, [restaurantId]);

  return {
    banners,
    setBanners,
    loading,
    error,
    isOffline,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
  };
} 