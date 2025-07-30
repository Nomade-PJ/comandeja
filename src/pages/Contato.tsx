import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ContactForm, FormField } from "@/components/ui/contact-form";

// Dados dos departamentos para o formulário de contato
const departments = [
  { value: "comercial", label: "Comercial" },
  { value: "suporte", label: "Suporte Técnico" },
  { value: "financeiro", label: "Financeiro" },
  { value: "parcerias", label: "Parcerias" },
  { value: "imprensa", label: "Imprensa" },
  { value: "outros", label: "Outros" }
];

const Contato = () => {
  const { toast } = useToast();
  
  // Definir os campos do formulário
  const contatoFormFields: FormField[] = [
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
      label: "Email",
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
      colSpan: 1
    },
    {
      name: "subject",
      label: "Departamento",
      type: "select",
      required: true,
      options: departments,
      colSpan: 1
    },
    {
      name: "message",
      label: "Mensagem",
      type: "textarea",
      placeholder: "Como podemos ajudar?",
      required: true,
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
              <ContactForm 
                title="Envie-nos uma mensagem"
                description="Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível."
                fields={contatoFormFields}
                submitButtonText="Enviar Mensagem"
              />
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Informações de Contato</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Endereço</h3>
                    <p className="text-gray-600">
                      Av. Paulista, 1000, 10º andar<br />
                      Bela Vista, São Paulo - SP<br />
                      CEP: 01310-100
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Telefone</h3>
                    <p className="text-gray-600">
                      +55 (11) 3456-7890<br />
                      +55 (11) 98765-4321 (WhatsApp)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <p className="text-gray-600">
                      contato@comandeja.com.br<br />
                      suporte@comandeja.com.br
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Horário de Atendimento</h3>
                    <p className="text-gray-600">
                      Segunda a Sexta: 9h às 18h<br />
                      Sábado: 9h às 13h
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Siga-nos nas redes sociais</h3>
                <div className="flex gap-4">
                  <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
                    <Facebook className="h-5 w-5 text-gray-700" />
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
                    <Instagram className="h-5 w-5 text-gray-700" />
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
                    <Linkedin className="h-5 w-5 text-gray-700" />
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
                    <Twitter className="h-5 w-5 text-gray-700" />
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
                    <Youtube className="h-5 w-5 text-gray-700" />
                  </a>
                </div>
              </div>
            </div>
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
              <h3 className="text-xl font-semibold mb-2">Vocês oferecem treinamento?</h3>
              <p className="text-gray-600">
                Sim, oferecemos treinamento completo para todos os novos clientes, além de 
                webinars regulares e materiais de apoio na nossa central de ajuda.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Onde Estamos</h2>
          <div className="h-96 bg-gray-200 rounded-lg">
            {/* Aqui seria inserido um mapa real */}
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Mapa será carregado aqui</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contato; 