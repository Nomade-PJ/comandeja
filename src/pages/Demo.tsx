import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  Laptop, 
  Monitor, 
  Smartphone, 
  MessageSquare,
  ArrowRight,
  PlayCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Demo = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    employees: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de envio de formulário
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "Nossa equipe entrará em contato em breve para agendar sua demonstração.",
      });
    }, 1500);
  };
  
  const demoFeatures = [
    {
      icon: <CalendarDays className="w-10 h-10 text-primary" />,
      title: "Demonstração Personalizada",
      description: "Apresentação focada nas necessidades específicas do seu restaurante."
    },
    {
      icon: <Clock className="w-10 h-10 text-primary" />,
      title: "30 Minutos",
      description: "Sessão objetiva que respeita o seu tempo, sem compromisso."
    },
    {
      icon: <Laptop className="w-10 h-10 text-primary" />,
      title: "Online ou Presencial",
      description: "Escolha o formato que melhor se adapta à sua disponibilidade."
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-primary" />,
      title: "Sem Compromisso",
      description: "Conheça a plataforma sem pressão de vendas ou obrigações."
    }
  ];
  
  const testimonials = [
    {
      quote: "A demonstração foi fundamental para entendermos como o Comandejá poderia se adaptar ao nosso modelo de negócio. Em menos de uma semana após implementar, já vimos um aumento de 30% nos pedidos online.",
      author: "Ana Silva",
      role: "Proprietária, Cantina Bella Napoli"
    },
    {
      quote: "Fiquei impressionado com a facilidade de uso da plataforma. A equipe foi muito atenciosa em mostrar exatamente os recursos que precisávamos para nossa operação.",
      author: "Carlos Mendes",
      role: "Gerente, Burger House"
    },
    {
      quote: "A demo nos mostrou recursos que nem sabíamos que precisávamos. Hoje não consigo imaginar gerenciar nosso restaurante sem o Comandejá.",
      author: "Patrícia Oliveira",
      role: "Diretora, Rede Sabor Express"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
              <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
                Demonstração
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                Veja o Comandejá em ação
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Agende uma demonstração personalizada e descubra como nossa plataforma pode transformar a gestão do seu restaurante.
              </p>
              <div className="flex items-center space-x-4">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white flex items-center"
                  size="lg"
                  onClick={() => {
                    const formElement = document.getElementById('demo-form');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Agendar Demo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Link to="/funcionalidades" className="flex items-center text-primary hover:text-primary/80">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Ver vídeo de apresentação
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full"></div>
                <img 
                  src="/placeholder.svg" 
                  alt="Demonstração do Comandejá" 
                  className="rounded-lg shadow-xl relative z-10 w-full"
                  style={{ height: '350px', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">O que esperar da sua demonstração</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {demoFeatures.map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Demo Form Section */}
      <section id="demo-form" className="py-16 bg-gradient-to-r from-primary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Agende sua demonstração</h2>
              <p className="text-gray-600 mb-8">
                Preencha o formulário e nossa equipe entrará em contato para agendar uma demonstração personalizada para o seu restaurante.
              </p>
              
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Seu nome"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail profissional *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(00) 00000-0000"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Nome do restaurante *</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Nome do seu restaurante"
                        required
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="role">Seu cargo</Label>
                      <select
                        id="role"
                        name="role"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="Proprietário">Proprietário</option>
                        <option value="Gerente">Gerente</option>
                        <option value="Chef">Chef</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employees">Número de funcionários</Label>
                      <select
                        id="employees"
                        name="employees"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.employees}
                        onChange={handleChange}
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="1-5">1-5</option>
                        <option value="6-10">6-10</option>
                        <option value="11-25">11-25</option>
                        <option value="26-50">26-50</option>
                        <option value="51+">51+</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Como podemos ajudar?</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Conte-nos um pouco sobre suas necessidades e desafios atuais..."
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Solicitar Demonstração"}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Ao enviar este formulário, você concorda com nossa Política de Privacidade.
                  </p>
                </form>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Solicitação enviada com sucesso!</h3>
                  <p className="text-gray-600 mb-4">
                    Obrigado pelo seu interesse no Comandejá. Nossa equipe entrará em contato em até 24 horas para agendar sua demonstração personalizada.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setSubmitted(false)}
                  >
                    Enviar nova solicitação
                  </Button>
                </div>
              )}
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white rounded-lg shadow-lg p-8 h-full">
                <h3 className="text-2xl font-bold mb-6">Por que agendar uma demonstração?</h3>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Monitor className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Veja a plataforma em ação</h4>
                      <p className="text-gray-600">
                        Navegue pela interface e entenda como ela funciona na prática, com exemplos reais.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Tire todas as suas dúvidas</h4>
                      <p className="text-gray-600">
                        Converse com especialistas que podem responder perguntas específicas sobre o seu negócio.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Descubra recursos exclusivos</h4>
                      <p className="text-gray-600">
                        Conheça funcionalidades avançadas que podem ser adaptadas às necessidades do seu restaurante.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold mb-4">O que nossos clientes dizem:</h4>
                  
                  <div className="space-y-4">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="italic text-gray-600 mb-2">"{testimonial.quote}"</p>
                        <p className="font-medium">{testimonial.author}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Não quer esperar pela demonstração?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comece agora mesmo com nosso período de teste gratuito de 15 dias e explore todas as funcionalidades.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Começar Gratuitamente
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Demo; 