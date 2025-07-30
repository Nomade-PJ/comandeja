import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/components/ui/use-toast";
import { ContactForm, FormField } from "@/components/ui/contact-form";

const Demo = () => {
  const { toast } = useToast();
  
  // Definir os campos do formulário
  const demoFormFields: FormField[] = [
    {
      name: "name",
      label: "Nome completo",
      type: "text",
      placeholder: "Seu nome",
      required: true,
      colSpan: 1
    },
    {
      name: "email",
      label: "E-mail profissional",
      type: "email",
      placeholder: "seu@email.com",
      required: true,
      colSpan: 1
    },
    {
      name: "phone",
      label: "Telefone",
      type: "tel",
      placeholder: "(00) 00000-0000",
      required: true,
      colSpan: 1
    },
    {
      name: "company",
      label: "Nome do restaurante",
      type: "text",
      placeholder: "Nome do seu restaurante",
      required: true,
      colSpan: 1
    },
    {
      name: "role",
      label: "Cargo",
      type: "text",
      placeholder: "Seu cargo",
      colSpan: 1
    },
    {
      name: "employees",
      label: "Número de funcionários",
      type: "select",
      options: [
        { value: "1-5", label: "1-5 funcionários" },
        { value: "6-15", label: "6-15 funcionários" },
        { value: "16-30", label: "16-30 funcionários" },
        { value: "31+", label: "31+ funcionários" }
      ],
      colSpan: 1
    },
    {
      name: "message",
      label: "Como podemos ajudar?",
      type: "textarea",
      placeholder: "Conte-nos um pouco sobre suas necessidades e desafios atuais...",
      colSpan: 2
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              Demo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Veja o ComandeJá em ação
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Agende uma demonstração personalizada e descubra como o ComandeJá pode transformar a gestão do seu restaurante.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                size="lg"
                onClick={() => {
                  const demoFormElement = document.getElementById('demo-form');
                  if (demoFormElement) {
                    demoFormElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Agendar Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2"
              >
                <PlayCircle className="h-5 w-5" />
                Ver vídeo
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O que você verá na demonstração</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa demonstração personalizada mostra como o ComandeJá pode se adaptar às necessidades específicas do seu restaurante.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Dashboard Intuitivo</h3>
                <p className="text-gray-600">
                  Interface amigável com visão completa das operações do seu restaurante em tempo real.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cardápio Digital</h3>
                <p className="text-gray-600">
                  Cardápio digital personalizado com fotos, descrições e opções de personalização.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestão de Pedidos</h3>
                <p className="text-gray-600">
                  Receba e gerencie pedidos online, delivery e presenciais em um único sistema.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
                <p className="text-gray-600">
                  Análise de vendas, produtos mais populares e comportamento dos clientes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestão de Estoque</h3>
                <p className="text-gray-600">
                  Controle automático de estoque com alertas de níveis baixos e relatórios de uso.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Laptop className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Integração Completa</h3>
                <p className="text-gray-600">
                  Integração com sistemas de pagamento, contabilidade e delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Demo Form Section */}
      <section id="demo-form" className="py-16 bg-gradient-to-r from-primary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <ContactForm 
                title="Agende sua demonstração"
                description="Preencha o formulário e nossa equipe entrará em contato para agendar uma demonstração personalizada para o seu restaurante."
                fields={demoFormFields}
                submitButtonText="Solicitar Demonstração"
                successTitle="Solicitação enviada com sucesso!"
                successDescription="Obrigado pelo seu interesse no Comandejá. Nossa equipe entrará em contato em até 24 horas para agendar sua demonstração personalizada."
                resetButtonText="Enviar nova solicitação"
              />
            </div>
            
            <div className="lg:w-1/2 flex flex-col justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4">O que esperar da demonstração</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Apresentação personalizada</p>
                      <p className="text-gray-600">Demonstração adaptada às necessidades específicas do seu restaurante.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Demonstração prática</p>
                      <p className="text-gray-600">Veja o sistema em ação com exemplos reais e casos de uso.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Sessão de perguntas</p>
                      <p className="text-gray-600">Tire todas as suas dúvidas com nossos especialistas.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Proposta personalizada</p>
                      <p className="text-gray-600">Receba uma proposta adaptada às necessidades do seu negócio.</p>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-800 font-medium">Tempo estimado: 30-45 minutos</p>
                  <p className="text-blue-700 text-sm mt-1">Demonstrações disponíveis de segunda a sexta, das 9h às 18h.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Demo; 