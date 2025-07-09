import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Store, 
  ClipboardList, 
  Menu, 
  Plus,
  Users,
  TrendingUp,
  Star,
  Settings
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainNavItems = [
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
];

const moreMenuItems = [
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

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white py-2 px-4 md:hidden">
      <nav className="flex items-center justify-between">
        {mainNavItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center gap-1 text-muted-foreground",
              location.pathname === item.url && "text-brand-600"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-full border-2 border-brand-600"
            >
              <Plus className="h-6 w-6 text-brand-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <div className="grid gap-4 py-4">
              <div className="grid gap-4">
                {moreMenuItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      location.pathname === item.url && "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <Menu className="h-6 w-6" />
          <span className="text-xs">Menu</span>
        </button>
      </nav>
    </div>
  );
} 