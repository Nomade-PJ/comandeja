import React, { useState } from 'react';
import { CreditCard, QrCode } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const cardFormSchema = z.object({
  cardHolderName: z.string().min(3, {
    message: 'O nome do titular deve ter pelo menos 3 caracteres',
  }),
  cardNumber: z.string().regex(/^[0-9]{16}$/, {
    message: 'Número de cartão inválido, deve ter 16 dígitos',
  }),
  cardExpiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, {
    message: 'Mês inválido',
  }),
  cardExpiryYear: z.string().regex(/^[0-9]{4}$/, {
    message: 'Ano inválido',
  }),
  cardCvc: z.string().regex(/^[0-9]{3,4}$/, {
    message: 'CVC inválido',
  }),
  saveCard: z.boolean().optional(),
});

const pixFormSchema = z.object({
  pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random'], {
    required_error: 'Selecione um tipo de chave PIX',
  }),
  pixKey: z.string().min(1, {
    message: 'A chave PIX é obrigatória',
  }),
});

type CardFormValues = z.infer<typeof cardFormSchema>;
type PixFormValues = z.infer<typeof pixFormSchema>;

interface PaymentMethodFormProps {
  userId: string;
  restaurantId: string;
  onSaveMethod: (methodId: string, type: string) => void;
}

const PaymentMethodForm = ({ userId, restaurantId, onSaveMethod }: PaymentMethodFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário do cartão
  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardHolderName: '',
      cardNumber: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCvc: '',
      saveCard: true,
    },
  });

  // Formulário do PIX
  const pixForm = useForm<PixFormValues>({
    resolver: zodResolver(pixFormSchema),
    defaultValues: {
      pixKeyType: 'cpf',
      pixKey: '',
    },
  });

  const saveCardMethod = async (data: CardFormValues) => {
    setIsSubmitting(true);
    try {
      // Em produção, aqui seria feita a tokenização do cartão com a API do gateway de pagamento
      // Simula um card token
      const cardToken = 'SIMULATED_CARD_TOKEN_' + Date.now().toString();
      
      // Envio para o servidor
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          restaurantId,
          paymentType: 'credit_card',
          cardLastFour: data.cardNumber.slice(-4),
          cardBrand: getCardBrand(data.cardNumber),
          cardHolderName: data.cardHolderName,
          cardExpiryMonth: data.cardExpiryMonth,
          cardExpiryYear: data.cardExpiryYear,
          cardNumber: data.cardNumber, // Na implementação real, isso nunca deve ser enviado diretamente
          cardToken,
          isDefault: true,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Método de pagamento salvo!',
          description: 'Seu cartão foi salvo com sucesso.',
        });
        
        onSaveMethod(result.paymentMethodId, 'credit_card');
      } else {
        throw new Error(result.error || 'Não foi possível salvar o cartão');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar o cartão',
        description: error.message || 'Não foi possível salvar o método de pagamento',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const savePixMethod = async (data: PixFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          restaurantId,
          paymentType: 'pix',
          pixKeyType: data.pixKeyType,
          pixKey: data.pixKey,
          isDefault: true,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Método de pagamento PIX salvo!',
          description: 'Sua chave PIX foi salva com sucesso.',
        });
        
        onSaveMethod(result.paymentMethodId, 'pix');
      } else {
        throw new Error(result.error || 'Não foi possível salvar a chave PIX');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar a chave PIX',
        description: error.message || 'Não foi possível salvar o método de pagamento',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para identificar a bandeira do cartão
  const getCardBrand = (cardNumber: string): string => {
    // Simulação simples de identificação da bandeira
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    if (firstDigit === '3') return 'amex';
    return 'other';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="card">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Cartão de Crédito
          </TabsTrigger>
          <TabsTrigger value="pix" className="flex items-center">
            <QrCode className="h-4 w-4 mr-2" />
            PIX
          </TabsTrigger>
        </TabsList>
        
        {/* Formulário de Cartão */}
        <TabsContent value="card">
          <div className="space-y-6 mt-4">
            <Form {...cardForm}>
              <form onSubmit={cardForm.handleSubmit(saveCardMethod)} className="space-y-4">
                <FormField
                  control={cardForm.control}
                  name="cardHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Titular</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome como está no cartão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={cardForm.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Cartão</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1234 5678 9012 3456" 
                          {...field} 
                          onChange={(e) => {
                            // Permitir apenas números
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                          maxLength={16}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={cardForm.control}
                    name="cardExpiryMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mês</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MM" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                            maxLength={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={cardForm.control}
                    name="cardExpiryYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="AAAA" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                            maxLength={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={cardForm.control}
                    name="cardCvc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVC</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                            maxLength={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Cartão'}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
        
        {/* Formulário de PIX */}
        <TabsContent value="pix">
          <div className="space-y-6 mt-4">
            <Form {...pixForm}>
              <form onSubmit={pixForm.handleSubmit(savePixMethod)} className="space-y-4">
                <FormField
                  control={pixForm.control}
                  name="pixKeyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Chave PIX</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de chave" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Escolha o tipo de chave PIX que você deseja utilizar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={pixForm.control}
                  name="pixKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave PIX</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite sua chave PIX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar PIX'}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentMethodForm; 