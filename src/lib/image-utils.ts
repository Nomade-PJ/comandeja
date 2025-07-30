/**
 * Utilitários para manipulação e otimização de imagens
 */

/**
 * Gera uma URL de imagem otimizada com dimensões específicas
 * @param url URL original da imagem
 * @param width Largura desejada
 * @param height Altura desejada (opcional)
 * @returns URL otimizada
 */
export function getOptimizedImageUrl(url: string, width: number, height?: number): string {
  // Se a URL já for do Supabase Storage, usar os parâmetros de transformação
  if (url.includes('supabase.co/storage/v1/object/public')) {
    const separator = url.includes('?') ? '&' : '?';
    const heightParam = height ? `&height=${height}` : '';
    return `${url}${separator}width=${width}${heightParam}&quality=80&format=auto`;
  }
  
  // Caso contrário, retornar a URL original
  return url;
}

/**
 * Converte uma imagem para o formato WebP com qualidade reduzida
 * @param file Arquivo de imagem
 * @param quality Qualidade da imagem (0-1)
 * @returns Promise com o Blob da imagem convertida
 */
export function convertToWebP(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Falha ao ler o arquivo'));
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao criar contexto de canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao converter para WebP'));
              return;
            }
            resolve(blob);
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Falha ao carregar a imagem'));
      };
      
      img.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Redimensiona uma imagem para um tamanho máximo
 * @param file Arquivo de imagem
 * @param maxWidth Largura máxima
 * @param maxHeight Altura máxima
 * @param quality Qualidade da imagem (0-1)
 * @returns Promise com o Blob da imagem redimensionada
 */
export function resizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Falha ao ler o arquivo'));
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        // Calcular as dimensões mantendo a proporção
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao criar contexto de canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Usar o formato original ou converter para WebP se suportado
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao redimensionar a imagem'));
              return;
            }
            resolve(blob);
          },
          format,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Falha ao carregar a imagem'));
      };
      
      img.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Verifica se o navegador suporta WebP
 * @returns Promise que resolve para true se WebP for suportado
 */
export async function supportsWebP(): Promise<boolean> {
  if (!window.createImageBitmap) return false;
  
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  
  return createImageBitmap(blob).then(
    () => true,
    () => false
  );
} 