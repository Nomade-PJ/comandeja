import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X, AlertCircle, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useStorage } from '@/hooks/useStorage';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { convertToWebP, resizeImage, supportsWebP } from '@/lib/image-utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface ImageUploadProps {
  /**
   * URL atual da imagem (se existir)
   */
  value?: string | null;
  
  /**
   * Função chamada quando uma nova imagem é carregada
   */
  onChange?: (url: string | null) => void;
  
  /**
   * Função chamada quando a imagem é removida
   */
  onRemove?: () => void;
  
  /**
   * Bucket do Supabase Storage para upload
   */
  bucket?: string;
  
  /**
   * Título do componente
   */
  title?: string;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
  
  /**
   * Usar dropzone (arrastar e soltar) ou input de arquivo padrão
   */
  useDropzone?: boolean;
  
  /**
   * Otimizar imagens antes do upload
   */
  optimizeImages?: boolean;
  
  /**
   * Largura máxima para redimensionamento
   */
  maxWidth?: number;
  
  /**
   * Altura máxima para redimensionamento
   */
  maxHeight?: number;
  
  /**
   * Qualidade da imagem (0-1)
   */
  quality?: number;
}

/**
 * Componente unificado para upload de imagens
 * Suporta tanto dropzone quanto input de arquivo padrão
 */
export function ImageUpload({
  value = null,
  onChange,
  onRemove,
  bucket = 'products',
  title,
  className = '',
  useDropzone: useDropzoneMode = true,
  optimizeImages = true,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const { toast } = useToast();
  const { uploadFile } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [supportsWebPFormat, setSupportsWebPFormat] = useState(false);
  
  // Verificar suporte a WebP
  useEffect(() => {
    const checkWebPSupport = async () => {
      const supported = await supportsWebP();
      setSupportsWebPFormat(supported);
    };
    
    checkWebPSupport();
  }, []);

  // Atualizar o preview quando o valor mudar
  useEffect(() => {
    setPreview(value);
  }, [value]);

  // Função para otimizar a imagem antes do upload
  const optimizeImage = async (file: File): Promise<Blob> => {
    try {
      // Primeiro redimensionar a imagem
      const resizedImage = await resizeImage(file, maxWidth, maxHeight, quality);
      
      // Se o navegador suporta WebP e a opção está ativada, converter para WebP
      if (supportsWebPFormat && optimizeImages) {
        return await convertToWebP(new File([resizedImage], file.name, { type: resizedImage.type }), quality);
      }
      
      return resizedImage;
    } catch (err) {
      console.error('Erro ao otimizar imagem:', err);
      // Se falhar na otimização, retornar o arquivo original
      return file;
    }
  };

  // Função para processar o upload do arquivo
  const processFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!file) {
        throw new Error('Nenhum arquivo selecionado');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('A imagem deve ter no máximo 5MB');
      }

      // Otimizar a imagem se a opção estiver ativada
      const fileToUpload = optimizeImages 
        ? await optimizeImage(file)
        : file;
      
      // Criar um nome de arquivo único com a extensão correta
      const fileExt = optimizeImages && supportsWebPFormat 
        ? 'webp' 
        : file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      let url: string;
      
      // Método 1: Usar o hook useStorage (se disponível)
      if (uploadFile) {
        url = await uploadFile(
          new File([fileToUpload], fileName, { type: fileToUpload.type }),
          bucket
        );
      } 
      // Método 2: Upload direto para o Supabase Storage
      else {
        // Upload direto para o Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Obter a URL pública
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        
        url = publicUrlData.publicUrl;
      }
      
      // Criar URL de preview temporária
      const objectUrl = URL.createObjectURL(fileToUpload);
      setPreview(objectUrl);
      
      // Notificar sobre a mudança
      if (onChange) {
        onChange(url);
      }
      
      toast({
        title: 'Sucesso',
        description: 'Imagem carregada com sucesso',
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Não foi possível fazer o upload da imagem');
      toast({
        title: 'Erro ao fazer upload',
        description: err instanceof Error ? err.message : 'Não foi possível fazer o upload da imagem',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Configuração do dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        await processFileUpload(file);
      }
    }, []),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: loading,
  });

  // Função para lidar com a seleção de arquivo via input padrão
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFileUpload(file);
    }
    
    // Limpar o valor do input para permitir selecionar o mesmo arquivo novamente
    if (e.target) e.target.value = '';
  };

  // Função para remover a imagem
  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    
    // Remover o arquivo no Supabase Storage se a URL existir
    if (value && value.includes(bucket)) {
      try {
        // Extrair o nome do arquivo da URL
        const urlParts = value.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Excluir o arquivo no Supabase
        supabase.storage
          .from(bucket)
          .remove([fileName])
          .then(({ error }) => {
            if (error) {
              console.error(`Erro ao excluir imagem do storage (${bucket}):`, error);
            }
          });
      } catch (error) {
        console.error('Erro ao processar exclusão da imagem:', error);
      }
    }
    
    // Notificar sobre a remoção
    if (onRemove) {
      onRemove();
    } else if (onChange) {
      onChange(null);
    }
    
    toast({
      title: 'Imagem removida',
      description: 'A imagem foi removida com sucesso'
    });
  };

  // Função para acionar o input de arquivo
  const triggerFileInput = () => {
    if (!loading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Renderização do componente
  return (
    <div className={`space-y-2 ${className}`}>
      {title && <Label>{title}</Label>}
      
      <div 
        className={`border-2 border-dashed ${error ? 'border-red-300 bg-red-50' : isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'} 
          rounded-lg p-4 relative ${loading ? 'opacity-70' : ''}`}
      >
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {preview ? (
          <div className="relative">
            <OptimizedImage 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-contain rounded-md"
              fallbackSrc="https://via.placeholder.com/400x300?text=Imagem+indisponível"
              onError={() => {
                setError("Não foi possível carregar a imagem");
                setPreview(null);
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : useDropzoneMode ? (
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center h-48">
              {loading ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="mt-2 text-sm text-gray-500">Enviando imagem...</p>
                </>
              ) : (
                <>
                  <div className="bg-gray-100 p-3 rounded-full">
                    <ImageIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <p className="mt-2 text-sm text-center text-gray-500">
                    {isDragActive ? (
                      "Solte a imagem aqui"
                    ) : (
                      <>
                        Arraste e solte uma imagem aqui, ou clique para selecionar
                        <br />
                        <span className="text-xs text-gray-400">
                          PNG, JPG, GIF ou WEBP (max. 5MB)
                          {optimizeImages && <> - Imagens serão otimizadas automaticamente</>}
                        </span>
                      </>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-48 cursor-pointer"
            onClick={triggerFileInput}
          >
            {loading ? (
              <>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="mt-2 text-sm text-gray-500">Enviando imagem...</p>
              </>
            ) : (
              <>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Upload className="h-6 w-6 text-gray-500" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">
                  Clique para adicionar uma imagem
                  <br />
                  <span className="text-xs text-gray-400">
                    PNG, JPG, GIF ou WEBP (max. 5MB)
                    {optimizeImages && <> - Imagens serão otimizadas automaticamente</>}
                  </span>
                </p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
} 