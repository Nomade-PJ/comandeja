import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { CreditCard, Truck, Bell, Users, AlertCircle, Settings as SettingsIcon, Clock, MapPin, Search, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const { restaurant, updateRestaurantInfo } = useRestaurant();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Estados para as configurações gerais do restaurante
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Estados para endereço
  const [postalCode, setPostalCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  
  // Estado para horários de funcionamento
  const [businessHours, setBusinessHours] = useState([
    { dayOfWeek: 0, name: 'Domingo', isOpen: false, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 1, name: 'Segunda', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 2, name: 'Terça', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 3, name: 'Quarta', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 4, name: 'Quinta', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 5, name: 'Sexta', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { dayOfWeek: 6, name: 'Sábado', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  ]);
  
  // Estados para as configurações de pedidos
  const [minOrderValue, setMinOrderValue] = useState('25');
  const [deliveryFee, setDeliveryFee] = useState('5');
  const [deliveryTimeMin, setDeliveryTimeMin] = useState('30');
  const [deliveryTimeMax, setDeliveryTimeMax] = useState('45');
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [acceptScheduledOrders, setAcceptScheduledOrders] = useState(true);
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(false);
  
  // Estados para configurações de pagamento
  const [acceptCreditCard, setAcceptCreditCard] = useState(true);
  const [acceptDebitCard, setAcceptDebitCard] = useState(true);
  const [acceptPix, setAcceptPix] = useState(true);
  const [acceptCash, setAcceptCash] = useState(true);
  const [pixKey, setPixKey] = useState('');
  
  // Estados para configurações de entrega
  const [deliveryRadius, setDeliveryRadius] = useState('5');
  const [hasDeliveryFeeByDistance, setHasDeliveryFeeByDistance] = useState(false);
  const [selfPickup, setSelfPickup] = useState(true);

  // Estados para configurações de notificações
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [newOrderNotification, setNewOrderNotification] = useState(true);
  const [statusChangeNotification, setStatusChangeNotification] = useState(true);

  // Estados para configurações de equipe
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Gerente', email: 'gerente@example.com', role: 'manager' },
    { id: 2, name: 'Atendente', email: 'atendente@example.com', role: 'attendant' },
  ]);
  
  // Carregar dados do restaurante quando o componente montar
  useEffect(() => {
    if (restaurant) {
      // Preencher campos com dados do restaurante
      setName(restaurant.name || '');
      setPhone(restaurant.phone || '');
      
      // Extrair dados de endereço
      if (restaurant.address) {
        // Tentar extrair informações do endereço
        const addressParts = restaurant.address.split(',');
        if (addressParts.length >= 1) {
          // Tentar extrair rua e número
          const streetAndNumber = addressParts[0].trim().split(' ');
          if (streetAndNumber.length > 1) {
            const potentialNumber = streetAndNumber.pop();
            if (/^\d+/.test(potentialNumber || '')) {
              setNumber(potentialNumber || '');
              setStreet(streetAndNumber.join(' '));
            } else {
              setStreet(addressParts[0].trim());
            }
          } else {
            setStreet(addressParts[0].trim());
          }
        }
        
        // Tentar extrair bairro
        if (addressParts.length >= 2) {
          setNeighborhood(addressParts[1].trim());
        }
        
        // Tentar extrair cidade e estado
        if (addressParts.length >= 3) {
          const cityStateZip = addressParts[2].trim().split('-');
          if (cityStateZip.length > 0) {
            setCity(cityStateZip[0].trim());
          }
          if (cityStateZip.length > 1) {
            const stateZip = cityStateZip[1].trim().split(' ');
            if (stateZip.length > 0) {
              setState(stateZip[0].trim());
            }
            if (stateZip.length > 1) {
              setPostalCode(stateZip[1].trim());
            }
          }
        }
      }
      
      // Carregar horários de funcionamento, se existirem
      if (restaurant.opening_hours) {
        try {
          const hoursData = typeof restaurant.opening_hours === 'string' 
            ? JSON.parse(restaurant.opening_hours) 
            : restaurant.opening_hours;
          
          if (Array.isArray(hoursData) && hoursData.length === 7) {
            setBusinessHours(hoursData);
          }
        } catch (error) {
          console.error('Erro ao processar horários de funcionamento:', error);
        }
      }
      
      console.log('Dados do restaurante carregados:', restaurant);
    }
  }, [restaurant]);
  
  // Função para buscar endereço por CEP
  const handleCepSearch = async () => {
    if (!postalCode || postalCode.replace(/\D/g, '').length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Digite um CEP válido com 8 dígitos",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearchingCep(true);
    
    try {
      // Usar a função Edge do Supabase para consultar o CEP
      const response = await fetch(`/api/buscarCEP?cep=${postalCode.replace(/\D/g, '')}`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.cep) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
        
        toast({
          title: "CEP encontrado",
          description: "Endereço preenchido automaticamente",
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Tente novamente ou preencha manualmente",
        variant: "destructive"
      });
      
      // Tentar API alternativa
      try {
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${postalCode.replace(/\D/g, '')}/json/`);
        
        if (viaCepResponse.ok) {
          const viaCepData = await viaCepResponse.json();
          
          if (!viaCepData.erro) {
            setStreet(viaCepData.logradouro || '');
            setNeighborhood(viaCepData.bairro || '');
            setCity(viaCepData.localidade || '');
            setState(viaCepData.uf || '');
            
            toast({
              title: "CEP encontrado",
              description: "Endereço preenchido automaticamente",
            });
          }
        }
      } catch (viaCepError) {
        console.error('Erro na API alternativa:', viaCepError);
      }
    } finally {
      setIsSearchingCep(false);
    }
  };
  
  // Formatar CEP enquanto o usuário digita
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);
    
    // Formatação: 00000-000
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5);
    }
    
    setPostalCode(value);
    
    // Buscar CEP automaticamente quando tiver 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      handleCepSearch();
    }
  };
  
  // Função para compor o endereço completo
  const composeFullAddress = () => {
    const parts = [];
    
    if (street) parts.push(street + (number ? `, ${number}` : ''));
    if (neighborhood) parts.push(neighborhood);
    if (city) parts.push(city + (state ? ` - ${state}` : '') + (postalCode ? ` ${postalCode}` : ''));
    
    return parts.join(', ');
  };
  
  // Função para salvar configurações gerais
  const saveGeneralSettings = () => {
    if (restaurant) {
      // Compor endereço completo
      const fullAddress = composeFullAddress();
      
      updateRestaurantInfo({
        name,
        phone,
        address: fullAddress
      });
      
      toast({
        title: "Configurações salvas",
        description: "As informações do restaurante foram atualizadas com sucesso"
      });
    }
  };
  
  // Função para salvar horários de funcionamento
  const saveBusinessHours = () => {
    if (restaurant) {
      updateRestaurantInfo({
        opening_hours: JSON.stringify(businessHours)
      });
      
      toast({
        title: "Horários salvos",
        description: "Os horários de funcionamento foram atualizados com sucesso"
      });
    }
  };
  
  // Função para alterar horário de funcionamento
  const handleBusinessHourChange = (index: number, field: string, value: any) => {
    const updatedHours = [...businessHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setBusinessHours(updatedHours);
  };
  
  // Função para salvar configurações de pedidos (não implementada no contexto atual)
  const saveOrderSettings = () => {
    // Em um ambiente real, esses dados seriam salvos na API
    console.log('Configurações de pedidos salvas');
  };

  // Funções para salvar as novas configurações
  const savePaymentSettings = () => {
    console.log('Configurações de pagamento salvas');
  };

  const saveDeliverySettings = () => {
    console.log('Configurações de entrega salvas');
  };

  const saveNotificationSettings = () => {
    console.log('Configurações de notificações salvas');
  };

  return (
    <DashboardLayout title="Configurações">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configurações do Restaurante</CardTitle>
          <CardDescription>
            Personalize todas as configurações do seu restaurante
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="general" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="w-full md:w-auto flex overflow-x-auto pb-2">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="delivery">Entrega</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
          </TabsList>
        </ScrollArea>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Informações do Restaurante
              </CardTitle>
              <CardDescription>
                Atualize as informações básicas do seu restaurante.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">Nome do Restaurante</Label>
                  <Input 
                    id="restaurant-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Nome do seu estabelecimento"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="restaurant-phone">Telefone</Label>
                  <Input 
                    id="restaurant-phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-4">Endereço do Estabelecimento</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="postal-code">CEP</Label>
                    <Input 
                      id="postal-code" 
                      value={postalCode} 
                      onChange={handlePostalCodeChange}
                      placeholder="00000-000"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Digite o CEP para preencher automaticamente
                    </p>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <Label htmlFor="street">Rua/Avenida</Label>
                    <Input 
                      id="street" 
                      value={street} 
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Nome da rua ou avenida"
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input 
                      id="number" 
                      value={number} 
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Número"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input 
                      id="neighborhood" 
                      value={neighborhood} 
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>
                  
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>
                  
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input 
                      id="state" 
                      value={state} 
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Estado"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={saveGeneralSettings} className="w-full md:w-auto mt-4">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Funcionamento
              </CardTitle>
              <CardDescription>
                Defina os dias e horários em que seu estabelecimento está aberto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Marque os dias de funcionamento e defina os horários de abertura e fechamento:
                </div>
                {businessHours.map((day, index) => (
                  <div key={index} className="border rounded-md p-3 mb-2">
                    <div className="flex items-center">
                      <Checkbox
                        checked={day.isOpen}
                        onCheckedChange={(checked) => {
                          handleBusinessHourChange(index, 'isOpen', !!checked);
                        }}
                        className="mr-2"
                      />
                      <div className="font-medium">{day.name}</div>
                    </div>
                    {day.isOpen && (
                      <div className="flex items-center mt-2 space-x-2">
                        <div className="text-sm">Das:</div>
                        <Input
                          type="time"
                          value={day.openTime}
                          onChange={(e) => handleBusinessHourChange(index, 'openTime', e.target.value)}
                          className="w-24"
                        />
                        <div className="text-sm">até:</div>
                        <Input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) => handleBusinessHourChange(index, 'closeTime', e.target.value)}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Button onClick={saveBusinessHours} className="w-full md:w-auto mt-4">
                Salvar Horários
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pedidos</CardTitle>
              <CardDescription>
                Personalize como seus pedidos são recebidos e processados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium">Aceitar pedidos online</h4>
                  <p className="text-sm text-gray-500">
                    Ative para receber novos pedidos online
                  </p>
                </div>
                <Switch 
                  checked={acceptOrders}
                  onCheckedChange={setAcceptOrders}
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium">Aceitar pedidos agendados</h4>
                  <p className="text-sm text-gray-500">
                    Permitir que clientes agendem pedidos para horários futuros
                  </p>
                </div>
                <Switch 
                  checked={acceptScheduledOrders}
                  onCheckedChange={setAcceptScheduledOrders}
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium">Confirmar pedidos automaticamente</h4>
                  <p className="text-sm text-gray-500">
                    Pedidos serão confirmados automaticamente
                  </p>
                </div>
                <Switch 
                  checked={autoConfirmOrders}
                  onCheckedChange={setAutoConfirmOrders}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-order-value">Pedido Mínimo (R$)</Label>
                  <Input
                    id="min-order-value"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery-fee">Taxa de Entrega (R$)</Label>
                  <Input
                    id="delivery-fee"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery-time-min">Tempo Mínimo (minutos)</Label>
                  <Input
                    id="delivery-time-min"
                    value={deliveryTimeMin}
                    onChange={(e) => setDeliveryTimeMin(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery-time-max">Tempo Máximo (minutos)</Label>
                  <Input
                    id="delivery-time-max"
                    value={deliveryTimeMax}
                    onChange={(e) => setDeliveryTimeMax(e.target.value)}
                    type="number"
                  />
                </div>
              </div>
              
              <Button onClick={saveOrderSettings} className="w-full md:w-auto mt-4">Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pagamento</CardTitle>
              <CardDescription>
                Configure as formas de pagamento aceitas pelo seu restaurante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Conteúdo da configuração de pagamento adaptado para mobile */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Cartão de Crédito</h4>
                    </div>
                  </div>
                  <Switch 
                    checked={acceptCreditCard}
                    onCheckedChange={setAcceptCreditCard}
                  />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Cartão de Débito</h4>
                    </div>
                  </div>
                  <Switch 
                    checked={acceptDebitCard}
                    onCheckedChange={setAcceptDebitCard}
                  />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">PIX</h4>
                    </div>
                  </div>
                  <Switch 
                    checked={acceptPix}
                    onCheckedChange={setAcceptPix}
                  />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Dinheiro</h4>
                    </div>
                  </div>
                  <Switch 
                    checked={acceptCash}
                    onCheckedChange={setAcceptCash}
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="pix-key">Chave PIX</Label>
                  <Input
                    id="pix-key"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    disabled={!acceptPix}
                  />
                </div>
                
                <Button onClick={savePaymentSettings} className="w-full md:w-auto mt-4">Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Configurações de Entrega
              </CardTitle>
              <CardDescription>
                Defina áreas de entrega e taxas específicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Retirada no Local</h4>
                  <p className="text-sm text-gray-500">
                    Permitir que clientes retirem os pedidos no estabelecimento
                  </p>
                </div>
                <Switch 
                  checked={selfPickup}
                  onCheckedChange={setSelfPickup}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery-radius">Raio de Entrega (km)</Label>
                <Input 
                  id="delivery-radius" 
                  type="number"
                  value={deliveryRadius} 
                  onChange={(e) => setDeliveryRadius(e.target.value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Taxa por distância</h4>
                  <p className="text-sm text-gray-500">
                    Cobrar taxa de entrega com base na distância
                  </p>
                </div>
                <Switch 
                  checked={hasDeliveryFeeByDistance}
                  onCheckedChange={setHasDeliveryFeeByDistance}
                />
              </div>
              
              {hasDeliveryFeeByDistance && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="distance-1">Até 2km</Label>
                      <Input id="distance-1" type="number" placeholder="R$" defaultValue="5.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance-2">2km a 5km</Label>
                      <Input id="distance-2" type="number" placeholder="R$" defaultValue="8.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance-3">5km a 8km</Label>
                      <Input id="distance-3" type="number" placeholder="R$" defaultValue="12.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance-4">Acima de 8km</Label>
                      <Input id="distance-4" type="number" placeholder="R$" defaultValue="15.00" />
                    </div>
                  </div>
                </div>
              )}
              
              <Button onClick={saveDeliverySettings} className="mt-4">Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Configure como deseja receber notificações de novos pedidos e outras atividades.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações por Email</h4>
                  <p className="text-sm text-gray-500">
                    Receber notificações por email
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações Push</h4>
                  <p className="text-sm text-gray-500">
                    Receber notificações push no navegador
                  </p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Alertas Sonoros</h4>
                  <p className="text-sm text-gray-500">
                    Tocar som ao receber novo pedido
                  </p>
                </div>
                <Switch 
                  checked={soundAlerts}
                  onCheckedChange={setSoundAlerts}
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-medium mb-4">Tipos de notificações</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-sm">Novos Pedidos</h5>
                      <p className="text-xs text-gray-500">
                        Notificar quando novos pedidos forem recebidos
                      </p>
                    </div>
                    <Switch 
                      checked={newOrderNotification}
                      onCheckedChange={setNewOrderNotification}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-sm">Mudanças de Status</h5>
                      <p className="text-xs text-gray-500">
                        Notificar quando o status de um pedido for alterado
                      </p>
                    </div>
                    <Switch 
                      checked={statusChangeNotification}
                      onCheckedChange={setStatusChangeNotification}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={saveNotificationSettings} className="mt-4">Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Equipe
              </CardTitle>
              <CardDescription>
                Adicione e gerencie funcionários que terão acesso ao sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md divide-y">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue={member.role}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Dono</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="attendant">Atendente</SelectItem>
                          <SelectItem value="kitchen">Cozinha</SelectItem>
                          <SelectItem value="delivery">Entrega</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="destructive" size="sm">Remover</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-medium mb-4">Adicionar novo membro</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-member-name">Nome</Label>
                    <Input id="new-member-name" placeholder="Nome do funcionário" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-member-email">Email</Label>
                    <Input id="new-member-email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-member-role">Função</Label>
                    <Select>
                      <SelectTrigger id="new-member-role">
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="attendant">Atendente</SelectItem>
                        <SelectItem value="kitchen">Cozinha</SelectItem>
                        <SelectItem value="delivery">Entrega</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button className="mt-4">Adicionar Membro</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SettingsPage;
