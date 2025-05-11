
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { Button } from '@/components/ui/button';
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
  MessageSquare
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { restaurant } = useRestaurant();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="font-bold text-[#4E3B8D] text-2xl">ComandeJá</div>
            </div>
            {restaurant && (
              <div className="px-2 py-1 bg-gray-100 rounded text-sm">
                {restaurant.name}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-sm">
                <span className="font-medium">{user.name}</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-gray-50 w-64 border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full px-4 py-2 flex items-center space-x-3 rounded-md transition-colors 
                  ${window.location.pathname === item.path
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          
          {restaurant && (
            <div className="mt-8 p-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-500 mb-2">Informações do Restaurante</div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{restaurant.openingHours}</span>
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
        <main className="flex-1 bg-gray-50">
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
