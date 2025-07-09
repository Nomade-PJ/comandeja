import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Precos = () => {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  
  const plans = [
    {
      name: "Básico",
      description: "Para restaurantes iniciando no mundo digital",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "Cardápio digital",
        "Gestão de pedidos",
        "Dashboard básico",
        "Suporte via email",
        "1 usuário"
      ],
      notIncluded: [
        "Integração com delivery",
        "Relatórios avançados",
        "Múltiplos restaurantes",
        "Suporte prioritário",
        "API"
      ],
      cta: "Começar Grátis",
      popular: false,
      color: "bg-gray-100"
    },
    {
      name: "Profissional",
      description: "A escolha ideal para a maioria dos restaurantes",
      monthlyPrice: 199,
      annualPrice: 159,
      features: [
        "Tudo do plano Básico",
        "Integração com delivery",
        "Relatórios avançados",
        "Cupons e promoções",
        "Suporte prioritário",
        "Multi-usuários"
      ],
      notIncluded: [
        "Múltiplos restaurantes",
        "API personalizada",
        "Gestor de conta dedicado"
      ],
      cta: "Assinar Agora",
      popular: true,
      color: "bg-primary/5"
    },
    {
      name: "Empresarial",
      description: "Para redes de restaurantes e operações maiores",
      monthlyPrice: 399,
      annualPrice: 319,
      features: [
        "Tudo do plano Profissional",
        "Múltiplos restaurantes",
        "API personalizada",
        "Analytics avançado",
        "Suporte 24/7",
        "Gestor de conta dedicado"
      ],
      notIncluded: [],
      cta: "Falar com Vendas",
      popular: false,
      color: "bg-gray-100"
    }
  ];
  
  const faqs = [
    {
      question: "Existe algum período de teste?",
      answer: "Sim, oferecemos 15 dias de teste gratuito em todos os planos, sem necessidade de cartão de crédito. Você pode cancelar a qualquer momento durante o período de teste."
    },
    {
      question: "Preciso assinar contrato de fidelidade?",
      answer: "Não, todos os nossos planos são sem fidelidade. Você pode cancelar a qualquer momento e só paga pelo período que utilizar."
    },
    {
      question: "Como funciona o suporte técnico?",
      answer: "O plano Básico inclui suporte por e-mail com tempo de resposta de até 24h. Os planos Profissional e Empresarial incluem suporte prioritário por chat e telefone, com tempos de resposta menores."
    },
    {
      question: "Posso mudar de plano depois?",
      answer: "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente e o valor é ajustado proporcionalmente."
    },
    {
      question: "Quais métodos de pagamento são aceitos?",
      answer: "Aceitamos cartões de crédito (Visa, Mastercard, American Express), boleto bancário e PIX para pagamentos no Brasil."
    },
    {
      question: "O que acontece se eu ultrapassar os limites do meu plano?",
      answer: "Nossos planos são projetados para crescer com seu negócio. Se você estiver se aproximando dos limites, entraremos em contato para discutir opções de upgrade."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              Preços
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Planos que crescem com o seu negócio
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Escolha o plano ideal para o seu restaurante e comece a transformar a experiência dos seus clientes.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              <span className={`mr-3 ${billing === "monthly" ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                Mensal
              </span>
              <Switch
                checked={billing === "annual"}
                onCheckedChange={(checked) => setBilling(checked ? "annual" : "monthly")}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`ml-3 ${billing === "annual" ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                Anual <Badge className="ml-1 bg-green-100 text-green-800 hover:bg-green-200">20% OFF</Badge>
              </span>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`border ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : 'border-gray-200'} ${plan.color}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-primary text-white hover:bg-primary/90 px-3 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold">
                      R$ {billing === "monthly" ? plan.monthlyPrice : plan.annualPrice}
                      <span className="text-lg font-normal text-gray-500">/mês</span>
                    </p>
                    {billing === "annual" && (
                      <p className="text-sm text-gray-500 mt-1">Faturado anualmente</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <p className="font-medium">Inclui:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.notIncluded.length > 0 && (
                      <>
                        <p className="font-medium mt-4">Não inclui:</p>
                        <ul className="space-y-2 text-gray-500">
                          {plan.notIncluded.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <span className="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">—</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={plan.name === "Empresarial" ? "/contato" : "/register"} className="w-full">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Comparison */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comparação detalhada dos planos</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 bg-gray-50">Recursos</th>
                  <th className="text-center py-4 px-6">Básico</th>
                  <th className="text-center py-4 px-6 bg-primary/5">Profissional</th>
                  <th className="text-center py-4 px-6">Empresarial</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">Cardápio digital</td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">Gestão de pedidos</td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">
                    <div className="flex items-center">
                      <span>Dashboard analítico</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-gray-400 ml-2" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-xs">
                              Básico: métricas simples. Profissional: relatórios detalhados. 
                              Empresarial: análises avançadas e personalizadas.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                  <td className="text-center py-4 px-6">Básico</td>
                  <td className="text-center py-4 px-6 bg-primary/5">Avançado</td>
                  <td className="text-center py-4 px-6">Completo</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">Usuários</td>
                  <td className="text-center py-4 px-6">1</td>
                  <td className="text-center py-4 px-6 bg-primary/5">5</td>
                  <td className="text-center py-4 px-6">Ilimitado</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">Integração com delivery</td>
                  <td className="text-center py-4 px-6">—</td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">Cupons e promoções</td>
                  <td className="text-center py-4 px-6">—</td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">Múltiplos restaurantes</td>
                  <td className="text-center py-4 px-6">—</td>
                  <td className="text-center py-4 px-6 bg-primary/5">—</td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">API</td>
                  <td className="text-center py-4 px-6">—</td>
                  <td className="text-center py-4 px-6 bg-primary/5">Básica</td>
                  <td className="text-center py-4 px-6">Completa</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-6 bg-gray-50 font-medium">Suporte</td>
                  <td className="text-center py-4 px-6">Email</td>
                  <td className="text-center py-4 px-6 bg-primary/5">Prioritário</td>
                  <td className="text-center py-4 px-6">24/7 + Gestor dedicado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Ainda tem dúvidas sobre nossos planos?</p>
            <Link to="/contato">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Fale com nossa equipe
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Comece a transformar seu restaurante hoje</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Teste gratuitamente por 15 dias. Cancele quando quiser, sem compromisso.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Começar Teste Gratuito
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Precos; 