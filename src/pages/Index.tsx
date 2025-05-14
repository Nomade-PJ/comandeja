import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-[#4E3B8D]">ComandeJá</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#4E3B8D] to-[#6B50B5] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h2 className="text-4xl font-bold mb-6">Gerencie seu Restaurante com Facilidade</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Aumente suas vendas e tenha o controle completo do seu estabelecimento com nossa plataforma completa e intuitiva.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-[#4E3B8D] hover:bg-gray-100">
                Experimente Gratuitamente
              </Button>
            </Link>
          </div>
        </section>

        {/* Rest of your landing page content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Recursos Poderosos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature cards */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Gestão de Pedidos</h3>
                <p className="text-gray-600">Controle todos os pedidos em tempo real, desde o recebimento até a entrega.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Cardápio Digital</h3>
                <p className="text-gray-600">Crie um cardápio digital atraente e personalizável com QR Code.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Relatórios Detalhados</h3>
                <p className="text-gray-600">Visualize dados importantes e tome decisões baseadas em informações precisas.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} ComandeJá. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
