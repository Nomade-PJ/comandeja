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
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send,
  CheckCircle,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Contato = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
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
        title: "Mensagem enviada com sucesso!",
        description: "Nossa equipe entrará em contato em breve.",
      });
    }, 1500);
  };
  
  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5 text-primary" />,
      title: "Endereço",
      details: [
        "Av. Paulista, 1000 - Bela Vista",
        "São Paulo - SP, 01310-100",
        "Brasil"
      ]
    },
    {
      icon: <Phone className="w-5 h-5 text-primary" />,
      title: "Telefone",
      details: [
        "+55 (11) 4000-0000",
        "+55 (11) 99999-9999"
      ]
    },
    {
      icon: <Mail className="w-5 h-5 text-primary" />,
      title: "Email",
      details: [
        "contato@comandeja.com.br",
        "suporte@comandeja.com.br"
      ]
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "Horário de Atendimento",
      details: [
        "Segunda a Sexta: 9h às 18h",
        "Sábado: 9h às 13h"
      ]
    }
  ];
  
  const departments = [
    { value: "", label: "Selecione um departamento" },
    { value: "comercial", label: "Comercial" },
    { value: "suporte", label: "Suporte Técnico" },
    { value: "financeiro", label: "Financeiro" },
    { value: "parcerias", label: "Parcerias" },
    { value: "imprensa", label: "Imprensa" },
    { value: "outros", label: "Outros" }
  ];
  
  const socialMedia = [
    { icon: <Facebook className="w-5 h-5" />, name: "Facebook", url: "#" },
    { icon: <Instagram className="w-5 h-5" />, name: "Instagram", url: "#" },
    { icon: <Linkedin className="w-5 h-5" />, name: "LinkedIn", url: "#" },
    { icon: <Twitter className="w-5 h-5" />, name: "Twitter", url: "#" },
    { icon: <Youtube className="w-5 h-5" />, name: "YouTube", url: "#" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              Contato
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Entre em contato conosco
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Estamos aqui para ajudar. Entre em contato com nossa equipe para tirar dúvidas, solicitar demonstrações ou obter suporte.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Envie-nos uma mensagem</h2>
              <p className="text-gray-600 mb-8">
                Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível.
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
                      <Label htmlFor="email">Email *</Label>
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
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Departamento *</Label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        {departments.map((dept, index) => (
                          <option key={index} value={dept.value}>{dept.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Como podemos ajudar?"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Ao enviar este formulário, você concorda com nossa Política de Privacidade.
                  </p>
                </form>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Mensagem enviada com sucesso!</h3>
                  <p className="text-gray-600 mb-6">
                    Obrigado por entrar em contato conosco. Nossa equipe responderá em até 24 horas úteis.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setSubmitted(false)}
                  >
                    Enviar nova mensagem
                  </Button>
                </div>
              )}
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-gray-50 p-8 rounded-lg h-full">
                <h2 className="text-3xl font-bold mb-6">Informações de Contato</h2>
                
                <div className="space-y-6 mb-8">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-4">
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{info.title}</h4>
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-gray-600">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold mb-4">Siga-nos nas redes sociais</h4>
                  <div className="flex space-x-4">
                    {socialMedia.map((social, index) => (
                      <a 
                        key={index} 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-200 hover:bg-primary/10 p-3 rounded-full transition-colors"
                        aria-label={social.name}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nossa Localização</h2>
          
          <div className="aspect-[16/9] max-w-5xl mx-auto bg-gray-200 rounded-lg overflow-hidden">
            {/* Placeholder for Google Maps iframe */}
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Mapa do Google seria carregado aqui</p>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto mt-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Comandejá - Sede São Paulo</h3>
            <p className="text-gray-600">
              Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100, Brasil
            </p>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Qual o prazo de resposta para contatos?</h3>
              <p className="text-gray-600">
                Nosso prazo de resposta é de até 24 horas úteis para emails e formulários de contato. 
                Para assuntos urgentes, recomendamos o contato por telefone ou chat ao vivo.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Como solicitar uma demonstração?</h3>
              <p className="text-gray-600">
                Você pode solicitar uma demonstração através do formulário de contato, selecionando o 
                departamento "Comercial", ou diretamente pela página de demonstração em nosso site.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Como obter suporte técnico?</h3>
              <p className="text-gray-600">
                Clientes podem acessar o suporte técnico através do dashboard, na seção "Suporte". 
                Também oferecemos suporte por email, telefone e chat, dependendo do seu plano.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Vocês oferecem suporte presencial?</h3>
              <p className="text-gray-600">
                Sim, oferecemos suporte presencial para clientes empresariais na região de São Paulo. 
                Para outras localidades, podemos agendar visitas técnicas com custo adicional.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Precisa de ajuda imediata?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Nossa equipe de suporte está disponível para ajudar você em tempo real.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <MessageCircle className="mr-2 w-5 h-5" />
              Iniciar Chat ao Vivo
            </Button>
            <Link to="/central-ajuda">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Acessar Central de Ajuda
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contato; 