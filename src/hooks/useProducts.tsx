import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useRestaurant } from '@/hooks/useRestaurant';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  is_active: boolean;
  is_featured: boolean;
  preparation_time: number;
  display_order: number;
  category_id?: string;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

interface ProductInput {
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  is_active: boolean;
  is_featured: boolean;
  preparation_time: number;
  display_order?: number;
  category_id?: string;
}

export const useProducts = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { restaurant } = useRestaurant();
  
  // Buscar todos os produtos
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('restaurant_id', restaurant.id)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!restaurant?.id
  });
  
  // Criar um novo produto
  const createProduct = async (productData: ProductInput) => {
    if (!restaurant?.id) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar o restaurante",
        variant: "destructive"
      });
      return null;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          restaurant_id: restaurant.id,
          // Garantir que o campo image_url seja explícito, mesmo que seja null
          image_url: productData.image_url || null
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar produto:', error);
        toast({
          title: "Erro",
          description: `Falha ao criar produto: ${error.message}`,
          variant: "destructive"
        });
        return null;
      }
      
      // Invalidar a query para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro inesperado ao criar produto:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Atualizar um produto existente
  const updateProduct = async (id: string, productData: ProductInput) => {
    setLoading(true);
    
    try {
      console.log('Atualizando produto:', id, 'com dados:', productData);
      
      // Certificar-se de que o campo image_url seja explicitamente definido, mesmo se for null
      const updateData = {
        ...productData,
        image_url: productData.image_url === undefined ? undefined : productData.image_url
      };
      
      console.log('Dados de atualização preparados:', updateData);
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar produto:', error);
        toast({
          title: "Erro",
          description: `Falha ao atualizar produto: ${error.message}`,
          variant: "destructive"
        });
        return null;
      }
      
      // Invalidar a query para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Excluir um produto
  const deleteProduct = async (id: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao excluir produto:', error);
        toast({
          title: "Erro",
          description: `Falha ao excluir produto: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      // Invalidar a query para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!"
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro inesperado ao excluir produto:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    products,
    isLoading,
    error,
    loading,
    createProduct,
    updateProduct,
    deleteProduct
  };
};
