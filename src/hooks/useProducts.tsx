import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { restaurant } = useRestaurant();
  
  // Buscar todos os produtos com React Query
  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['products', restaurant?.id],
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
      
      return data || [];
    },
    enabled: !!restaurant?.id,
    staleTime: 60000, // 1 minuto
    gcTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
  });
  
  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductInput) => {
      if (!restaurant?.id) {
        throw new Error("Não foi possível identificar o restaurante");
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          restaurant_id: restaurant.id,
          image_url: productData.image_url || null
        }])
        .select()
        .single();
      
      if (error) {
        throw new Error(`Falha ao criar produto: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', restaurant?.id] });
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  });
  
  // Mutation para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: string, productData: ProductInput }) => {
      // Certificar-se de que o campo image_url seja explicitamente definido, mesmo se for null
      const updateData = {
        ...productData,
        image_url: productData.image_url === undefined ? undefined : productData.image_url
      };
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Falha ao atualizar produto: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', restaurant?.id] });
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  });
  
  // Mutation para excluir produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Falha ao excluir produto: ${error.message}`);
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', restaurant?.id] });
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  });
  
  // Funções de wrapper para manter a API compatível
  const createProduct = async (productData: ProductInput) => {
    try {
      return await createProductMutation.mutateAsync(productData);
    } catch (error) {
      return null;
    }
  };
  
  const updateProduct = async (id: string, productData: ProductInput) => {
    try {
      return await updateProductMutation.mutateAsync({ id, productData });
    } catch (error) {
      return null;
    }
  };
  
  const deleteProduct = async (id: string) => {
    try {
      return await deleteProductMutation.mutateAsync(id);
    } catch (error) {
      return false;
    }
  };
  
  return {
    products,
    isLoading,
    error,
    loading: createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch
  };
};
