import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "Grátis",
      period: "por 15 dias",
      description: "Perfeito para testar a plataforma",
      features: [
        "Até 50 pedidos/mês",
        "Cardápio digital básico",
        "Dashboard essencial",
        "Suporte via email"
      ],
      popular: false,
      cta: "Começar Grátis"
    },
    {
      name: "Professional",
      price: "R$ 89",
      period: "/mês",
      description: "Ideal para restaurantes em crescimento",
      features: [
        "Pedidos ilimitados",
        "Relatórios avançados",
        "Cupons e promoções",
        "Suporte prioritário",
        "Integrações API",
        "Multi-usuários"
      ],
      popular: true,
      cta: "Assinar Agora"
    },
    {
      name: "Enterprise",
      price: "R$ 189",
      period: "/mês",
      description: "Para redes e grandes restaurantes",
      features: [
        "Tudo do Professional",
        "White-label",
        "Múltiplos restaurantes",
        "Analytics avançado",
        "Suporte 24/7",
        "Gestor de conta dedicado"
      ],
      popular: false,
      cta: "Falar com Vendas"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            <div className="text-gray-900 mb-2">Planos que crescem</div>
            <span className="text-primary font-bold">com seu negócio</span>
          </h2>
          <p className="text-xl text-gray-600">
            Escolha o plano ideal para o seu restaurante. Comece grátis e 
            evolua conforme sua necessidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative hover-lift ${plan.popular ? 'ring-2 ring-brand-500 shadow-xl' : 'stat-card'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-brand text-white">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-brand-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/register" className="block">
                  <Button 
                    className={`w-full py-6 text-lg ${
                      plan.popular 
                        ? 'bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Todos os planos incluem 15 dias de teste grátis • Cancele a qualquer momento
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
