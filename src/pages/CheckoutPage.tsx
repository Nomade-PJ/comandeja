import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Loader2, AlertCircle, UserPlus, CreditCard, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PaymentProcess from '@/components/PaymentProcess';

// Componente para selecionar método de pagamento para usuários não logados
const PaymentMethodSelector = ({ onComplete }: { onComplete: (method: string) => void }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSelectMethod = (method: string) => {
    setSelectedMethod(method);
  };

  const handleSubmit = () => {
    if (!selectedMethod) {
      toast({
        title: "Selecione um método de pagamento",
        description: "Por favor, selecione um método de pagamento para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simular processamento
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete(selectedMethod);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de Pagamento</CardTitle>
        <CardDescription>
          Escolha como deseja pagar após o período de teste gratuito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className={`p-4 border rounded-md cursor-pointer transition-colors ${
              selectedMethod === 'card' ? 'bg-purple-50 border-purple-500' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelectMethod('card')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                selectedMethod === 'card' ? 'border-purple-600' : 'border-gray-300'
              }`}>
                {selectedMethod === 'card' && <div className="w-3 h-3 bg-purple-600 rounded-full"></div>}
              </div>
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <span className="font-medium">Cartão de Crédito</span>
                  <p className="text-sm text-gray-500">Visa, Mastercard, Elo, etc.</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className={`p-4 border rounded-md cursor-pointer transition-colors ${
              selectedMethod === 'pix' ? 'bg-purple-50 border-purple-500' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelectMethod('pix')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                selectedMethod === 'pix' ? 'border-purple-600' : 'border-gray-300'
              }`}>
                {selectedMethod === 'pix' && <div className="w-3 h-3 bg-purple-600 rounded-full"></div>}
              </div>
              <div className="flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <span className="font-medium">PIX</span>
                  <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedMethod}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : 'Continuar para o cadastro'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [trialData, setTrialData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  
  // Preços base mensais
  const monthlyPrice = 89.9;
  const sixMonthsPrice = 76.42 * 6; // Equivalente a R$ 458,49 no total
  const yearlyPrice = 67.42 * 12; // Equivalente a R$ 809,10 no total

  // Planos disponíveis
  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      description: 'Ideal para pequenos negócios ou para testar a plataforma',
      price: monthlyPrice,
      period: '/ mês',
      totalPrice: monthlyPrice,
      billing: 'Cobrança mensal',
      discount: 0,
    },
    {
      id: 'six-months',
      name: 'Semestral',
      description: 'Economize 15% com um plano de médio prazo',
      price: 76.42,
      period: '/ mês',
      totalPrice: 458.49,
      billing: 'Cobrança única de R$ 458.49',
      discount: 15,
    },
    {
      id: 'yearly',
      name: 'Anual',
      description: 'A melhor opção para estabelecimentos em crescimento — Economize 25%',
      price: 67.42,
      period: '/ mês',
      totalPrice: 809.10,
      billing: 'Cobrança única de R$ 809.10',
      discount: 25,
    },
  ];

  useEffect(() => {
    // Verificar se o usuário está logado, recuperando dados da sessão
    const userData = sessionStorage.getItem('user');
    const isUserLoggedIn = !!userData;
    setIsLoggedIn(isUserLoggedIn);
    
    if (isUserLoggedIn) {
      const user = JSON.parse(userData!);
      setUserData(user);
      
      // Verificar se há um método de pagamento pré-selecionado no session storage
      // (caso o usuário venha do fluxo registro -> checkout)
      const savedPaymentMethod = sessionStorage.getItem('selectedPaymentMethod');
      if (savedPaymentMethod) {
        setPaymentMethod(savedPaymentMethod);
      }
      
      // Verificar se o restaurante tem um período de teste ativo
      const fetchTrialData = async () => {
        try {
          if (!user.restaurantId) {
            setLoading(false);
            return;
          }
          
          const response = await fetch(`/api/trial-periods/${user.restaurantId}`);
          const data = await response.json();
          
          if (data.success && data.trialPeriod) {
            setTrialData(data.trialPeriod);
          }
        } catch (error) {
          console.error('Erro ao buscar período de teste:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTrialData();
    } else {
      setLoading(false);
    }
    
    // Obter informações do plano selecionado
    const planId = state?.selectedPlan || sessionStorage.getItem('selectedPlan');
    
    if (!planId) {
      toast({
        title: 'Nenhum plano selecionado',
        description: 'Por favor, selecione um plano para continuar.',
      });
      navigate('/plans');
      return;
    }
    
    // Armazenar o plano selecionado na sessão
    if (state?.selectedPlan) {
      sessionStorage.setItem('selectedPlan', state.selectedPlan);
    }
    
    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(plan);
    
  }, [navigate, state, toast]);

  const handlePaymentSuccess = (subscriptionId: string) => {
    toast({
      title: 'Assinatura ativada com sucesso!',
      description: 'Você será redirecionado para o dashboard.',
    });
    
    // Atualizar dados da sessão para incluir informações da assinatura
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };
  
  const handlePaymentMethodSelected = (method: string) => {
    setPaymentMethod(method);
    // Armazenar método de pagamento selecionado
    sessionStorage.setItem('selectedPaymentMethod', method);
    sessionStorage.setItem('redirect_to_dashboard', 'true');
    
    // Redirecionar para o cadastro
    navigate('/register', { 
      state: { 
        selectedPlan: selectedPlan?.id, 
        paymentMethod: method,
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2">Carregando dados do checkout...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 flex justify-between items-center">
          <div className="flex items-center -my-12">
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="ComandeJá" className="h-40 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/plans" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para os planos
            </Link>
          </div>
          
          {!isLoggedIn ? (
            // Modo para usuários não logados
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Resumo do seu plano</h1>
                <p className="text-gray-600 mt-2">
                  Você selecionou o plano {selectedPlan?.name}. Continue escolhendo seu método de pagamento.
                </p>
              </div>
              
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Período de teste gratuito</AlertTitle>
                <AlertDescription>
                  Você terá acesso gratuito por 7 dias. Após este período, será cobrado conforme o plano selecionado.
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-5 gap-8">
                {/* Resumo do pedido */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo do Pedido</CardTitle>
                      <CardDescription>Detalhes do plano selecionado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedPlan && (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                            <p className="text-gray-500">{selectedPlan.description}</p>
                          </div>
                          
                          <div className="border-t pt-4">
                            <div className="flex justify-between text-sm">
                              <span>Preço base</span>
                              <span>R$ {selectedPlan.price.toFixed(2)} {selectedPlan.period}</span>
                            </div>
                            
                            {selectedPlan.discount > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Desconto</span>
                                <span>-{selectedPlan.discount}%</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                              <span>Total</span>
                              <span>R$ {selectedPlan.totalPrice.toFixed(2)}</span>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-1">
                              {selectedPlan.billing}
                            </div>
                          </div>
                          
                          <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md">
                              <div className="text-blue-700">Primeiro pagamento</div>
                              <div className="text-blue-700 font-bold">Grátis por 7 dias</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-4">
                            <h4 className="text-sm font-medium">O que está incluído:</h4>
                            <ul className="space-y-1">
                              <li className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Cardápio digital completo</span>
                              </li>
                              <li className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Gestão de pedidos e mesas</span>
                              </li>
                              <li className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Dashboard administrativo</span>
                              </li>
                              <li className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>QR Codes para mesas</span>
                              </li>
                              <li className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Suporte técnico</span>
                              </li>
                              {selectedPlan.id !== 'monthly' && (
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  <span>Relatórios avançados</span>
                                </li>
                              )}
                              {selectedPlan.id === 'yearly' && (
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  <span>Personalização completa</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Seleção de método de pagamento */}
                <div className="md:col-span-3">
                  <PaymentMethodSelector onComplete={handlePaymentMethodSelected} />
                  
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Próximos passos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-purple-100 rounded-full p-2 mr-3">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">1. Informar método de pagamento</h4>
                          <p className="text-sm text-gray-500">
                            Escolha como deseja pagar após o período gratuito
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start opacity-50">
                        <div className="bg-gray-100 rounded-full p-2 mr-3">
                          <UserPlus className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">2. Criar sua conta</h4>
                          <p className="text-sm text-gray-500">
                            Cadastre os dados do seu estabelecimento e crie seu acesso
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            // Modo para usuários já logados
            <div className="grid md:grid-cols-5 gap-8">
              {/* Resumo do pedido */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                    <CardDescription>Detalhes do plano selecionado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedPlan && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                          <p className="text-gray-500">{selectedPlan.description}</p>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-sm">
                            <span>Preço base</span>
                            <span>R$ {selectedPlan.price.toFixed(2)} {selectedPlan.period}</span>
                          </div>
                          
                          {selectedPlan.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Desconto</span>
                              <span>-{selectedPlan.discount}%</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                            <span>Total</span>
                            <span>R$ {selectedPlan.totalPrice.toFixed(2)}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedPlan.billing}
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <h4 className="text-sm font-medium">O que está incluído:</h4>
                          <ul className="space-y-1">
                            <li className="flex items-start text-sm">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>Cardápio digital completo</span>
                            </li>
                            <li className="flex items-start text-sm">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>Gestão de pedidos e mesas</span>
                            </li>
                            <li className="flex items-start text-sm">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>Dashboard administrativo</span>
                            </li>
                            <li className="flex items-start text-sm">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>QR Codes para mesas</span>
                            </li>
                            <li className="flex items-start text-sm">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>Suporte técnico</span>
                            </li>
                            {selectedPlan.id !== 'monthly' && (
                              <li className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Relatórios avançados</span>
                              </li>
                            )}
                            {selectedPlan.id === 'yearly' && (
                              <li className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>Personalização completa</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {trialData && (
                    <CardFooter>
                      <div className="w-full p-3 bg-blue-50 rounded-md border border-blue-100">
                        <p className="text-sm text-blue-700">
                          Você ainda tem um período de teste ativo que termina em{' '}
                          {new Date(trialData.end_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </div>
              
              {/* Formulário de pagamento */}
              <div className="md:col-span-3">
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Período de teste gratuito</AlertTitle>
                  <AlertDescription>
                    Você terá acesso gratuito por 7 dias. Após este período, será cobrado conforme o plano selecionado.
                  </AlertDescription>
                </Alert>
                
                {userData && selectedPlan && (
                  <PaymentProcess 
                    userId={userData.id}
                    restaurantId={userData.restaurantId}
                    plan={selectedPlan}
                    trialId={trialData?.id}
                    onSuccess={handlePaymentSuccess}
                    userEmail={userData.email}
                    userName={userData.name}
                    preSelectedMethod={paymentMethod}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} ComandeJá. Todos os direitos reservados.</p>
            <p className="text-xs mt-1">
              Pagamentos processados com segurança. Seus dados de cartão são protegidos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage; 