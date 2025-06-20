import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home, Download, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { updateDashboardStatistics, fixDashboardStatsForOrder } from '@/services/dashboardService';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const [restaurantName, setRestaurantName] = useState("Restaurante");
  
  // Obter o número do pedido da URL
  const orderNumber = searchParams.get('orderNumber') || "";

  useEffect(() => {
    // Buscar dados do restaurante
    const fetchOrderInfo = async () => {
      if (!orderNumber) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            restaurant_id,
            restaurants:restaurant_id (
              name
            )
          `)
          .eq('order_number', orderNumber)
          .single();
          
        if (!error && data) {
          if (data.restaurants?.name) {
            setRestaurantName(data.restaurants.name);
          }
          
          // Tentar atualizar as estatísticas manualmente para garantir
          if (data.id) {
            console.log('Atualizando estatísticas para o pedido:', data.id);
            try {
              // Primeiro tenta atualizar usando a função específica para o pedido
              const result = await fixDashboardStatsForOrder(data.id);
              console.log('Resultado da atualização das estatísticas via RPC:', result);
              
              // Se a função específica falhar, tentar o método genérico pelo restaurante
              if (!result.success && data.restaurant_id) {
                console.log('Tentando método alternativo pelo restaurante:', data.restaurant_id);
                const altResult = await updateDashboardStatistics(data.restaurant_id);
                console.log('Resultado da atualização alternativa:', altResult);
              }
            } catch (statsError) {
              console.error('Erro ao atualizar estatísticas do dashboard:', statsError);
            }
          } else if (data.restaurant_id) {
            // Fallback para o método mais antigo se não tivermos o ID do pedido
            console.log('Tentando atualizar estatísticas pelo restaurante:', data.restaurant_id);
            try {
              const result = await updateDashboardStatistics(data.restaurant_id);
              console.log('Resultado da atualização das estatísticas:', result);
            } catch (statsError) {
              console.error('Erro ao atualizar estatísticas do dashboard:', statsError);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar informações do pedido:', err);
      }
    };
    
    fetchOrderInfo();
    
    // Redirecionar para a página inicial após 10 segundos
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, orderNumber]);

  // Função simulada para imprimir a nota fiscal
  const handlePrint = () => {
    window.print();
  };

  // Função simulada para baixar a nota fiscal
  const handleDownload = () => {
    alert("Nota fiscal será enviada para seu e-mail em instantes!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <CardTitle className="text-2xl">Pedido realizado com sucesso!</CardTitle>
          <CardDescription>
            Seu pedido #{orderNumber} foi enviado ao restaurante.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-green-800 font-medium">
              Em breve você receberá uma confirmação do pedido pelo e-mail cadastrado.
            </p>
            <p className="text-sm text-green-600 mt-2">
              O restaurante entrará em contato caso necessite de alguma informação adicional.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir nota
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Baixar nota
              </Button>
            </div>
            
            <Link to="/">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Voltar para a página inicial
              </Button>
            </Link>
            
            <p className="text-center text-sm text-gray-500">
              Redirecionando em {countdown} segundos...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmation; 