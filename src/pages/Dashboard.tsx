import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useRestaurant, Order } from '@/contexts/RestaurantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrderCard from '@/components/OrderCard';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, Clock, X, TrendingUp, Volume2, VolumeX } from 'lucide-react';

// Interface para as estatísticas do dashboard
interface DashboardStats {
  id: string;
  restaurant_id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  active_orders: number;
  todays_orders: number;
  status_counts: Record<string, number>;
  updated_at: string;
}

const Dashboard = () => {
  const { orders, restaurant, updateOrderStatus, fetchOrders } = useRestaurant();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Filtra pedidos recentes (últimas 24 horas)
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return orderDate >= yesterday;
  });

  // Obtém pedidos ativos
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );
  
  // Filtra pedidos de hoje
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    return orderDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  });
  
  // Calcula pedidos por status
  const ordersByStatus = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  // Calcula receita total
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  // Carregar estatísticas iniciais do dashboard
  useEffect(() => {
    if (!user?.restaurantId) return;
    
    const fetchDashboardStats = async () => {
      setIsLoadingStats(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('dashboard_statistics')
          .select('*')
          .eq('restaurant_id', user.restaurantId)
          .eq('date', today)
          .single();
        
        if (error) {
          console.error('Erro ao carregar estatísticas:', error);
          // Se não existirem estatísticas, vamos usar os dados calculados localmente
          setDashboardStats(null);
        } else if (data) {
          setDashboardStats(data as DashboardStats);
        }
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchDashboardStats();
  }, [user?.restaurantId]);
  
  // Configurar escuta em tempo real do Supabase
  useEffect(() => {
    if (!user?.restaurantId || !isRealTimeEnabled) return;

    // Configurar canais para diferentes eventos
    const ordersChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${user.restaurantId}`,
        },
        (payload) => {
          console.log('Atualização em tempo real recebida (orders):', payload);
          // Recarregar pedidos ao receber uma atualização
          fetchOrders();
          
          // Notificar o usuário sobre novos pedidos
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Novo pedido recebido!",
              description: `Pedido #${payload.new.id.slice(-6)} foi recebido.`,
              variant: "default",
            });
            
            // Tocar um som de notificação
            if (soundEnabled) {
              const audio = new Audio('/sounds/notification.mp3');
              audio.play().catch(e => console.log('Erro ao tocar som:', e));
            }
          }
        }
      )
      .subscribe();
      
    // Configurar canal para estatísticas do dashboard
    const statsChannel = supabase
      .channel('public:dashboard_statistics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboard_statistics',
          filter: `restaurant_id=eq.${user.restaurantId}`,
        },
        (payload) => {
          console.log('Atualização em tempo real recebida (stats):', payload);
          if (payload.new) {
            setDashboardStats(payload.new as DashboardStats);
          }
        }
      )
      .subscribe();

    // Limpar a inscrição quando o componente for desmontado
    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(statsChannel);
    };
  }, [user?.restaurantId, isRealTimeEnabled, fetchOrders, soundEnabled, toast]);
  
  // Função para mostrar diálogo de horários
  const handleShowHoursDialog = () => {
    try {
      // Obter os horários de funcionamento
      const hoursData = restaurant?.opening_hours ? 
        (typeof restaurant.opening_hours === 'string' ? 
          JSON.parse(restaurant.opening_hours) : restaurant.opening_hours) : [];
      
      // Definir os horários para o estado
      setBusinessHours(Array.isArray(hoursData) ? hoursData : []);
      
      // Mostrar o diálogo
      setShowHoursDialog(true);
    } catch (e) {
      console.error('Erro ao processar horários:', e);
    }
  };
  
  // Função para renderizar os horários de funcionamento de forma mais legível
  const renderBusinessHours = (businessHours: any) => {
    if (!businessHours || typeof businessHours !== 'object') {
      // Retornar um horário padrão em vez da mensagem "Horário não disponível"
      return '09:00 - 18:00';
    }

    try {
      // Se for uma string JSON, tenta parsear
      const hoursData = typeof businessHours === 'string' 
        ? JSON.parse(businessHours) 
        : businessHours;
      
      // Verifica se é um array (formato esperado)
      if (Array.isArray(hoursData)) {
        // Filtra apenas os dias abertos para exibição resumida
        const openDays = hoursData.filter(day => day.isOpen);
        
        if (openDays.length === 0) {
          // Retornar um horário padrão em vez de "Fechado todos os dias"
          return '09:00 - 18:00';
        }
        
        // Exibe apenas o primeiro dia aberto com um "+X dias" se houver mais
        if (openDays.length > 0) {
          const firstDay = openDays[0];
          return (
            <div>
              <div>{firstDay.name}: {firstDay.openTime} - {firstDay.closeTime}</div>
              {openDays.length > 1 && (
                <div 
                  className="text-xs text-blue-500 cursor-pointer hover:underline"
                  onClick={handleShowHoursDialog}
                >
                  +{openDays.length - 1} dias (clique para ver todos)
                </div>
              )}
            </div>
          );
        }
      }
      
      // Fallback: retornar um horário padrão em vez de "Horários configurados"
      return '09:00 - 18:00';
      
    } catch (e) {
      console.error('Erro ao renderizar horários:', e);
      // Fallback em caso de erro: horário padrão
      return '09:00 - 18:00';
    }
  };

  // Trata mudança de status
  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  // Alternar atualizações em tempo real
  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
    toast({
      title: isRealTimeEnabled ? "Atualizações em tempo real desativadas" : "Atualizações em tempo real ativadas",
      description: isRealTimeEnabled 
        ? "Você não receberá mais notificações em tempo real." 
        : "Você receberá notificações quando houver novos pedidos.",
    });
  };
  
  // Alternar som de notificações
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast({
      title: soundEnabled ? "Som desativado" : "Som ativado",
      description: soundEnabled 
        ? "Você não ouvirá mais notificações sonoras." 
        : "Você ouvirá notificações sonoras quando houver novos pedidos.",
    });
  };

  // Determinar os valores a serem exibidos (priorizar dados do servidor quando disponíveis)
  const displayData = {
    activeOrders: dashboardStats?.active_orders ?? activeOrders.length,
    todayOrders: dashboardStats?.todays_orders ?? todayOrders.length,
    totalRevenue: dashboardStats?.total_revenue ?? totalRevenue,
    totalOrders: dashboardStats?.total_orders ?? orders.length
  };

  return (
    <DashboardLayout title="">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Painel de Controle</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSound}
            className="flex items-center gap-2"
            title={soundEnabled ? "Desativar som" : "Ativar som"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={isRealTimeEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleRealTime}
            className="flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            {isRealTimeEnabled ? "Tempo Real Ativo" : "Tempo Real Inativo"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pedidos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingStats ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                displayData.activeOrders
              )}
            </div>
            {dashboardStats && (
              <div className="text-xs text-gray-500 mt-1">
                Atualizado {new Date(dashboardStats.updated_at).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pedidos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingStats ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                displayData.todayOrders
              )}
            </div>
            {dashboardStats && (
              <div className="text-xs text-gray-500 mt-1">
                Atualizado {new Date(dashboardStats.updated_at).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingStats ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              ) : (
                `R$ ${displayData.totalRevenue.toFixed(2)}`
              )}
            </div>
            {dashboardStats && (
              <div className="text-xs text-gray-500 mt-1">
                Total de {displayData.totalOrders} pedidos
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Pedidos Recentes</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                Ver Todos
              </Button>
            </div>
            
            {activeOrders.length > 0 ? (
              <div className="space-y-4">
                {activeOrders.slice(0, 3).map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusChange={handleStatusChange}
                  />
                ))}
                
                {activeOrders.length > 3 && (
                  <Button variant="ghost" className="w-full" onClick={() => navigate('/orders')}>
                    Ver mais {activeOrders.length - 3} pedidos
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum pedido ativo no momento.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-6">Gerenciamento do Restaurante</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="p-8 h-auto flex flex-col items-center justify-center"
                onClick={() => navigate('/products')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
                <span className="font-medium">Gerenciar Produtos</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="p-8 h-auto flex flex-col items-center justify-center"
                onClick={() => navigate('/settings')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span className="font-medium">Configurações do Restaurante</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-bold mb-4">Informações do Restaurante</h2>
            
            {restaurant && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2">
                    {restaurant.logo_url && (
                      <img 
                        src={restaurant.logo_url} 
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-xl">{restaurant.name}</h3>
                  <p className="text-gray-500">{restaurant.description}</p>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">URL do Restaurante</div>
                  <div className="text-gray-500 flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/r/${restaurant.slug || restaurant.id}`}
                      className="bg-gray-100 px-3 py-2 rounded text-xs font-mono w-full truncate"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 h-8 w-8 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/r/${restaurant.slug || restaurant.id}`)
                          .then(() => {
                            toast({
                              title: "URL copiada",
                              description: "A URL do restaurante foi copiada para a área de transferência."
                            });
                          })
                          .catch(() => {
                            toast({
                              title: "Erro ao copiar",
                              description: "Não foi possível copiar a URL. Tente copiar manualmente.",
                              variant: "destructive"
                            });
                          });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Contato</div>
                  <div className="text-gray-500">{restaurant.phone || 'Não informado'}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Endereço</div>
                  <div className="text-gray-500">{restaurant.address || 'Não informado'}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Horário de Funcionamento</div>
                  <div className="text-gray-500">
                    {restaurant.opening_hours ? 
                      renderBusinessHours(restaurant.opening_hours) : 
                      '09:00 - 18:00'
                    }
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/settings')}
                >
                  Editar Informações do Restaurante
                </Button>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-4">Precisa de Ajuda?</h2>
            <p className="text-gray-500 mb-4">
              Nossa equipe de suporte está pronta para ajudar com quaisquer dúvidas ou problemas.
            </p>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => window.open('https://suporte.comandeja.com', '_blank')}
            >
              Contatar Suporte
            </Button>
          </div>
        </div>
      </div>
      
      {/* Diálogo de horários de funcionamento */}
      <Dialog open={showHoursDialog} onOpenChange={setShowHoursDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Horários de Funcionamento
            </DialogTitle>
            <DialogDescription>
              Dias e horários em que o estabelecimento está aberto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {businessHours.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-2">
                  {day.isOpen ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{day.name}</span>
                </div>
                {day.isOpen ? (
                  <div className="text-sm">
                    {day.openTime} - {day.closeTime}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Fechado</div>
                )}
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => setShowHoursDialog(false)}
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
