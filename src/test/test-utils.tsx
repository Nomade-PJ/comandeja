import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { vi } from 'vitest';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            limit: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null
              }))
            })),
          })),
          lte: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null
              }))
            }))
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({ data: [], error: null })
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test-url.com/image.jpg' } })),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      }))
    }
  },
  getCachedData: vi.fn((key, fetchFn) => fetchFn()),
  logDebug: vi.fn(),
}));

// Mock do useToast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Criando um QueryClient para testes
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
  },
});

// Wrapper para os testes
interface ProvidersProps {
  children: ReactNode;
}

export const TestProviders = ({ children }: ProvidersProps) => {
  const testQueryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export function renderWithProviders(ui: ReactNode) {
  return render(<TestProviders>{ui}</TestProviders>);
}

// Função para esperar um tempo específico
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 