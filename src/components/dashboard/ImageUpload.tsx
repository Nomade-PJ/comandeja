import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  previewUrl: string | null;
  onRemove?: () => void;
  className?: string;
}

const ImageUpload = ({ onImageChange, previewUrl, onRemove, className = '' }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError(null);
    
    if (file) {
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
      
      // Criar URL de preview para a imagem selecionada
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Passar o arquivo para o componente pai
      onImageChange(file);
      
      // Limpar o valor do input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageChange(null);
    if (onRemove) onRemove();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>Imagem do Produto</Label>
      <div className={`border-2 border-dashed ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-4 relative`}>
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
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-48 cursor-pointer"
            onClick={triggerFileInput}
          >
            <div className="bg-gray-100 p-3 rounded-full">
              <ImageIcon className="h-6 w-6 text-gray-500" />
            </div>
            <p className="mt-2 text-sm text-gray-500">Clique para adicionar uma imagem</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG ou GIF até 5MB</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload; 