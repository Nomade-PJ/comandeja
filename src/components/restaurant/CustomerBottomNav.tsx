import { Home, Package, MapPin, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

export const CustomerBottomNav = ({ restaurantSlug }) => {
  const location = useLocation();
  const { getItemCount } = useCart();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link to={`/${restaurantSlug}`} className={`flex flex-col items-center ${location.pathname === `/${restaurantSlug}` ? 'text-green-600' : 'text-gray-500'}`}>
          <Home size={20} />
          <span className="text-xs mt-1">Início</span>
        </Link>
        
        <Link to={`/meus-pedidos`} className={`flex flex-col items-center ${location.pathname === '/meus-pedidos' ? 'text-green-600' : 'text-gray-500'}`}>
          <Package size={20} />
          <span className="text-xs mt-1">Pedidos</span>
        </Link>
        
        <Link to={`/rastrear-pedido`} className={`flex flex-col items-center ${location.pathname === '/rastrear-pedido' ? 'text-green-600' : 'text-gray-500'}`}>
          <MapPin size={20} />
          <span className="text-xs mt-1">Rastrear</span>
        </Link>
        
        <Link to={`/perfil`} className={`flex flex-col items-center ${location.pathname === '/perfil' ? 'text-green-600' : 'text-gray-500'}`}>
          <User size={20} />
          <span className="text-xs mt-1">Conta</span>
        </Link>
      </div>
    </div>
  );
}; 