import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Banner, BannerFormValues } from '@/integrations/supabase/types';

interface UseBannersProps {
  restaurantId: string;
  filterActive?: boolean;
}

export function useBanners({ restaurantId, filterActive = false }: UseBannersProps) {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const { toast } = useToast();

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('banners')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (filterActive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('display_order', { ascending: true });

      if (error) throw error;

      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: 'Erro ao carregar banners',
        description: 'Não foi possível carregar os banners. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, toast, filterActive]);

  const createBanner = async (data: BannerFormValues) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('banners')
        .insert([{
          ...data,
          restaurant_id: restaurantId,
        }]);

      if (error) throw error;

      toast({
        title: 'Banner criado',
        description: 'O banner foi criado com sucesso!',
      });

      await fetchBanners();
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        title: 'Erro ao criar banner',
        description: 'Não foi possível criar o banner. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async (id: string, data: BannerFormValues) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('banners')
        .update(data)
        .eq('id', id)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      toast({
        title: 'Banner atualizado',
        description: 'O banner foi atualizado com sucesso!',
      });

      await fetchBanners();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: 'Erro ao atualizar banner',
        description: 'Não foi possível atualizar o banner. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      toast({
        title: 'Banner excluído',
        description: 'O banner foi excluído com sucesso!',
      });

      await fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: 'Erro ao excluir banner',
        description: 'Não foi possível excluir o banner. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const reorderBanners = useCallback(async (bannerId: string, newOrder: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('banners')
        .update({ display_order: newOrder })
        .eq('id', bannerId);

      if (error) throw error;

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
    } catch (error) {
      console.error('Error reordering banners:', error);
      toast({
        title: 'Erro ao reordenar banners',
        description: 'Não foi possível reordenar os banners. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    banners,
    loading,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
  };
} 