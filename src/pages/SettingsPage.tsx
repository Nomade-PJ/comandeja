
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
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>
                Configure as opções de pagamento disponíveis para seus clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Configurações de pagamento serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Entrega</CardTitle>
              <CardDescription>
                Defina áreas de entrega e taxas específicas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Configurações de entrega serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure como deseja receber notificações de novos pedidos e outras atividades.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Configurações de notificações serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Equipe</CardTitle>
              <CardDescription>
                Adicione e gerencie funcionários que terão acesso ao sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Gerenciamento de equipe será implementado em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SettingsPage;
