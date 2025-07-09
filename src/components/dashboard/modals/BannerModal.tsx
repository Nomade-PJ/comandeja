import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/dashboard/ImageUpload';
import { Banner } from '@/integrations/supabase/types';

const bannerSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional(),
  image_url: z.string().min(1, 'A imagem é obrigatória'),
  link_url: z.string().url('URL inválida').optional().or(z.literal('')),
  coupon_code: z.string().optional(),
  discount_value: z.number().min(0).optional(),
  start_date: z.string().min(1, 'A data de início é obrigatória'),
  end_date: z.string().min(1, 'A data de término é obrigatória'),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BannerFormValues) => Promise<void>;
  banner?: Banner;
}

export function BannerModal({ isOpen, onClose, onSubmit, banner }: BannerModalProps) {
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      coupon_code: '',
      discount_value: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (banner) {
      form.reset({
        title: banner.title,
        description: banner.description || '',
        image_url: banner.image_url,
        link_url: banner.link_url || '',
        coupon_code: banner.coupon_code || '',
        discount_value: banner.discount_value || 0,
        start_date: banner.start_date.split('T')[0],
        end_date: banner.end_date.split('T')[0],
        is_active: banner.is_active || true,
        display_order: banner.display_order || 0,
      });
    }
  }, [banner, form]);

  const handleSubmit = async (data: BannerFormValues) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{banner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange('')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="link_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (opcional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coupon_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Cupom (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Desconto (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {banner ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 