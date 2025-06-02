import React, { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Loader2, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import PaymentMethodForm from './PaymentMethodForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface PaymentMethod {
  id: string;
  payment_type: string;
  is_default: boolean;
  card_last_four?: string;
  card_brand?: string;
  card_holder_name?: string;
  card_expiry_month?: string;
  card_expiry_year?: string;
  pix_key_type?: string;
  pix_key?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billing: string;
  totalPrice: number;
}

interface PaymentProcessProps {
  userId: string;
  restaurantId: string;
  plan: Plan;
  trialId?: string;
  onSuccess: (subscriptionId: string) => void;
  userEmail: string;
  userName: string;
  preSelectedMethod?: string;
}

const PaymentProcess = ({ 
  userId, 
  restaurantId, 
  plan, 
  trialId, 
  onSuccess,
  userEmail,
  userName,
  preSelectedMethod
}: PaymentProcessProps) => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [showNewMethodForm, setShowNewMethodForm] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64: string;
    transactionId: string;
  } | null>(null);
  const [pixStatus, setPixStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [checkingPixStatus, setCheckingPixStatus] = useState(false);

  // Carregar métodos de pagamento do usuário
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await fetch(`/api/payment-methods/${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setPaymentMethods(data.paymentMethods);
          
          // Se temos um método pré-selecionado (do fluxo de registro), procurar pelo método que corresponda ao tipo
          if (preSelectedMethod && data.paymentMethods.length > 0) {
            const methodOfSelectedType = data.paymentMethods.find(
              (method: PaymentMethod) => method.payment_type === (preSelectedMethod === 'card' ? 'credit_card' : 'pix')
            );
            
            if (methodOfSelectedType) {
              setSelectedMethodId(methodOfSelectedType.id);
              return;
            }
          }
          
          // Caso não tenha encontrado o método pré-selecionado, seguir com a lógica padrão
          const defaultMethod = data.paymentMethods.find((method: PaymentMethod) => method.is_default);
          if (defaultMethod) {
            setSelectedMethodId(defaultMethod.id);
          } else if (data.paymentMethods.length > 0) {
            setSelectedMethodId(data.paymentMethods[0].id);
          } else {
            setShowNewMethodForm(true);
          }
        } else {
          setShowNewMethodForm(true);
        }
      } catch (error) {
        toast({
          title: 'Erro ao carregar métodos de pagamento',
          description: 'Não foi possível carregar seus métodos de pagamento',
          variant: 'destructive',
        });
        setShowNewMethodForm(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadPaymentMethods();
  }, [userId, toast, preSelectedMethod]);

  // Verificar status do PIX periodicamente
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (pixData && pixStatus === 'pending') {
      interval = setInterval(checkPixStatus, 5000); // Verificar a cada 5 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pixData, pixStatus]);

  const checkPixStatus = async () => {
    if (!pixData) return;
    
    setCheckingPixStatus(true);
    try {
      const response = await fetch(`/api/payments/pix/status/${pixData.transactionId}`);
      const data = await response.json();
      
      if (data.success) {
        if (data.status === 'approved') {
          setPixStatus('completed');
          toast({
            title: 'Pagamento aprovado!',
            description: 'Seu pagamento foi confirmado com sucesso.',
          });
          
          // Buscar o ID da assinatura criada
          setTimeout(async () => {
            try {
              const subscriptionResponse = await fetch(`/api/subscriptions/restaurant/${restaurantId}`);
              const subscriptionData = await subscriptionResponse.json();
              
              if (subscriptionData.success && subscriptionData.subscription) {
                onSuccess(subscriptionData.subscription.id);
              }
            } catch (error) {
              console.error('Erro ao buscar assinatura:', error);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status do PIX:', error);
    } finally {
      setCheckingPixStatus(false);
    }
  };

  const handleNewMethodSaved = (methodId: string, type: string) => {
    // Recarregar métodos de pagamento
    fetch(`/api/payment-methods/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPaymentMethods(data.paymentMethods);
          setSelectedMethodId(methodId);
          setShowNewMethodForm(false);
          
          toast({
            title: 'Método de pagamento adicionado',
            description: 'Seu método de pagamento foi adicionado com sucesso!',
          });
        }
      })
      .catch(error => {
        console.error('Erro ao recarregar métodos de pagamento:', error);
      });
  };

  const processPayment = async () => {
    if (!selectedMethodId) {
      toast({
        title: 'Selecione um método de pagamento',
        description: 'Por favor, selecione ou adicione um método de pagamento para continuar.',
        variant: 'destructive',
      });
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      // Obter o método de pagamento selecionado
      const selectedMethod = paymentMethods.find(method => method.id === selectedMethodId);
      
      if (!selectedMethod) {
        throw new Error('Método de pagamento não encontrado');
      }
      
      if (selectedMethod.payment_type === 'credit_card') {
        // Processar pagamento com cartão
        const response = await fetch('/api/payments/card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            restaurantId,
            paymentMethodId: selectedMethodId,
            planId: plan.id,
            amount: plan.totalPrice,
            planName: plan.name,
            email: userEmail,
            cardToken: 'SIMULATED_CARD_TOKEN', // Em produção, isso viria do gateway
            trialId
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: 'Pagamento processado com sucesso!',
            description: 'Seu pagamento foi aprovado.',
          });
          
          onSuccess(result.subscriptionId || 'new-subscription');
        } else {
          throw new Error(result.error || 'Não foi possível processar o pagamento');
        }
      } else if (selectedMethod.payment_type === 'pix') {
        // Processar pagamento com PIX
        const response = await fetch('/api/payments/pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            restaurantId,
            paymentMethodId: selectedMethodId,
            planId: plan.id,
            amount: plan.totalPrice,
            planName: plan.name,
            email: userEmail,
            firstName: userName.split(' ')[0],
            lastName: userName.split(' ').slice(1).join(' '),
            trialId
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setPixData({
            qrCode: result.qrCode,
            qrCodeBase64: result.qrCodeBase64,
            transactionId: result.transactionId
          });
          
          toast({
            title: 'PIX gerado com sucesso!',
            description: 'Escaneie o QR Code para completar o pagamento.',
          });
        } else {
          throw new Error(result.error || 'Não foi possível gerar o PIX');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message || 'Não foi possível processar seu pagamento.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2">Carregando métodos de pagamento...</span>
      </div>
    );
  }

  // Renderização do QR Code do PIX
  if (pixData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-purple-600" />
            Pagamento via PIX
          </CardTitle>
          <CardDescription>
            Escaneie o QR Code abaixo para finalizar seu pagamento de R$ {plan.totalPrice.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {pixStatus === 'completed' ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-600">Pagamento Aprovado!</h3>
              <p className="mt-2 text-gray-600">
                Seu pagamento foi confirmado e sua assinatura está ativa.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-white rounded-lg shadow-sm border mb-4">
                <img 
                  src={pixData.qrCodeBase64} 
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="pix-code">
                  <AccordionTrigger>Copiar código PIX</AccordionTrigger>
                  <AccordionContent>
                    <div className="p-3 bg-gray-100 rounded-md text-sm font-mono break-all">
                      {pixData.qrCode}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.qrCode);
                        toast({
                          title: 'Código copiado!',
                          description: 'O código PIX foi copiado para a área de transferência.',
                        });
                      }}
                    >
                      Copiar código
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>• Abra o aplicativo do seu banco</p>
                <p>• Escolha a opção PIX</p>
                <p>• Escaneie o QR Code ou cole o código</p>
                <p>• Confirme as informações e finalize o pagamento</p>
              </div>
              
              <div className="mt-6 flex items-center">
                <Badge variant="outline" className="flex items-center gap-1">
                  {checkingPixStatus ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                  )}
                  <span>Aguardando pagamento</span>
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={checkPixStatus}
                  disabled={checkingPixStatus}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${checkingPixStatus ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </>
          )}
        </CardContent>
        {pixStatus === 'completed' && (
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onSuccess('new-subscription')}
            >
              Continuar para o Dashboard
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Finalizar Pagamento</CardTitle>
          <CardDescription>
            Plano {plan.name} - R$ {plan.price.toFixed(2)}{plan.id !== 'monthly' ? ' /mês' : ''}
            <br />
            {plan.billing}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showNewMethodForm ? (
            <PaymentMethodForm 
              userId={userId} 
              restaurantId={restaurantId} 
              onSaveMethod={handleNewMethodSaved} 
            />
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Métodos de Pagamento</h3>
                
                {paymentMethods.length > 0 ? (
                  <RadioGroup 
                    value={selectedMethodId || ''} 
                    onValueChange={setSelectedMethodId}
                    className="space-y-3"
                  >
                    {paymentMethods.map(method => (
                      <div 
                        key={method.id} 
                        className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <label 
                          htmlFor={method.id} 
                          className="flex items-center flex-1 cursor-pointer"
                        >
                          {method.payment_type === 'credit_card' ? (
                            <div className="flex items-center">
                              <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                              <div>
                                <span className="capitalize">{method.card_brand}</span>
                                <span className="text-gray-600"> •••• {method.card_last_four}</span>
                                <div className="text-xs text-gray-500">
                                  {method.card_holder_name} | Exp: {method.card_expiry_month}/{method.card_expiry_year}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <QrCode className="h-5 w-5 mr-2 text-gray-500" />
                              <div>
                                PIX
                                <div className="text-xs text-gray-500">
                                  {method.pix_key_type}: {method.pix_key}
                                </div>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-gray-500">Nenhum método de pagamento cadastrado</p>
                  </div>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setShowNewMethodForm(true)}
                    >
                      Adicionar novo método de pagamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar método de pagamento</DialogTitle>
                      <DialogDescription>
                        Adicione um novo método de pagamento para sua conta.
                      </DialogDescription>
                    </DialogHeader>
                    <PaymentMethodForm 
                      userId={userId} 
                      restaurantId={restaurantId} 
                      onSaveMethod={handleNewMethodSaved} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={processPayment}
                disabled={processingPayment || !selectedMethodId}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Finalizar Pagamento'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcess; 