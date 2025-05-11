
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-100">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/6ec02b00-828d-41c4-ad7c-9365cabb57ca.png" 
              alt="ComandeJá" 
              className="h-10 mr-2" 
            />
            <span className="text-2xl font-bold text-[#4E3B8D]">ComandeJá</span>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard">
                <Button>Acessar Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button>Começar</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="md:flex items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Simplifique os pedidos e entregas do seu restaurante
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Uma plataforma completa para restaurantes gerenciarem pedidos, entregas e relacionamento com clientes. 
                Aumente sua eficiência e expanda seu negócio.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="text-lg px-8">
                    Comece Grátis
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-6">
                    Entrar
                  </Button>
                </Link>
              </div>
              <div className="mt-8 text-gray-500">
                <p>Não é necessário cartão de crédito. Teste grátis por 10 dias.</p>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <div className="rounded-lg shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1080" 
                  alt="Comida de restaurante" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
          
          <div className="py-16 md:py-24">
            <h2 className="text-3xl font-bold text-center mb-16">
              Tudo o que seu restaurante precisa
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Pedidos em Tempo Real</h3>
                <p className="text-gray-600">
                  Receba pedidos dos seus clientes instantaneamente com notificações e rastreamento automáticos.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Cardápio Digital</h3>
                <p className="text-gray-600">
                  Cardápios digitais bonitos que os clientes podem navegar de qualquer lugar em qualquer dispositivo.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Gestão de Entregas</h3>
                <p className="text-gray-600">
                  Acompanhe entregas, atribua pedidos a entregadores e mantenha os clientes informados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center mb-4">
                <img 
                  src="/lovable-uploads/6ec02b00-828d-41c4-ad7c-9365cabb57ca.png" 
                  alt="ComandeJá" 
                  className="h-8 mr-2" 
                />
                <h3 className="text-2xl font-bold">ComandeJá</h3>
              </div>
              <p className="text-gray-400 max-w-xs">
                Otimizando operações de restaurantes através de soluções tecnológicas inovadoras.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold mb-4">Empresa</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Sobre</li>
                  <li>Carreiras</li>
                  <li>Blog</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Recursos</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Central de Ajuda</li>
                  <li>Preços</li>
                  <li>Documentação</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Privacidade</li>
                  <li>Termos</li>
                  <li>Política de Cookies</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ComandeJá. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
