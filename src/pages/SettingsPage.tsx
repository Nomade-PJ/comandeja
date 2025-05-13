
import React, { useState } from 'react';
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
import { CreditCard, Truck, Bell, Users, AlertCircle } from 'lucide-react';

const SettingsPage = () => {
  const { restaurant, updateRestaurantInfo } = useRestaurant();
  
  // Estados para as configurações gerais do restaurante
  const [name, setName] = useState(restaurant?.name || '');
  const [description, setDescription] = useState(restaurant?.description || '');
  const [phone, setPhone] = useState(restaurant?.phone || '');
  const [address, setAddress] = useState(restaurant?.address || '');
  const [openingHours, setOpeningHours] = useState(restaurant?.openingHours || '');
  
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
  
  // Função para salvar configurações gerais
  const saveGeneralSettings = () => {
    if (restaurant) {
      updateRestaurantInfo({
        name,
        description,
        phone,
        address,
        openingHours
      });
    }
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
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
          <TabsTrigger value="delivery">Entrega</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Restaurante</CardTitle>
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="restaurant-phone">Telefone</Label>
                  <Input 
                    id="restaurant-phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restaurant-address">Endereço</Label>
                <Input 
                  id="restaurant-address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restaurant-description">Descrição</Label>
                <Textarea 
                  id="restaurant-description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="opening-hours">Horário de Funcionamento</Label>
                <Input 
                  id="opening-hours" 
                  value={openingHours} 
                  onChange={(e) => setOpeningHours(e.target.value)} 
                />
              </div>
              
              <Button onClick={saveGeneralSettings} className="mt-4">Salvar Alterações</Button>
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
              <div className="flex items-center justify-between">
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
              
              <div className="flex items-center justify-between">
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
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Confirmação automática de pedidos</h4>
                  <p className="text-sm text-gray-500">
                    Confirmação automática ao receber novos pedidos
                  </p>
                </div>
                <Switch 
                  checked={autoConfirmOrders}
                  onCheckedChange={setAutoConfirmOrders}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="min-order-value">Valor Mínimo do Pedido (R$)</Label>
                  <Input 
                    id="min-order-value" 
                    type="number"
                    value={minOrderValue} 
                    onChange={(e) => setMinOrderValue(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery-fee">Taxa de Entrega (R$)</Label>
                  <Input 
                    id="delivery-fee" 
                    type="number"
                    value={deliveryFee} 
                    onChange={(e) => setDeliveryFee(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery-time-min">Tempo Mínimo de Entrega (minutos)</Label>
                  <Input 
                    id="delivery-time-min" 
                    type="number"
                    value={deliveryTimeMin} 
                    onChange={(e) => setDeliveryTimeMin(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery-time-max">Tempo Máximo de Entrega (minutos)</Label>
                  <Input 
                    id="delivery-time-max" 
                    type="number"
                    value={deliveryTimeMax} 
                    onChange={(e) => setDeliveryTimeMax(e.target.value)} 
                  />
                </div>
              </div>
              
              <Button onClick={saveOrderSettings} className="mt-4">Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Métodos de Pagamento
              </CardTitle>
              <CardDescription>
                Configure as opções de pagamento disponíveis para seus clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cartão de Crédito</h4>
                  <p className="text-sm text-gray-500">
                    Aceitar pagamentos com cartão de crédito
                  </p>
                </div>
                <Switch 
                  checked={acceptCreditCard}
                  onCheckedChange={setAcceptCreditCard}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cartão de Débito</h4>
                  <p className="text-sm text-gray-500">
                    Aceitar pagamentos com cartão de débito
                  </p>
                </div>
                <Switch 
                  checked={acceptDebitCard}
                  onCheckedChange={setAcceptDebitCard}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">PIX</h4>
                  <p className="text-sm text-gray-500">
                    Aceitar pagamentos via PIX
                  </p>
                </div>
                <Switch 
                  checked={acceptPix}
                  onCheckedChange={setAcceptPix}
                />
              </div>
              
              {acceptPix && (
                <div className="space-y-2 pl-6 border-l-2 border-gray-100">
                  <Label htmlFor="pix-key">Chave PIX</Label>
                  <Input 
                    id="pix-key" 
                    value={pixKey} 
                    onChange={(e) => setPixKey(e.target.value)} 
                    placeholder="CPF, CNPJ, Email ou Chave Aleatória"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dinheiro</h4>
                  <p className="text-sm text-gray-500">
                    Aceitar pagamentos em dinheiro na entrega
                  </p>
                </div>
                <Switch 
                  checked={acceptCash}
                  onCheckedChange={setAcceptCash}
                />
              </div>
              
              <Button onClick={savePaymentSettings} className="mt-4">Salvar Configurações</Button>
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
