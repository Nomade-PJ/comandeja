import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useRestaurant } from './useRestaurant';

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { restaurant } = useRestaurant();
  const { toast } = useToast();

  useEffect(() => {
    if (restaurant?.id) {
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [restaurant?.id]);

  const fetchCategories = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('display_order');

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias",
          variant: "destructive"
        });
      } else {
        setCategories(data || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'restaurant_id'>) => {
    if (!restaurant?.id) {
      toast({
        title: "Erro",
        description: "Restaurante não encontrado",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Determinar o próximo valor de display_order (maior valor + 1)
      const maxOrder = categories.length > 0
        ? Math.max(...categories.map(c => c.display_order))
        : -1;
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          restaurant_id: restaurant.id,
          display_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar categoria",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!"
      });

      fetchCategories();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar categoria",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!"
      });

      fetchCategories();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar categoria",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Categoria deletada com sucesso!"
      });

      fetchCategories();
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };
  
  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    try {
      // Encontrar a categoria atual e a categoria adjacente
      const currentIndex = categories.findIndex(c => c.id === categoryId);
      if (currentIndex === -1) return false;
      
      let swapIndex;
      if (direction === 'up') {
        // Não pode mover para cima se já estiver no topo
        if (currentIndex === 0) return false;
        swapIndex = currentIndex - 1;
      } else {
        // Não pode mover para baixo se já estiver na base
        if (currentIndex === categories.length - 1) return false;
        swapIndex = currentIndex + 1;
      }
      
      const currentCategory = categories[currentIndex];
      const swapCategory = categories[swapIndex];
      
      // Trocar as ordens
      const [currentOrder, swapOrder] = [currentCategory.display_order, swapCategory.display_order];
      
      // Atualizar as duas categorias no banco de dados
      const updates = [
        supabase
          .from('categories')
          .update({ display_order: swapOrder })
          .eq('id', currentCategory.id),
        supabase
          .from('categories')
          .update({ display_order: currentOrder })
          .eq('id', swapCategory.id)
      ];
      
      await Promise.all(updates);
      
      toast({
        title: "Sucesso",
        description: "Ordem das categorias atualizada!"
      });
      
      fetchCategories();
      return true;
    } catch (error) {
      console.error('Error moving category:', error);
      toast({
        title: "Erro",
        description: "Erro ao reorganizar categorias",
        variant: "destructive"
      });
      return false;
    }
  };

  const reorderCategories = async (orderedCategoryIds: string[]) => {
    try {
      // Verifica se todos os IDs são válidos e correspondem às categorias existentes
      const validIds = orderedCategoryIds.every(id => categories.some(c => c.id === id));
      if (!validIds || orderedCategoryIds.length !== categories.length) {
        throw new Error('IDs de categoria inválidos ou faltando');
      }
      
      // Atualizações em lote para as novas ordens
      const updates = orderedCategoryIds.map((id, index) => {
        return supabase
          .from('categories')
          .update({ display_order: index })
          .eq('id', id);
      });
      
      await Promise.all(updates);
      
      toast({
        title: "Sucesso",
        description: "Categorias reordenadas com sucesso!"
      });
      
      fetchCategories();
      return true;
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast({
        title: "Erro",
        description: "Erro ao reordenar categorias",
        variant: "destructive"
      });
      return false;
    }
  };

  return { 
    categories, 
    loading, 
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    reorderCategories,
    refetch: fetchCategories 
  };
};
