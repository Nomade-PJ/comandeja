import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, User, Menu as MenuIcon } from 'lucide-react';
import Cookies from 'js-cookie';
import supabase from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const navigate = useNavigate();

  // Limpar sessão ao carregar a página inicial
  useEffect(() => {
    const clearSession = async () => {
      try {
        // Limpar cookies
        const allCookies = document.cookie.split(';');
        for (const cookie of allCookies) {
          const [name] = cookie.trim().split('=');
          if (name) {
            Cookies.remove(name, { path: '/' });
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
          }
        }
        
        // Limpar localStorage e sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Fazer logout no Supabase
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Erro ao limpar sessão:', e);
      }
    };
    
    clearSession();
  }, []);
  
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Limpar sessão novamente antes de redirecionar
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 flex justify-between items-center">
          <div className="flex items-center -my-12">
            <img src="/images/logo.png" alt="ComandeJá" className="h-40 w-auto" />
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <a onClick={handleLoginClick} className="w-full flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/plans" className="w-full flex items-center cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Criar Conta</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/privacy-policy" className="w-full cursor-pointer">
                    Política de Privacidade
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/terms" className="w-full cursor-pointer">
                    Termos de Uso
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#4E3B8D] to-[#6B50B5] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h2 className="text-4xl font-bold mb-6">Gerencie seu Restaurante com Facilidade</h2>
            <p className="text-xl max-w-4xl mx-auto mb-8">
              Aumente suas vendas e tenha o controle completo do seu estabelecimento com nossa plataforma completa e intuitiva. Para Restaurantes, Pizzarias e Estabelecimentos Online e Físicos de Todo o Brasil.
            </p>
            <Link to="/plans">
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
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-3">Gestão de Pedidos</h3>
                <p className="text-gray-600">Controle todos os pedidos em tempo real, desde o recebimento até a entrega.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-3">Cardápio Digital</h3>
                <p className="text-gray-600">Crie um cardápio digital atraente e personalizável com QR Code.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
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
