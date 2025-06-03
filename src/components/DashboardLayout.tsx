import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Cookies from 'js-cookie';
import supabase from '@/lib/supabase';
import { 
  Package, 
  ShoppingCart, 
  Clock, 
  Calendar,
  MapPin,
  Users,
  BarChart3,
  Settings,
  FileText,
  MessageSquare,
  Menu,
  X,
  Database,
  MoreHorizontal,
  LogOut
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { restaurant } = useRestaurant();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const [moreMenuOpen, setMoreMenuOpen] = React.useState(false);

  // Atualizar o estado do sidebar sempre que o valor de isMobile mudar
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Pedidos', path: '/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Produtos', path: '/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Clientes', path: '/customers', icon: <Users className="w-5 h-5" /> },
    { name: 'Relatórios', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Cupons', path: '/coupons', icon: <FileText className="w-5 h-5" /> },
    { name: 'Avaliações', path: '/reviews', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Configurações', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // Itens adicionais que podem ser incluídos no menu "Mais"
  const extraItems = [];

  // For mobile, select only the main navigation items for the bottom bar
  const mobileNavItems = navItems.slice(0, 4); // Exatos 4 itens para garantir espaço para o botão "Mais"
  const moreNavItems = [...navItems.slice(4)]; // Itens que vão para o menu "Mais" (removidos os extras)

  const handleLogout = async () => {
    try {
      // Definir explicitamente que isso é um logout
      sessionStorage.setItem('explicit_logout', 'true');
      
      // Limpar todos os dados de sessão
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpar todos os cookies
      const allCookies = document.cookie.split(';');
      for (const cookie of allCookies) {
        const [name] = cookie.trim().split('=');
        if (name) {
          const trimmedName = name.trim();
          Cookies.remove(trimmedName, { path: '/' });
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; samesite=lax`;
        }
      }
      
      // Limpar cookies específicos do Supabase
      const supabaseCookies = document.cookie.split(';').filter(c => c.trim().startsWith('sb-'));
      for (const cookie of supabaseCookies) {
        const [name] = cookie.trim().split('=');
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; samesite=lax`;
        }
      }
      
      // Executar o logout no Supabase forçando o escopo
      await supabase.auth.signOut({ scope: 'global' });
      
      // Executar o logout do contexto
      logout();
      
      // Aguardar um momento para garantir que tudo foi limpo
      setTimeout(() => {
        // Navegar para a página de login
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Erro durante o processo de logout:', error);
      // Mesmo com erro, tentar navegar para o login
      window.location.href = '/login';
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const currentPath = window.location.pathname;

  // Layout para dispositivos móveis
  if (isMobile === true) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header Mobile */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">ComandeJá</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Main content - full width on mobile */}
        <main className="flex-1 pb-20">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </main>

        {/* Bottom Navigation for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10">
          <div className="flex justify-between bg-white rounded-full shadow-lg py-3 px-6">
            {mobileNavItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center ${
                  currentPath === item.path
                    ? 'text-primary'
                    : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </button>
            ))}
            
            {/* Botão "Mais" que abre um Dialog em vez de Popover */}
            <button
              onClick={() => setMoreMenuOpen(true)}
              className={`flex flex-col items-center justify-center ${
                moreNavItems.some(item => currentPath === item.path) ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs mt-1">Mais</span>
            </button>
          </div>
        </div>

        {/* Dialog para o menu "Mais" */}
        <Dialog open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
          <DialogContent 
            className="sm:max-w-md p-0 gap-0 bg-white text-gray-800" 
            onInteractOutside={() => setMoreMenuOpen(false)}
            forceMount
            style={{
              position: 'fixed',
              bottom: '0',
              top: 'auto',
              transform: 'translate(-50%, 0)',
              width: '100%',
              maxWidth: '450px',
              borderRadius: '20px 20px 0 0',
              padding: 0,
              marginBottom: 0
            }}
          >
            <div className="p-5 pb-2 text-center">
              <h2 className="text-xl font-semibold">Mais opções</h2>
              <p className="text-gray-500 text-sm">
                Acesse outras funcionalidades do sistema
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 px-5 py-4">
              {moreNavItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setMoreMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="h-8 w-8 flex items-center justify-center text-gray-700 mb-1">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
            
            <div className="p-4 pb-5">
              <Button 
                variant="destructive" 
                className="w-full bg-red-500 hover:bg-red-600 h-11 rounded-md flex items-center justify-center" 
                onClick={handleLogout}
              >
                <span className="mr-2">Sair</span>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Layout para desktop
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Desktop */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="mr-4">
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-bold text-primary">ComandeJá</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar para desktop */}
        <aside 
          className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0 overflow-hidden md:w-16'
          }`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full px-4 py-2 flex items-center space-x-3 rounded-md transition-colors 
                  ${currentPath === item.path
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            ))}
          </nav>
          
          {restaurant && sidebarOpen && (
            <div className="mt-8 p-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-500 mb-2">Informações do Restaurante</div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{restaurant.opening_hours || "09:00 - 18:00"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
