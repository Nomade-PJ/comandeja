import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Customer } from './useCustomers';
import { toast } from '@/components/ui/use-toast';

export const useCustomer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Busca ou cria automaticamente um cliente para o usuário atual em um restaurante específico
   */
  const getOrCreateCustomer = async (restaurantId: string): Promise<Customer | null> => {
    if (!user) {
      console.log('Usuário não está autenticado');
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para realizar um pedido',
        variant: 'destructive',
      });
      return null;
    }
    
    setLoading(true);

    try {
      console.log('Verificando cliente para usuário:', user.id, 'no restaurante:', restaurantId);
      
      // Buscar cliente existente pela combinação de restaurante e usuário
      const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Se encontramos um cliente vinculado ao usuário, retornar imediatamente
      if (!fetchError && existingCustomer) {
        console.log('Cliente existente encontrado pelo user_id:', existingCustomer);
        return existingCustomer as Customer;
      }
      
      // Se não encontrou pelo user_id, tentar pelo email
      const { data: emailCustomer, error: emailError } = await supabase
        .from('customers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('email', user.email || '')
        .maybeSingle();
      
      // Se encontramos um cliente com o mesmo email mas sem user_id, vincular ao usuário
      if (!emailError && emailCustomer && !emailCustomer.user_id) {
        console.log('Cliente existente encontrado pelo email, atualizando com user_id:', emailCustomer);
        
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({ user_id: user.id })
          .eq('id', emailCustomer.id)
          .select()
          .single();
        
        if (!updateError && updatedCustomer) {
          return updatedCustomer as Customer;
        } else {
          console.warn('Não foi possível atualizar o cliente com user_id, usando registro existente:', emailCustomer);
          return emailCustomer as Customer;
        }
      } else if (!emailError && emailCustomer) {
        // O cliente já existe com email e user_id diferentes (caso raro)
        console.log('Cliente encontrado com mesmo email, mas user_id diferente');
        return emailCustomer as Customer;
      }

      // Não encontrou cliente, criar um novo
      console.log('Cliente não encontrado, criando novo cliente');
      
      // Obter informações do perfil do usuário para preencher o nome e telefone
      let name = '';
      let phone = '';

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        name = profileData.full_name || '';
        phone = profileData.phone || '';
      } else {
        console.warn('Não foi possível obter perfil do usuário:', profileError);
        name = user.email?.split('@')[0] || 'Cliente';
      }

      // Garantir que temos um email válido
      const email = user.email || profileData?.email || '';
      
      // Dados para criar o cliente
      const customerData = {
        user_id: user.id,
        restaurant_id: restaurantId,
        name: name,
        email: email,
        phone: phone,
        created_at: new Date().toISOString(),
        total_orders: 0,
        total_spent: 0
      };
      
      console.log('Dados para criação do cliente:', customerData);
      
      // Tentativa principal de criar o cliente
      try {
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert(customerData)
          .select()
          .single();
        
        if (createError) {
          throw createError;
        }
        
        console.log('Novo cliente criado com sucesso:', newCustomer);
        return newCustomer as Customer;
      } catch (createError: any) {
        console.error('Erro na primeira tentativa de criar cliente:', createError);
        
        // Se falhou, tentar novamente sem user_id como fallback
        if (createError.message?.includes('policy') || createError.code === '42501') {
          console.log('Tentando criar cliente sem user_id como fallback');
          
          const fallbackData = {
            ...customerData,
            user_id: null // Remove a referência ao user_id
          };
          
          const { data: fallbackCustomer, error: fallbackError } = await supabase
            .from('customers')
            .insert(fallbackData)
            .select()
            .single();
          
          if (fallbackError) {
            console.error('Erro na tentativa de fallback:', fallbackError);
            throw new Error('Não foi possível criar perfil de cliente mesmo após tentativas alternativas');
          }
          
          console.log('Cliente criado com sucesso via fallback:', fallbackCustomer);
          return fallbackCustomer as Customer;
        }
        
        throw createError;
      }
    } catch (error: any) {
      console.error('Erro ao buscar/criar cliente:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao verificar seu perfil de cliente',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getOrCreateCustomer,
    loading
  };
}; 