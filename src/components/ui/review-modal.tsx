import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    order_number: string;
    restaurant_id: string;
    customer_name: string;
    total: number;
  };
  onReviewSubmitted?: () => void;
}

export const ReviewModal = ({ open, onOpenChange, order, onReviewSubmitted }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: 'Avaliação obrigatória',
        description: 'Por favor, selecione uma nota de 1 a 5 estrelas.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Buscar customer_id baseado no pedido
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('name', order.customer_name)
        .eq('restaurant_id', order.restaurant_id)
        .single();

      if (customerError) {
        console.error('Erro ao buscar cliente:', customerError);
        toast({
          title: 'Erro',
          description: 'Não foi possível encontrar suas informações.',
          variant: 'destructive',
        });
        return;
      }

      // Inserir avaliação
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          restaurant_id: order.restaurant_id,
          order_id: order.id,
          customer_id: customerData.id,
          rating: rating,
          comment: comment.trim() || null,
        });

      if (reviewError) {
        console.error('Erro ao salvar avaliação:', reviewError);
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar sua avaliação.',
          variant: 'destructive',
        });
        return;
      }

      // Sucesso
      toast({
        title: 'Avaliação enviada! ⭐',
        description: 'Obrigado pelo seu feedback! Você ganhou 10% de desconto no próximo pedido.',
      });

      // Fechar modal e resetar formulário
      onOpenChange(false);
      setRating(0);
      setComment('');
      
      // Callback opcional
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    const texts = {
      1: 'Muito ruim 😞',
      2: 'Ruim 😕',
      3: 'Regular 😐',
      4: 'Bom 😊',
      5: 'Excelente! 🤩'
    };
    return texts[rating as keyof typeof texts] || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            🌟 Avalie seu Pedido #{order.order_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Avaliação por estrelas */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Como foi sua experiência?
            </p>
            
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {(hoveredRating || rating) > 0 && (
              <p className="text-sm font-medium text-primary">
                {getRatingText(hoveredRating || rating)}
              </p>
            )}
          </div>

          {/* Comentário opcional */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comentário (opcional)
            </label>
            <Textarea
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500 caracteres
            </p>
          </div>

          {/* Incentivo */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-800">
              🎁 <strong>Avalie e ganhe 10% OFF</strong> no seu próximo pedido!
            </p>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Agora não
            </Button>
            <Button
              onClick={handleSubmitReview}
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal; 