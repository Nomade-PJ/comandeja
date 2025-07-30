import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useBanners } from '@/hooks/useBanners';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ExternalLink, Search, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface RestaurantBannerProps {
  restaurantId: string;
  onSearch?: (query: string) => void;
}

export function RestaurantBanner({ restaurantId, onSearch }: RestaurantBannerProps) {
  const { banners, loading, error, isOffline, fetchBanners } = useBanners({ 
    restaurantId: restaurantId || '',
    filterActive: true
  });
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const intervalRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [hasErrored, setHasErrored] = useState(false);
  
  // Limpar e configurar o carrossel quando os banners ou a API mudam
  useEffect(() => {
    // Se não temos API ou banners suficientes, não fazer nada
    if (!api || banners.length <= 1) {
      return;
    }
    
    // Limpar qualquer intervalo existente
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Configurar novo intervalo para rotação a cada 5 segundos
    intervalRef.current = window.setInterval(() => {
      api.scrollNext();
    }, 5000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [api, banners.length]);

  // Efeito para lidar com erros
  useEffect(() => {
    if (error && !isOffline) {
      setHasErrored(true);
      
      if (retryCount < 3) {
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchBanners(true);
        }, 3000 * Math.pow(2, retryCount)); // Backoff exponencial: 3s, 6s, 12s
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, retryCount, fetchBanners, isOffline]);

  // Efeito para limpar o estado de erro quando os banners são carregados com sucesso
  useEffect(() => {
    if (banners.length > 0 && hasErrored) {
      setHasErrored(false);
      setRetryCount(0);
    }
  }, [banners.length, hasErrored]);

  const handleCouponClick = (couponCode: string | null) => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      toast({
        title: 'Cupom copiado!',
        description: `O código ${couponCode} foi copiado para sua área de transferência.`,
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  // Se não temos ID de restaurante, mostrar um esqueleto sem tentar carregar
  if (!restaurantId) {
    return (
      <div className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              Buscar
            </Button>
          </form>
        </div>
      </div>
    );
  }
  
  // Se estiver carregando e não temos banners, mostrar um esqueleto
  if (loading && banners.length === 0) {
    return (
      <div className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // Se estiver offline, mostrar alerta específico
  if (isOffline) {
    return (
      <div className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Você está offline</AlertTitle>
            <AlertDescription className="text-amber-700 flex items-center justify-between">
              <span>Não foi possível carregar os banners. Verifique sua conexão com a internet.</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                onClick={() => fetchBanners(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              Buscar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Se houver erro persistente após várias tentativas e não temos banners para mostrar
  if (hasErrored && retryCount >= 3 && banners.length === 0) {
    return (
      <div className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar banners</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Não foi possível carregar os banners. Por favor, recarregue a página.</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200"
                onClick={() => fetchBanners(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              Buscar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Se não temos banners para mostrar
  if (!banners.length) {
    return (
      <div className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              Buscar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Renderizar o carrossel de banners
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto">
        <Carousel 
          className="w-full" 
          setApi={setApi} 
          opts={{ 
            loop: true,
            align: "start"
          }}
        >
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <Card className="relative overflow-hidden border-0 rounded-none">
                  <div className="h-32 sm:h-36 md:h-40 lg:h-44 relative">
                    <OptimizedImage
                      src={banner.image_url}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      fallbackSrc="https://via.placeholder.com/800x400?text=Imagem+indisponível"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-white/90 text-sm mb-2">
                        {banner.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {banner.coupon_code && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCouponClick(banner.coupon_code)}
                        >
                          Copiar Cupom: {banner.coupon_code}
                        </Button>
                      )}
                      {banner.link_url && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1"
                          asChild
                        >
                          <a
                            href={banner.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Saiba mais
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
} 