import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, bucket: string = 'banners') => {
    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (url: string, bucket: string = 'public') => {
    try {
      const filePath = url.split('/').pop();
      if (!filePath) return false;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  };

  const uploadImage = async (file: File, bucket: string = 'products') => {
    if (!file) return null;
    
    try {
      setUploading(true);
      console.log(`Iniciando upload da imagem...`);
      
      // Criar um nome de arquivo único usando UUID
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      console.log(`Nome do arquivo: ${fileName}`);
      
      // Upload do arquivo para o Supabase Storage
      console.log(`Fazendo upload do arquivo...`);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Usar upsert para substituir se já existir
        });
      
      if (error) {
        console.error('Erro no upload da imagem:', error);
        toast({
          title: "Erro",
          description: `Falha ao fazer upload da imagem: ${error.message}`,
          variant: "destructive"
        });
        return null;
      }
      
      console.log('Upload concluído com sucesso:', data);
      
      // Gerar URL pública para a imagem
      const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      console.log('URL pública gerada:', publicUrl);
        
      return publicUrl.publicUrl;
    } catch (error: any) {
      console.error('Erro inesperado durante o upload:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado durante o upload",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const deleteImage = async (url: string, bucket: string = 'products') => {
    if (!url) return false;
    
    try {
      console.log(`Tentando excluir imagem: ${url}`);
      
      // Extrair o nome do arquivo da URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (!fileName) {
        console.error('Nome do arquivo não encontrado na URL:', url);
        return false;
      }
      
      console.log(`Excluindo arquivo ${fileName}...`);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);
      
      if (error) {
        console.error('Erro ao deletar imagem:', error);
        toast({
          title: "Erro",
          description: `Falha ao excluir imagem: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Imagem excluída com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro inesperado ao excluir imagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado ao excluir a imagem",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    uploadFile,
    deleteFile,
    uploading,
    uploadImage,
    deleteImage
  };
} 