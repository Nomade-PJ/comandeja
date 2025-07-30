import React, { useState, useEffect } from 'react';
import { Skeleton } from './skeleton';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  optimize?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem otimizada que suporta carregamento preguiçoso, fallback e skeleton
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = 'https://via.placeholder.com/400x300?text=Imagem+indisponível',
  width,
  height,
  className = '',
  priority = false,
  optimize = true,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(() => {
    if (!optimize) return src;
    
    // Otimizar a URL da imagem se necessário
    if (typeof width === 'number') {
      const heightNum = typeof height === 'number' ? height : undefined;
      return getOptimizedImageUrl(src, width, heightNum);
    }
    
    return src;
  });
  
  // Reset o estado quando a src muda
  useEffect(() => {
    setIsLoading(!priority);
    setError(false);
    
    if (!optimize) {
      setImageSrc(src);
      return;
    }
    
    // Otimizar a URL da imagem se necessário
    if (typeof width === 'number') {
      const heightNum = typeof height === 'number' ? height : undefined;
      setImageSrc(getOptimizedImageUrl(src, width, heightNum));
    } else {
      setImageSrc(src);
    }
  }, [src, width, height, priority, optimize]);

  // Manipulador de carregamento
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Manipulador de erro
  const handleError = () => {
    setError(true);
    setImageSrc(fallbackSrc);
    onError?.();
  };

  // Calcular a proporção para o skeleton
  const aspectRatio = (() => {
    if (typeof width === 'number' && typeof height === 'number') {
      return `${(height / width) * 100}%`;
    }
    return '56.25%'; // Padrão 16:9
  })();

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, paddingBottom: isLoading ? aspectRatio : undefined }}
    >
      {isLoading && (
        <Skeleton 
          className="absolute inset-0 rounded-none" 
        />
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
} 