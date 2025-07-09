import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useBanners } from '@/hooks/useBanners';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ExternalLink, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

interface RestaurantBannerProps {
  restaurantId: string;
  onSearch?: (query: string) => void;
}

export function RestaurantBanner({ restaurantId, onSearch }: RestaurantBannerProps) {
  const { banners, loading, fetchBanners } = useBanners({ 
    restaurantId,
    filterActive: true
  });
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const intervalRef = useRef<number>();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Configura a rotação automática quando houver mais de 1 banner
  useEffect(() => {
    if (!api || banners.length <= 1) return;

    // Limpa o intervalo anterior se existir
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    // Configura novo intervalo para rotação a cada 5 segundos
    // Sempre avança para o próximo banner, o loop: true cuida do retorno ao início
    intervalRef.current = window.setInterval(() => {
      api.scrollNext();
    }, 5000);

    // Limpa o intervalo quando o componente for desmontado
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [api, banners.length]);

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

  if (loading) {
    return (
      <div className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

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
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover"
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