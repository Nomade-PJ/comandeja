import React, { useState, useEffect } from 'react';
import { useRestaurant } from '@/contexts/RestaurantContext';
import OnboardingDialog from './OnboardingDialog';

interface RequireCompletedProfileProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica se o perfil do restaurante está completo
 * e exibe o diálogo de onboarding quando necessário.
 * Bloqueia o acesso ao conteúdo enquanto o perfil não estiver completo.
 */
const RequireCompletedProfile: React.FC<RequireCompletedProfileProps> = ({ children }) => {
  const { restaurant } = useRestaurant();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o restaurante existe e se o perfil está completo
    if (restaurant) {
      // Se for o restaurante mock, não exigir onboarding
      if (restaurant.id === 'mock-restaurant-id') {
        setShowOnboarding(false);
        setIsLoading(false);
        return;
      }
      
      const isNewRegistration = sessionStorage.getItem('is_new_registration') === 'true';
      const needsOnboarding = !restaurant.address || !restaurant.phone || isNewRegistration;
      
      setShowOnboarding(needsOnboarding);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [restaurant]);

  // Se estiver carregando, mostra um indicador de loading
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Se precisa completar o perfil, mostra apenas o diálogo de onboarding
  // com um fundo escurecido para bloquear interação com o conteúdo por trás
  if (showOnboarding) {
    return (
      <div className="relative">
        {/* Fundo escurecido para bloquear interação */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        
        {/* Conteúdo da página (não acessível) */}
        <div className="opacity-20 pointer-events-none">
          {children}
        </div>
        
        {/* Diálogo de onboarding (sempre visível) */}
        {restaurant && (
          <OnboardingDialog 
            open={true} 
            restaurantName={restaurant.name} 
          />
        )}
      </div>
    );
  }

  // Se o perfil estiver completo, renderiza normalmente o conteúdo
  return <>{children}</>;
};

export default RequireCompletedProfile; 