import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import supabase from '@/lib/supabase';
import { 
  BarChart2, 
  Users, 
  CreditCard, 
  FileText,
  MessageSquare, 
  Settings,
  Bell,
  Mail,
  LogOut,
  Shield,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children, title }) => {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [forceMobile, setForceMobile] = useState(false);

  // Inicializar o estado do sidebar a partir do localStorage ou com valor padrão
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('adminSidebarOpen');
      // Se não existir no localStorage, definir como aberto para desktop e fechado para mobile
      return savedState !== null ? savedState === 'true' : !isMobile;
    }
    return !isMobile;
  });

  // Verificar se a tela é móvel e atualizar o estado
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setForceMobile(isMobileView);
      
      // Não alteramos o sidebarOpen aqui para manter a consistência entre páginas
    };
    
    // Verificar imediatamente
    checkMobile();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Atualizar o estado do sidebar apenas quando o usuário alternar manualmente
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Salvar a preferência no localStorage
    localStorage.setItem('adminSidebarOpen', newState.toString());
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Assinaturas', path: '/admin/subscriptions', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Clientes', path: '/admin/clients', icon: <Users className="w-5 h-5" /> },
    { name: 'Planos', path: '/admin/plans', icon: <FileText className="w-5 h-5" /> },
    { name: 'Suporte', path: '/admin/support', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  // Itens adicionais para o menu "Mais"
  const moreNavItems = [
    { name: 'Relatórios', path: '/admin/reports', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Configurações', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Notificações', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
  ];

  // For mobile, select only the main navigation items for the bottom bar
  const mobileNavItems = navItems;

  const handleLogout = async () => {
    try {
      // Limpar todos os dados de sessão
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpar cookies
      const allCookies = document.cookie.split(';');
      for (const cookie of allCookies) {
        const [name] = cookie.trim().split('=');
        if (name) {
          Cookies.remove(name, { path: '/' });
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
      }
      
      // Fazer logout no Supabase
      await supabase.auth.signOut();
      
      // Executar o logout do contexto admin
      adminLogout();
      
      // Navegar para a página de login
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro durante o processo de logout:', error);
    }
  };

  const currentPath = window.location.pathname;

  // Layout para dispositivos móveis - Verificação forçada para garantir consistência
  if (isMobile === true || forceMobile === true) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Top navigation */}
        <header className="bg-primary text-white border-b border-primary-foreground shadow-md">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <div className="font-bold text-white text-xl">ComandeJá Admin</div>
            </div>
            {adminUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-white hover:bg-primary/80">
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <Settings className="w-4 h-4 mr-2" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 bg-slate-50 pb-20">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </main>

        {/* Bottom Navigation for Mobile - Flutuante e arredondado */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10">
          <div className="flex justify-between bg-white text-slate-800 rounded-full shadow-lg py-3 px-6">
            {mobileNavItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center ${
                  currentPath === item.path
                    ? 'text-primary font-medium'
                    : 'text-slate-500'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </button>
            ))}
            
            {/* Botão "Mais" que abre um Dialog */}
            <button
              onClick={() => setMoreMenuOpen(true)}
              className={`flex flex-col items-center justify-center ${
                moreNavItems.some(item => currentPath === item.path) ? 'text-primary font-medium' : 'text-slate-500'
              }`}
            >
              <Menu className="w-5 h-5" />
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
            
            <div className="grid grid-cols-3 gap-4 px-5 py-4">
              {moreNavItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setMoreMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  <div className="h-10 w-10 flex items-center justify-center text-primary mb-2">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
            
            <div className="p-4 pb-5">
              <Button 
                variant="destructive" 
                className="w-full bg-red-500 hover:bg-red-600 h-12 rounded-full flex items-center justify-center" 
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
    <div className="min-h-screen flex flex-col">
      {/* Top navigation */}
      <header className="bg-primary text-white border-b border-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary/80"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <div className="font-bold text-white text-xl">ComandeJá Admin</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
              <Mail size={20} />
            </Button>
            {adminUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-primary/80">
                    <span className="font-medium">{adminUser.name}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <Settings className="w-4 h-4 mr-2" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for Desktop */}
        <aside className={`bg-slate-900 text-white ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out overflow-hidden`}>
          <nav className="p-4 space-y-2">
            {[...navItems, ...moreNavItems].map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full px-4 py-2 flex items-center space-x-3 rounded-md transition-colors 
                  ${currentPath === item.path
                    ? 'bg-slate-800 text-white' 
                    : 'hover:bg-slate-800 text-slate-300'
                  }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 p-4 border-t border-slate-800">
            <div className="text-sm font-medium text-slate-400 mb-2">
              {sidebarOpen ? 'ComandeJá SaaS v1.0' : 'v1.0'}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-slate-50">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
