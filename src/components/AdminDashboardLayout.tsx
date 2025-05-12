
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
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

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children, title }) => {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Assinaturas', path: '/admin/subscriptions', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Clientes', path: '/admin/clients', icon: <Users className="w-5 h-5" /> },
    { name: 'Planos', path: '/admin/plans', icon: <FileText className="w-5 h-5" /> },
    { name: 'Suporte', path: '/admin/support', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Relatórios', path: '/admin/reports', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Notificações', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Configurações', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
        {/* Sidebar */}
        <aside className={`bg-slate-900 text-white ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} transition-all duration-300 ease-in-out overflow-hidden`}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full px-4 py-2 flex items-center space-x-3 rounded-md transition-colors 
                  ${window.location.pathname === item.path
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
