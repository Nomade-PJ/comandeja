import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title = "Carregando..." }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col pb-16 md:pb-0 overflow-x-hidden">
          <DashboardHeader />
          <div className="flex-1 p-4 md:p-6">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
} 