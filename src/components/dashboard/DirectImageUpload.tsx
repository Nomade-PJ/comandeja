import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface DirectImageUploadProps {
  onImageUrlChange: (url: string | null) => void;
  initialImageUrl: string | null;
  className?: string;
}

const DirectImageUpload = ({ onImageUrlChange, initialImageUrl, className = '' }: DirectImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Atualizar o preview quando a URL inicial mudar
  useEffect(() => {
    setPreview(initialImageUrl);
  }, [initialImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError(null);
    
    if (!file) return;
    
    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB");
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP");
      toast({
        title: "Erro",
        description: "Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP",
        variant: "destructive"
      });
      return;
    }
    
    // Criar URL de preview temporária para a imagem selecionada
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    try {
      setLoading(true);
      
      // Criar um nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      console.log('Fazendo upload da imagem:', fileName);
      
      // Upload direto para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Erro no upload:', error);
        setError(`Erro no upload: ${error.message}`);
        toast({
          title: "Erro no upload",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Upload bem-sucedido:', data);
      
      // Obter a URL pública
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
      
      const publicUrl = publicUrlData.publicUrl;
      console.log('URL pública:', publicUrl);
      
      // Notificar o componente pai sobre a nova URL
      onImageUrlChange(publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso",
      });
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError(`Erro inesperado: ${err.message || 'Desconhecido'}`);
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      
      // Limpar o valor do input para permitir selecionar o mesmo arquivo novamente
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    
    // Remover o arquivo no Supabase Storage se a URL inicial existir
    if (initialImageUrl) {
      try {
        // Extrair o nome do arquivo da URL
        const urlParts = initialImageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        console.log(`Tentando excluir imagem: ${fileName} do bucket products`);
        
        // Excluir o arquivo no Supabase
        supabase.storage
          .from('products')
          .remove([fileName])
          .then(({ error }) => {
            if (error) {
              console.error('Erro ao excluir imagem do storage:', error);
            } else {
              console.log('Imagem excluída com sucesso do storage');
            }
          });
      } catch (error) {
        console.error('Erro ao processar exclusão da imagem:', error);
      }
    }
    
    // Notificar o componente pai que a imagem foi removida
    // Isto garante que o null seja passado explicitamente para o componente pai
    onImageUrlChange(null);
    
    toast({
      title: "Imagem removida",
      description: "A imagem foi removida com sucesso"
    });
  };

  const triggerFileInput = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>Imagem do Produto</Label>
      <div 
        className={`border-2 border-dashed ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'} 
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
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-contain rounded-md"
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
        ) : (
          <div 
            className={`flex flex-col items-center justify-center h-48 cursor-pointer ${loading ? 'pointer-events-none' : ''}`}
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
                  <ImageIcon className="h-6 w-6 text-gray-500" />
                </div>
                <p className="mt-2 text-sm text-gray-500">Clique para adicionar uma imagem</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG ou GIF até 5MB</p>
              </>
            )}
          </div>
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
    </div>
  );
};

export default DirectImageUpload; 