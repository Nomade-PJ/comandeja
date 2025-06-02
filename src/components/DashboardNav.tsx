import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/contexts/RestaurantContext";
import supabase from "@/lib/supabase";
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
  BarChartIcon,
  SettingsIcon,
  MessageSquareHeartIcon,
  TicketIcon,
  DatabaseIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardNav() {
  const location = useLocation();
  const { logout } = useAuth();
  const { restaurant } = useRestaurant();

  // Se não houver restaurante, não exibir a navegação
  if (!restaurant) return null;

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      title: "Pedidos",
      href: "/orders",
      icon: <ShoppingBagIcon className="h-5 w-5" />,
    },
    {
      title: "Produtos",
      href: "/products",
      icon: <TagIcon className="h-5 w-5" />,
    },
    {
      title: "Clientes",
      href: "/customers",
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      title: "Cupons",
      href: "/coupons",
      icon: <TicketIcon className="h-5 w-5" />,
    },
    {
      title: "Avaliações",
      href: "/reviews",
      icon: <MessageSquareHeartIcon className="h-5 w-5" />,
    },
    {
      title: "Relatórios",
      href: "/reports",
      icon: <BarChartIcon className="h-5 w-5" />,
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => (
        <Link to={item.href} key={item.href}>
          <Button
            variant={isActive(item.href) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isActive(item.href) ? "bg-primary text-primary-foreground" : ""
            )}
          >
            {item.icon}
            {item.title}
          </Button>
        </Link>
      ))}

      <Button 
        onClick={() => {
          // Definir explicitamente que isso é um logout
          sessionStorage.setItem('explicit_logout', 'true');
          
          // Limpar todos os dados de sessão
          localStorage.clear();
          sessionStorage.clear();
          
          // Limpar todos os cookies
          document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.trim().split('=');
            if (name) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; samesite=lax`;
            }
          });
          
          // Executar o logout no Supabase e no contexto
          supabase.auth.signOut({ scope: 'global' }).then(() => {
            logout();
            window.location.href = '/login';
          });
        }} 
        variant="ghost" 
        className="w-full justify-start gap-2 mt-4 text-red-500 hover:text-red-600 hover:bg-red-100"
      >
        Sair
      </Button>
    </nav>
  );
} 