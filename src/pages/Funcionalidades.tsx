import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Clock, 
  Bell, 
  Smartphone, 
  CreditCard,
  ClipboardList,
  Star,
  MessageSquare,
  Zap,
  Settings,
  Shield,
  Gift,
  Percent
} from "lucide-react";
import { Link } from "react-router-dom";

const Funcionalidades = () => {
  const [activeTab, setActiveTab] = useState("restaurantes");

  const features = {
    restaurantes: [
      {
        icon: <Store className="w-10 h-10 text-primary" />,
        title: "Gestão de Cardápio",
        description: "Crie e gerencie seu cardápio digital com categorias, imagens e descrições detalhadas. Atualize preços e disponibilidade em tempo real."
      },
      {
        icon: <ShoppingCart className="w-10 h-10 text-primary" />,
        title: "Pedidos Online",
        description: "Receba pedidos online diretamente no sistema, com notificações em tempo real e acompanhamento do status."
      },
      {
        icon: <BarChart3 className="w-10 h-10 text-primary" />,
        title: "Dashboard Analítico",
        description: "Visualize métricas importantes como vendas, produtos mais populares e horários de pico para tomar decisões baseadas em dados."
      },
      {
        icon: <Users className="w-10 h-10 text-primary" />,
        title: "Gestão de Clientes",
        description: "Mantenha um banco de dados de clientes com histórico de pedidos e preferências para melhorar o relacionamento."
      },
      {
        icon: <Clock className="w-10 h-10 text-primary" />,
        title: "Controle de Tempo",
        description: "Defina e gerencie tempos de preparo e entrega, mantendo seus clientes informados sobre o status do pedido."
      },
      {
        icon: <Bell className="w-10 h-10 text-primary" />,
        title: "Notificações",
        description: "Receba alertas sobre novos pedidos, avaliações e mensagens de clientes diretamente no sistema ou por e-mail."
      }
    ],
    clientes: [
      {
        icon: <Smartphone className="w-10 h-10 text-primary" />,
        title: "Interface Intuitiva",
        description: "Navegue facilmente pelo cardápio, adicione itens ao carrinho e finalize pedidos com poucos cliques."
      },
      {
        icon: <CreditCard className="w-10 h-10 text-primary" />,
        title: "Pagamento Simplificado",
        description: "Diversas opções de pagamento seguras e integradas para uma experiência de compra sem complicações."
      },
      {
        icon: <ClipboardList className="w-10 h-10 text-primary" />,
        title: "Acompanhamento de Pedidos",
        description: "Acompanhe o status do seu pedido em tempo real, desde o preparo até a entrega."
      },
      {
        icon: <Star className="w-10 h-10 text-primary" />,
        title: "Avaliações e Feedback",
        description: "Avalie restaurantes e pratos, contribuindo para a melhoria contínua do serviço."
      },
      {
        icon: <MessageSquare className="w-10 h-10 text-primary" />,
        title: "Chat com Restaurante",
        description: "Comunique-se diretamente com o restaurante para esclarecer dúvidas ou fazer solicitações especiais."
      },
      {
        icon: <Zap className="w-10 h-10 text-primary" />,
        title: "Pedidos Rápidos",
        description: "Repita pedidos anteriores ou salve favoritos para agilizar futuras compras."
      }
    ],
    tecnologia: [
      {
        icon: <Settings className="w-10 h-10 text-primary" />,
        title: "API Robusta",
        description: "Integre facilmente com outros sistemas e aplicativos através da nossa API documentada e segura."
      },
      {
        icon: <Shield className="w-10 h-10 text-primary" />,
        title: "Segurança Avançada",
        description: "Proteção de dados e transações com criptografia de ponta a ponta e conformidade com normas de segurança."
      },
      {
        icon: <Smartphone className="w-10 h-10 text-primary" />,
        title: "Design Responsivo",
        description: "Experiência perfeita em qualquer dispositivo, do desktop ao smartphone, sem necessidade de aplicativos."
      },
      {
        icon: <Zap className="w-10 h-10 text-primary" />,
        title: "Alta Performance",
        description: "Sistema otimizado para carregamento rápido e operação fluida, mesmo em conexões mais lentas."
      },
      {
        icon: <Gift className="w-10 h-10 text-primary" />,
        title: "Programa de Fidelidade",
        description: "Ferramentas para criar e gerenciar programas de fidelidade, pontos e recompensas para clientes."
      },
      {
        icon: <Percent className="w-10 h-10 text-primary" />,
        title: "Cupons e Promoções",
        description: "Crie e gerencie facilmente campanhas promocionais, descontos e cupons personalizados."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              Funcionalidades
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Tudo que você precisa para gerenciar seu restaurante
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Conheça as ferramentas que vão transformar a experiência dos seus clientes e impulsionar o seu negócio.
            </p>
          </div>
        </div>
      </section>
      
      {/* Features Tabs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="restaurantes" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-2xl">
                <TabsTrigger value="restaurantes">Para Restaurantes</TabsTrigger>
                <TabsTrigger value="clientes">Para Clientes</TabsTrigger>
                <TabsTrigger value="tecnologia">Tecnologia</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="restaurantes" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">Ferramentas para o seu negócio</h2>
                <p className="text-gray-600">
                  Simplifique a gestão do seu restaurante com nossas soluções completas, desde o cardápio até análises avançadas.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.restaurantes.map((feature, index) => (
                  <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="mb-4">{feature.icon}</div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="clientes" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">Experiência para seus clientes</h2>
                <p className="text-gray-600">
                  Ofereça uma experiência digital excepcional para seus clientes, do pedido à entrega.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.clientes.map((feature, index) => (
                  <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="mb-4">{feature.icon}</div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tecnologia" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">Tecnologia de ponta</h2>
                <p className="text-gray-600">
                  Nossa plataforma utiliza as mais modernas tecnologias para garantir segurança, performance e escalabilidade.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.tecnologia.map((feature, index) => (
                  <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="mb-4">{feature.icon}</div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para transformar seu restaurante?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comece agora mesmo e aproveite 15 dias de teste gratuito em todos os recursos da plataforma.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Falar com Consultor
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Funcionalidades; 