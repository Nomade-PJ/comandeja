
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-blue-50/30" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-brand-100 rounded-full text-brand-700 text-sm font-medium mb-8">
            🚀 Revolucione seu restaurante com tecnologia
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Gerencie seu restaurante
            <span className="gradient-text block">de forma inteligente</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            O ComandeJá é a plataforma completa para digitalizar seu restaurante. 
            Gerencie pedidos, cardápio, clientes e relatórios em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white px-8 py-6 text-lg">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-brand-200 text-brand-700 hover:bg-brand-50">
              <Play className="mr-2 h-5 w-5" />
              Ver Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600 mb-2">15 dias</div>
              <div className="text-gray-600">Teste grátis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600 mb-2">24/7</div>
              <div className="text-gray-600">Suporte técnico</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime garantido</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
