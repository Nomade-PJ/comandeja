import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useStorage } from '@/hooks/useStorage';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { uploadFile } = useStorage();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setLoading(true);
      const file = acceptedFiles[0];
      
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

      const url = await uploadFile(file, 'banners');
      onChange(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro ao fazer upload',
        description: error instanceof Error ? error.message : 'Não foi possível fazer o upload da imagem',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [onChange, toast, uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div className="space-y-4 w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 hover:bg-gray-50 transition
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />
        {value ? (
          <div className="relative aspect-video w-full">
            <img
              src={value}
              alt="Banner preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
            <div className="text-sm text-center text-gray-600">
              {isDragActive ? (
                <p>Solte a imagem aqui</p>
              ) : (
                <p>
                  Arraste e solte uma imagem aqui, ou clique para selecionar
                  <br />
                  <span className="text-xs text-gray-400">
                    PNG, JPG ou GIF (max. 5MB)
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 