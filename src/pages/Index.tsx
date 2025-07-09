import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Store, Users, TrendingUp, BarChart3, Clock, Shield, Play } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="inline-block mb-4 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                🚀 Revolucione seu restaurante com tecnologia
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 flex flex-col">
                <div className="mb-2 text-gray-900">Gerencie seu</div>
                <div className="mb-2 text-gray-900">restaurante</div>
                <div className="text-primary font-bold">de forma inteligente</div>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                O ComandeJá é a plataforma completa para digitalizar seu restaurante. 
                Gerencie pedidos, cardápio, clientes e relatórios em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 w-full">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/demo" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full bg-white hover:bg-gray-50 border-primary text-primary">
                    <Play className="mr-2 h-5 w-5" />
                    Ver Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <img 
                src="/logo.png" 
                alt="ComandeJá Logo" 
                className="w-full max-w-lg"
              />
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="container mx-auto px-4 mt-20">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">15 dias</p>
              <p className="text-gray-600">Teste grátis</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">24/7</p>
              <p className="text-gray-600">Suporte técnico</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">99.9%</p>
              <p className="text-gray-600">Uptime garantido</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <Features />
      
      {/* Pricing Section */}
      <Pricing />
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <div className="text-gray-900 mb-2">Pronto para transformar</div>
            <div className="text-primary">seu restaurante?</div>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comece hoje mesmo com nosso período de teste gratuito de 15 dias. 
            Sem compromisso, cancele quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                Começar Agora
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Falar com Vendas
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
