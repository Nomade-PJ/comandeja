import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BarChart3, 
  Settings, 
  Store, 
  Users, 
  ClipboardList,
  TrendingUp,
  Star,
  LogOut,
  User,
  FolderOpen
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";

const menuItems = [
  {
    title: "Visão Geral",
    url: "/painel",
    icon: BarChart3,
  },
  {
    title: "Pedidos",
    url: "/pedidos",
    icon: ClipboardList,
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: Store,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: TrendingUp,
  },
  {
    title: "Avaliações",
    url: "/avaliacoes",
    icon: Star,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { restaurant } = useRestaurant();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Obter as iniciais do nome do restaurante para o Avatar
  const getRestaurantInitials = () => {
    if (!restaurant?.name) return "R";
    
    const words = restaurant.name.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader className="border-b-0">
        <div className="flex flex-col items-center p-0 -mt-12">
          <img 
            src="/logo.png" 
            alt="ComandaJá" 
            className="h-40 w-auto"
          />
          <div className="w-full relative">
            <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent -mt-2 bg-[length:200%_100%] animate-shimmer bg-shimmer-gradient"></div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-medium px-3 py-2">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-brand-50 hover:text-brand-700 data-[active=true]:bg-brand-100 data-[active=true]:text-brand-700 py-3"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={restaurant?.logo_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-brand-100 text-brand-700">
                      {getRestaurantInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-base font-medium">{restaurant?.name || "Meu Restaurante"}</span>
                    <span className="text-sm text-muted-foreground">{user?.email || "sem email"}</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-base">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="py-2 text-base">
                <User className="mr-2 h-5 w-5" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="py-2 text-base">
                <Settings className="mr-2 h-5 w-5" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 py-2 text-base" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
