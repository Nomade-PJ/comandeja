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
        const { data, error } = await supabase
          .from('restaurants')
          .select('id')
          .ilike('name', name.trim())
          .neq('id', currentRestaurantId || '')
          .maybeSingle();

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