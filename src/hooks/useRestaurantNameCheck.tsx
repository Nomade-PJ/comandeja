import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface UseRestaurantNameCheckResult {
  isAvailable: boolean | null;
  isChecking: boolean;
  error: string | null;
}

export function useRestaurantNameCheck(name: string, currentRestaurantId?: string): UseRestaurantNameCheckResult {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkName = async () => {
      if (!name.trim()) {
        setIsAvailable(null);
        setError(null);
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        // Gerar um slug a partir do nome para verificação
        const slug = name.trim().toLowerCase().replace(/\s+/g, '');
        
        // Construir a consulta base
        let query = supabase
          .from('restaurants')
          .select('id')
          .eq('slug', slug);
        
        // Adicionar filtro por ID apenas se um ID válido for fornecido
        if (currentRestaurantId && currentRestaurantId.trim() !== '') {
          query = query.neq('id', currentRestaurantId);
        }
        
        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        
        setIsAvailable(!data);
      } catch (err) {
        console.error('Erro ao verificar nome:', err);
        setError('Erro ao verificar disponibilidade do nome');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkName, 500);
    return () => clearTimeout(debounceTimer);
  }, [name, currentRestaurantId]);

  return { isAvailable, isChecking, error };
} 