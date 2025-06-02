import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Função de debounce para evitar múltiplas atualizações rápidas
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

export function useIsMobile() {
  // Inicializar com o valor correto baseado no tamanho da janela atual
  // Usar uma função para inicialização para evitar problemas com SSR
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    // Função para atualizar o estado com base no tamanho da tela
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
    };

    // Versão com debounce da função de verificação
    const debouncedCheckMobile = debounce(checkMobile, 250);

    // Inicializar com o valor correto
    checkMobile();

    // Adicionar listener para mudanças de tamanho com debounce
    window.addEventListener('resize', debouncedCheckMobile);
    
    // Adicionar listener para mudanças de orientação em dispositivos móveis
    window.addEventListener('orientationchange', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedCheckMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [isMobile]); // Dependência para garantir que o estado seja atualizado corretamente

  return isMobile;
}
