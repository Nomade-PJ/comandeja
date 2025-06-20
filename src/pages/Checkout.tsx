import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, ArrowRight, CreditCard, MapPin, Clock, Loader2, Search, Receipt, ShoppingBag } from 'lucide-react';
import { CheckoutStepper, CheckoutStep } from '@/components/ui/checkout-stepper';
import { OrderReceipt, OrderItem } from '@/components/ui/order-receipt';
import { useCustomer } from '@/hooks/useCustomer';
import { Database } from '@/integrations/supabase/types';
import { updateDashboardStatistics, fixDashboardStatsForOrder } from '@/services/dashboardService';

// Definir tipos para os dados
interface CustomerWithDetails {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  [key: string]: any;
}

// Definir tipos usando tipos do Supabase
type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'voucher';
type DeliveryMethod = 'delivery' | 'pickup';
type OrderStatus = Database['public']['Enums']['order_status'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

// Interface para os dados retornados pela API do ViaCEP
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { getOrCreateCustomer } = useCustomer();
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [notes, setNotes] = useState('');
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);

  // Define as etapas do checkout
  const steps: CheckoutStep[] = [
    { id: 1, name: 'Carrinho', status: currentStep === 1 ? 'current' : currentStep > 1 ? 'complete' : 'upcoming' },
    { id: 2, name: 'Entrega', status: currentStep === 2 ? 'current' : currentStep > 2 ? 'complete' : 'upcoming' },
    { id: 3, name: 'Pagamento', status: currentStep === 3 ? 'current' : currentStep > 3 ? 'complete' : 'upcoming' },
    { id: 4, name: 'Confirmação', status: currentStep === 4 ? 'current' : currentStep > 4 ? 'complete' : 'upcoming' },
  ];

  // Agrupar itens por restaurante
  const itemsByRestaurant: Record<string, any[]> = items.reduce((acc, item) => {
    if (!acc[item.restaurant_id]) {
      acc[item.restaurant_id] = [];
    }
    acc[item.restaurant_id].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Função para buscar dados do restaurante
  const fetchRestaurantData = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar dados do restaurante:', error);
        return;
      }
      
      if (data) {
        setRestaurantData(data);
        
        // Preenche os dados iniciais do usuário com base no perfil atual
        if (user) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', user.id)
              .single();
              
            if (profileData) {
              setCustomerData({
                name: profileData.full_name || '',
                email: user.email || '',
                phone: profileData.phone || ''
              });
            }
          } catch (err) {
            console.error('Erro ao carregar perfil:', err);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do restaurante:', error);
    }
  };

  // Verificar se o carrinho está vazio ou se o usuário está logado
  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
      return;
    }

    if (!user) {
      navigate('/');
      return;
    }

    // Carregar dados do restaurante a partir do primeiro item do carrinho
    if (items.length > 0) {
      const restaurantId = items[0].restaurant_id;
      fetchRestaurantData(restaurantId);
    }
  }, [items, user, navigate]);

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    // Remover caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return;
    }
    
    setIsCepLoading(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado e tente novamente",
          variant: "destructive",
        });
        return;
      }
      
      setAddress(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        complement: data.complemento || prev.complement,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        zipCode: cleanCep
      }));
      
      toast({
        title: "CEP encontrado",
        description: "Endereço preenchido automaticamente",
      });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível consultar o CEP. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsCepLoading(false);
    }
  };

  // Handler para mudança no campo de CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Atualizar o valor do CEP no estado
    setAddress(prev => ({
      ...prev,
      zipCode: value
    }));
    
    // Se o CEP tiver 8 dígitos, buscar automaticamente
    if (value.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(value);
    }
  };

  // Função para continuar para a próxima etapa
  const handleNextStep = () => {
    // Validar campos antes de prosseguir
    if (currentStep === 1) {
      // Validar carrinho
      if (items.length === 0) {
        toast({
          title: "Carrinho vazio",
          description: "Adicione produtos ao carrinho para finalizar o pedido",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
    } 
    else if (currentStep === 2) {
      // Validar endereço se for entrega
      if (deliveryMethod === 'delivery') {
        if (!address.street || !address.number || !address.neighborhood || !address.city || !address.state) {
          toast({
            title: "Endereço incompleto",
            description: "Preencha todos os campos obrigatórios do endereço",
            variant: "destructive",
          });
          return;
        }
      }
      setCurrentStep(3);
    }
    else if (currentStep === 3) {
      // Validar método de pagamento
      if (!paymentMethod) {
        toast({
          title: "Selecione um método de pagamento",
          description: "É necessário escolher uma forma de pagamento",
          variant: "destructive",
        });
        return;
      }
      // Avançar para revisão do pedido
      setCurrentStep(4);
    }
  };

  // Função para voltar à etapa anterior
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para finalizar o pedido",
        variant: "destructive",
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho para finalizar o pedido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Obter o restaurante do primeiro item (assumimos que todos os itens são do mesmo restaurante)
      const restaurantId = items[0].restaurant_id;
      
      console.log('Iniciando checkout para o restaurante:', restaurantId);
      
      // Usar o hook para buscar ou criar o cliente automaticamente
      const customer = await getOrCreateCustomer(restaurantId);
      
      if (!customer) {
        console.error('Falha ao obter ou criar cliente');
        toast({
          title: "Erro no perfil",
          description: "Não foi possível identificar ou criar um cliente para este pedido",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Cliente para o pedido:', customer);
      
      // Calcular valores
      const subtotal = getTotal();
      const deliveryFee = deliveryMethod === 'delivery' && restaurantData ? (restaurantData.delivery_fee || 0) : 0;
      const total = subtotal + deliveryFee;
      
      // Gerar número do pedido
      const timestamp = new Date().getTime().toString().slice(-6);
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const generatedOrderNumber = timestamp + randomNum;
      
      console.log('Criando pedido com número:', generatedOrderNumber);
      
      // Dados do pedido com tipagem correta para a tabela orders
      const orderData: Database['public']['Tables']['orders']['Insert'] = {
        customer_id: customer.id,
        restaurant_id: restaurantId,
        order_number: generatedOrderNumber,
        status: 'pending',
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'delivery' ? `${address.street}, ${address.number}` : null,
        delivery_city: deliveryMethod === 'delivery' ? address.city : null,
        delivery_state: deliveryMethod === 'delivery' ? address.state : null,
        delivery_zip_code: deliveryMethod === 'delivery' ? address.zipCode : null,
        customer_name: customerData.name,
        customer_phone: customerData.phone || '',
        customer_email: customerData.email || '',
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Dados do pedido:', orderData);
      
      // Criar o pedido com tratamento de erros adicional
      let order;
      try {
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();
        
        if (orderError) {
          console.error('Erro ao criar pedido:', orderError);
          throw new Error(orderError.message || 'Erro ao criar pedido');
        }
        
        order = newOrder;
        console.log('Pedido criado com ID:', order.id);
      } catch (orderError: any) {
        // Verificar se o erro está relacionado ao dashboard_statistics
        if (orderError.message && orderError.message.includes('dashboard_statistics')) {
          console.warn('Aviso: Erro na atualização das estatísticas, mas o pedido pode ter sido criado com sucesso.');
          
          // Tentar recuperar o pedido recém-criado pelo número
          const { data: retrievedOrder } = await supabase
            .from('orders')
            .select()
            .eq('order_number', generatedOrderNumber)
            .single();
            
          if (retrievedOrder) {
            order = retrievedOrder;
            console.log('Pedido recuperado pelo número:', order.id);
            
            // Tentar atualizar manualmente as estatísticas para resolver o problema
            try {
              console.log('Tentando atualizar manualmente as estatísticas para o pedido:', order.id);
              const result = await fixDashboardStatsForOrder(order.id);
              console.log('Resultado da atualização manual das estatísticas:', result);
              
              // Se a função específica falhar, tentar o método alternativo
              if (!result.success) {
                console.log('Tentando método alternativo de atualização com restaurante:', restaurantId);
                const altResult = await updateDashboardStatistics(restaurantId);
                console.log('Resultado do método alternativo:', altResult);
              }
            } catch (statsError) {
              console.error('Erro ao tentar atualizar manualmente as estatísticas:', statsError);
              // Continuar mesmo se falhar a atualização manual
            }
          } else {
            // Se não conseguir recuperar o pedido, propague o erro original
            throw orderError;
          }
        } else {
          // Se não for relacionado a dashboard_statistics, propague o erro
          throw orderError;
        }
      }
      
      if (!order) {
        throw new Error('Falha ao criar ou recuperar o pedido');
      }
      
      // Criar itens do pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        notes: ''
      }));
      
      console.log('Itens do pedido:', orderItems);
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Erro ao criar itens do pedido:', itemsError);
        throw new Error(itemsError.message || 'Erro ao criar itens do pedido');
      }
      
      // Limpar o carrinho e redirecionar para página de confirmação
      clearCart();
      navigate(`/pedido-confirmado?orderNumber=${generatedOrderNumber}`);
    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error);
      toast({
        title: "Erro ao finalizar pedido",
        description: error.message || "Não foi possível criar o pedido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
        </div>

        {/* Stepper */}
        <CheckoutStepper steps={steps} currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de checkout */}
          <div className="lg:col-span-2">
            {/* Etapa 1: Revisão do Carrinho */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Seu pedido
                  </CardTitle>
                  <CardDescription>
                    Revise os itens do seu pedido antes de prosseguir
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <div className="font-medium">{item.quantity}x {item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.name}
                          </div>
                        </div>
                        <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button onClick={handleNextStep}>
                      Prosseguir com a entrega
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Etapa 2: Método de entrega */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Método de entrega
                  </CardTitle>
                  <CardDescription>
                    Selecione como deseja receber seu pedido
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={deliveryMethod} 
                    onValueChange={(value: DeliveryMethod) => setDeliveryMethod(value)}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="font-medium">Entrega</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="font-medium">Retirada no local</Label>
                    </div>
                  </RadioGroup>

                  {deliveryMethod === 'delivery' && (
                    <div className="space-y-4 mt-4 pt-4 border-t">
                      <h4 className="font-medium">Endereço de entrega</h4>
                      
                      {/* Campo de CEP com botão de busca */}
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">CEP</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="zipCode" 
                            value={address.zipCode}
                            onChange={handleCepChange}
                            placeholder="00000-000"
                            required={deliveryMethod === 'delivery'}
                            className="flex-1"
                            maxLength={9}
                          />
                          <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => fetchAddressByCep(address.zipCode)}
                            disabled={isCepLoading || address.zipCode.replace(/\D/g, '').length !== 8}
                          >
                            {isCepLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Search className="h-4 w-4 mr-1" />
                            )}
                            Buscar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Digite o CEP para preencher o endereço automaticamente
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="street">Rua</Label>
                          <Input 
                            id="street" 
                            value={address.street}
                            onChange={(e) => setAddress({...address, street: e.target.value})}
                            required={deliveryMethod === 'delivery'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="number">Número</Label>
                          <Input 
                            id="number" 
                            value={address.number}
                            onChange={(e) => setAddress({...address, number: e.target.value})}
                            required={deliveryMethod === 'delivery'}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input 
                          id="complement" 
                          value={address.complement}
                          onChange={(e) => setAddress({...address, complement: e.target.value})}
                          placeholder="Apartamento, bloco, referência (opcional)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input 
                            id="neighborhood" 
                            value={address.neighborhood}
                            onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                            required={deliveryMethod === 'delivery'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input 
                            id="city" 
                            value={address.city}
                            onChange={(e) => setAddress({...address, city: e.target.value})}
                            required={deliveryMethod === 'delivery'}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Select 
                          value={address.state} 
                          onValueChange={(value) => setAddress({...address, state: value})}
                        >
                          <SelectTrigger id="state">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC">Acre</SelectItem>
                            <SelectItem value="AL">Alagoas</SelectItem>
                            <SelectItem value="AP">Amapá</SelectItem>
                            <SelectItem value="AM">Amazonas</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            <SelectItem value="CE">Ceará</SelectItem>
                            <SelectItem value="DF">Distrito Federal</SelectItem>
                            <SelectItem value="ES">Espírito Santo</SelectItem>
                            <SelectItem value="GO">Goiás</SelectItem>
                            <SelectItem value="MA">Maranhão</SelectItem>
                            <SelectItem value="MT">Mato Grosso</SelectItem>
                            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para o carrinho
                    </Button>
                    <Button onClick={handleNextStep}>
                      Escolher forma de pagamento
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Etapa 3: Método de pagamento */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Método de pagamento
                  </CardTitle>
                  <CardDescription>
                    Selecione como deseja pagar seu pedido
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="font-medium">PIX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="font-medium">Cartão de crédito</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="debit_card" id="debit_card" />
                      <Label htmlFor="debit_card" className="font-medium">Cartão de débito</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="font-medium">Dinheiro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="voucher" id="voucher" />
                      <Label htmlFor="voucher" className="font-medium">Vale-refeição</Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Observações */}
                  <div className="space-y-2 mt-6 pt-6 border-t">
                    <Label htmlFor="notes">Alguma observação para o restaurante?</Label>
                    <Textarea 
                      id="notes" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Sem cebola, troco para R$ 50,00, etc."
                    />
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para a entrega
                    </Button>
                    <Button onClick={handleNextStep}>
                      Revisar e finalizar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Etapa 4: Confirmação */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Revisar e finalizar
                  </CardTitle>
                  <CardDescription>
                    Confira os detalhes do seu pedido antes de finalizar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resumo das etapas anteriores */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Método de entrega:</h3>
                      <p>{deliveryMethod === 'delivery' ? 'Entrega' : 'Retirada no local'}</p>
                      {deliveryMethod === 'delivery' && address.street && (
                        <p className="text-sm text-gray-500 mt-1">
                          {address.street}, {address.number}, {address.neighborhood}, {address.city}/{address.state}
                        </p>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Método de pagamento:</h3>
                      <p>
                        {paymentMethod === 'credit_card' ? 'Cartão de crédito' : 
                         paymentMethod === 'debit_card' ? 'Cartão de débito' : 
                         paymentMethod === 'pix' ? 'PIX' : 
                         paymentMethod === 'cash' ? 'Dinheiro' : 'Vale-refeição'}
                      </p>
                    </div>
                    
                    {notes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-medium mb-2">Observações:</h3>
                          <p className="text-sm text-gray-500">{notes}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para o pagamento
                    </Button>
                    <Button 
                      onClick={handleSubmitOrder}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          Finalizar pedido
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Nota fiscal após confirmação */}
            {orderComplete && (
              <div className="mt-6">
                <OrderReceipt
                  orderNumber={orderNumber}
                  items={items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                  }) as OrderItem)}
                  customerName={customerData.name}
                  deliveryAddress={deliveryMethod === 'delivery' ? `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}/${address.state}` : undefined}
                  deliveryMethod={deliveryMethod}
                  paymentMethod={paymentMethod}
                  subtotal={getTotal()}
                  deliveryFee={deliveryMethod === 'delivery' && restaurantData ? (restaurantData.delivery_fee || 0) : 0}
                  total={getTotal() + (deliveryMethod === 'delivery' && restaurantData ? (restaurantData.delivery_fee || 0) : 0)}
                  restaurantName={restaurantData?.name || 'Restaurante'}
                  orderDate={new Date()}
                />
              </div>
            )}
          </div>

          {/* Resumo do pedido (sempre visível) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Itens do carrinho */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </div>
                        <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Totais */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(getTotal())}</span>
                    </div>
                    
                    {deliveryMethod === 'delivery' && (
                      <div className="flex justify-between">
                        <span>Taxa de entrega</span>
                        <span>
                          {restaurantData ? formatCurrency(restaurantData.delivery_fee || 0) : 'Calculando...'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold text-lg pt-2">
                      <span>Total</span>
                      <span>
                        {formatCurrency(getTotal() + (
                          deliveryMethod === 'delivery' && restaurantData 
                            ? (restaurantData.delivery_fee || 0) 
                            : 0
                        ))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 