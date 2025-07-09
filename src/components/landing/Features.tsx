import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Users, TrendingUp, BarChart3, Clock, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Store,
      title: "Cardápio Digital",
      description: "Crie e gerencie seu cardápio online com fotos, descrições e preços atualizados em tempo real.",
      badge: "Essencial"
    },
    {
      icon: Users,
      title: "Gestão de Pedidos",
      description: "Receba, processe e acompanhe todos os pedidos em uma interface intuitiva com notificações em tempo real.",
      badge: "Popular"
    },
    {
      icon: TrendingUp,
      title: "Relatórios Avançados",
      description: "Acompanhe vendas, produtos mais pedidos e performance do seu restaurante com gráficos detalhados.",
      badge: "Analytics"
    },
    {
      icon: BarChart3,
      title: "Dashboard Inteligente",
      description: "Visualize métricas importantes, pedidos ativos e performance em um painel centralizado.",
      badge: "Pro"
    },
    {
      icon: Clock,
      title: "Gestão de Tempo",
      description: "Configure horários de funcionamento, tempo de preparo e estimativas de entrega automáticas.",
      badge: "Automação"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados e dos seus clientes protegidos com criptografia e backup automático.",
      badge: "Segurança"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            <div className="text-gray-900 mb-2">Tudo que seu restaurante</div>
            <div className="text-gray-900">precisa</div>
            <span className="text-primary font-bold block mt-2">em uma plataforma</span>
          </h2>
          <p className="text-xl text-gray-600">
            Descubra como o ComandeJá pode transformar a gestão do seu restaurante 
            com ferramentas profissionais e fáceis de usar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-gray-100/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
