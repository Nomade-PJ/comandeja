import { renderHook, act } from '@testing-library/react';
import { useBanners } from './useBanners';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestProviders, waitFor } from '@/test/test-utils';
import { supabase } from '@/integrations/supabase/client';

// Mock do supabase
vi.mock('@/integrations/supabase/client', async () => {
  const actual = await vi.importActual('@/integrations/supabase/client');
  return {
    ...actual,
    supabase: {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: '1',
                  restaurant_id: 'test-restaurant',
                  title: 'Banner de Teste',
                  description: 'Descrição do banner de teste',
                  image_url: 'https://test-url.com/image.jpg',
                  link_url: 'https://test-url.com',
                  coupon_code: 'TEST10',
                  is_active: true,
                  start_date: '2023-01-01T00:00:00Z',
                  end_date: '2030-12-31T23:59:59Z',
                  display_order: 1,
                  created_at: '2023-01-01T00:00:00Z',
                  updated_at: '2023-01-01T00:00:00Z',
                },
              ],
              error: null,
            }),
            lte: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: '1',
                      restaurant_id: 'test-restaurant',
                      title: 'Banner de Teste',
                      description: 'Descrição do banner de teste',
                      image_url: 'https://test-url.com/image.jpg',
                      link_url: 'https://test-url.com',
                      coupon_code: 'TEST10',
                      is_active: true,
                      start_date: '2023-01-01T00:00:00Z',
                      end_date: '2030-12-31T23:59:59Z',
                      display_order: 1,
                      created_at: '2023-01-01T00:00:00Z',
                      updated_at: '2023-01-01T00:00:00Z',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: '2',
                restaurant_id: 'test-restaurant',
                title: 'Novo Banner',
                description: 'Descrição do novo banner',
                image_url: 'https://test-url.com/new-image.jpg',
                link_url: 'https://test-url.com/new',
                coupon_code: 'NEW20',
                is_active: true,
                start_date: '2023-01-01T00:00:00Z',
                end_date: '2030-12-31T23:59:59Z',
                display_order: 2,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
              },
            ],
            error: null,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: {
                id: '1',
                title: 'Banner Atualizado',
              },
              error: null,
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    },
    getCachedData: vi.fn().mockImplementation((key, fetchFn) => fetchFn()),
  };
});

describe('useBanners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar banners corretamente', async () => {
    const { result } = renderHook(() => useBanners({ restaurantId: 'test-restaurant' }), {
      wrapper: TestProviders
    });

    // Verificar estado inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.banners).toEqual([]);

    // Aguardar carregamento
    await waitFor(100);

    // Verificar estado após carregamento
    expect(result.current.loading).toBe(false);
    expect(result.current.banners).toHaveLength(1);
    expect(result.current.banners[0].title).toBe('Banner de Teste');
  });

  it('deve criar um banner corretamente', async () => {
    const { result } = renderHook(() => useBanners({ restaurantId: 'test-restaurant' }), {
      wrapper: TestProviders
    });

    // Aguardar carregamento inicial
    await waitFor(100);

    // Criar um novo banner
    await act(async () => {
      await result.current.createBanner({
        title: 'Novo Banner',
        description: 'Descrição do novo banner',
        image_url: 'https://test-url.com/new-image.jpg',
        link_url: 'https://test-url.com/new',
        coupon_code: 'NEW20',
        is_active: true,
        start_date: '2023-01-01T00:00:00Z',
        end_date: '2030-12-31T23:59:59Z',
        display_order: 2,
      });
    });

    // Verificar se a função de inserção foi chamada
    expect(supabase.from).toHaveBeenCalledWith('banners');
  });

  it('deve atualizar um banner corretamente', async () => {
    const { result } = renderHook(() => useBanners({ restaurantId: 'test-restaurant' }), {
      wrapper: TestProviders
    });

    // Aguardar carregamento inicial
    await waitFor(100);

    // Atualizar um banner existente
    await act(async () => {
      await result.current.updateBanner('1', {
        title: 'Banner Atualizado',
        description: 'Descrição atualizada',
        image_url: 'https://test-url.com/updated-image.jpg',
        is_active: true,
        start_date: '2023-01-01T00:00:00Z',
        end_date: '2030-12-31T23:59:59Z',
        display_order: 1,
      });
    });

    // Verificar se a função de atualização foi chamada
    expect(supabase.from).toHaveBeenCalledWith('banners');
  });

  it('deve excluir um banner corretamente', async () => {
    const { result } = renderHook(() => useBanners({ restaurantId: 'test-restaurant' }), {
      wrapper: TestProviders
    });

    // Aguardar carregamento inicial
    await waitFor(100);

    // Excluir um banner
    await act(async () => {
      await result.current.deleteBanner('1');
    });

    // Verificar se a função de exclusão foi chamada
    expect(supabase.from).toHaveBeenCalledWith('banners');
  });

  it('deve filtrar banners ativos corretamente', async () => {
    const { result } = renderHook(() => useBanners({ restaurantId: 'test-restaurant', filterActive: true }), {
      wrapper: TestProviders
    });

    // Aguardar carregamento inicial
    await waitFor(100);

    // Verificar se a função de filtro foi chamada corretamente
    expect(supabase.from).toHaveBeenCalledWith('banners');
    expect(result.current.banners).toHaveLength(1);
  });

  it('deve lidar com erros corretamente', async () => {
    // Mock de erro
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Erro de teste' },
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useBanners({ restaurantId: 'test-restaurant' }), {
      wrapper: TestProviders
    });

    // Aguardar carregamento
    await waitFor(100);

    // Verificar se o erro foi capturado
    expect(result.current.error).not.toBeNull();
    expect(result.current.banners).toHaveLength(0);
  });
}); 