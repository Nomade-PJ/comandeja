import { useAuth as useAuthFromContext } from '@/contexts/AuthContext';

export const useAuth = useAuthFromContext;
export { AuthProvider } from '@/contexts/AuthContext';
