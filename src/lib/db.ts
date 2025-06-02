import supabase, { testConnection as testSupabaseConnection } from './supabase';
import { Database } from './database.types';
import type { PostgrestError } from '@supabase/supabase-js';

// Type para resultados de queries genéricas
export interface QueryResult<T = any> {
  data: T[] | null;
  error: PostgrestError | null;
  count: number | null;
}

/**
 * Função utilitária para executar consultas SQL via Supabase
 */
export const query = async <T = any>(
  table: keyof Database['public']['Tables'],
  options: {
    select?: string;
    eq?: Record<string, any>;
    filter?: { column: string; operator: string; value: any };
    match?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  } = {}
): Promise<QueryResult<T>> => {
  try {
    console.log('🔷 Executando query via Supabase:', { table, options });
    
    let query = supabase.from(table).select(options.select || '*');
    
    // Aplicar filtros
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (options.match) {
      Object.entries(options.match).forEach(([key, value]) => {
        query = query.match({ [key]: value });
      });
    }
    
    if (options.filter) {
      // Usando a versão completa do filter com coluna, operador e valor
      query = query.filter(
        options.filter.column,
        options.filter.operator,
        options.filter.value
      );
    }
    
    // Ordenação
    if (options.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true
      });
    }
    
    // Limite
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    // Execute a consulta
    if (options.single) {
      const { data, error } = await query.single();
      return { data: data ? [data] as T[] : null, error, count: data ? 1 : 0 };
    } else {
      const { data, error, count } = await query;
      return { data: data as T[] | null, error, count };
    }
  } catch (error) {
    console.error('❌ Erro ao executar query:', error);
    return { 
      data: null, 
      error: error as PostgrestError,
      count: null
    };
  }
};

/**
 * Função para executar uma inserção no banco de dados
 */
export const insert = async <T = any>(
  table: keyof Database['public']['Tables'],
  values: any
): Promise<{ data: T | null; error: PostgrestError | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(values)
      .select();
      
    return { data: result as unknown as T, error };
  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
    return { 
      data: null, 
      error: error as PostgrestError
    };
  }
};

/**
 * Função para atualizar dados no banco de dados
 */
export const update = async <T = any>(
  table: keyof Database['public']['Tables'],
  match: Record<string, any>,
  values: any
): Promise<{ data: T | null; error: PostgrestError | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(values)
      .match(match)
      .select();
      
    return { data: result as unknown as T, error };
  } catch (error) {
    console.error('❌ Erro ao atualizar dados:', error);
    return { 
      data: null, 
      error: error as PostgrestError
    };
  }
};

/**
 * Testa a conexão com o Supabase
 */
export const testConnection = async () => {
  return testSupabaseConnection();
}; 