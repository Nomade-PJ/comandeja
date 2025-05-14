import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Shield, User, Menu as MenuIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const PlansPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<null | string>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar se o usuário está logado
  useEffect(() => {
    const userSession = sessionStorage.getItem('user');
    setIsLoggedIn(!!userSession);
  }, []);

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
      features: [
        'Cardápio digital',
        'Gestão de pedidos',
        'Dashboard administrativo',
        'QR Code para mesas',
        'Suporte por e-mail',
      ],
      popular: false,
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
      features: [
        'Todos os recursos do plano Mensal',
        'Integrações com apps de delivery',
        'Relatórios avançados',
        'Suporte prioritário',
        'Personalização básica',
      ],
      popular: true,
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
      features: [
        'Todos os recursos do plano Semestral',
        'Domínio personalizado',
        'Personalização completa',
        'Suporte telefônico dedicado',
        'Treinamento para equipe',
      ],
      popular: false,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    
    toast({
      title: `Plano ${plan?.name} selecionado!`,
      description: "Você será direcionado para a página de pagamento."
    });
    
    // Redirecionamento com delay para o usuário ver o toast
    setTimeout(() => {
      // Sempre direcionamos para o checkout, independente do login
      navigate('/checkout', { state: { selectedPlan: planId } });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 flex justify-between items-center">
          <div className="flex items-center -my-12">
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="ComandeJá" className="h-40 w-auto" />
            </Link>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoggedIn ? (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="w-full flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register" className="w-full flex items-center cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Criar Conta</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/privacy-policy" className="w-full cursor-pointer">
                    Política de Privacidade
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/terms" className="w-full cursor-pointer">
                    Termos de Uso
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a página inicial
            </Link>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Escolha o Plano Ideal para Seu Estabelecimento</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Com o ComandeJá, você tem acesso a uma plataforma completa para gestão do seu restaurante.
              Escolha o plano que melhor se adapta às suas necessidades.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`flex flex-col relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 right-6 bg-purple-500 hover:bg-purple-600">Mais Popular</Badge>
                )}
                
                {plan.discount > 0 && (
                  <Badge className="absolute -top-2 left-6 bg-green-500 hover:bg-green-600">Economize {plan.discount}%</Badge>
                )}
                
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>
                    <span className="text-gray-500">{plan.period}</span>
                    <p className="text-sm text-gray-500 mt-1">{plan.billing}</p>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    Selecionar Plano
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              Todos os planos incluem 7 dias de teste gratuito. Cancele a qualquer momento.
            </p>
            <p className="text-gray-500 mt-2">
              Precisa de um plano personalizado para sua rede de restaurantes?{' '}
              <a href="mailto:contato@comandeja.com.br" className="text-purple-600 hover:underline">
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} ComandeJá. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlansPage; 