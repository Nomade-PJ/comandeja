import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardHeader = () => {
  const isMobile = useIsMobile();
  
  const handleNotificationClick = () => {
    // TODO: Implement notification panel
    console.log("Opening notifications");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className={`flex items-center justify-between ${isMobile ? 'px-0 -my-6' : 'px-6 py-4'}`}>
        <div className="flex items-center">
          {isMobile ? (
            <img 
              src="/logo.png" 
              alt="ComandaJá" 
              className="h-28 w-auto"
            />
          ) : (
            <SidebarTrigger className="text-gray-600 hover:text-brand-600" />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 min-w-[18px] h-[18px] flex items-center justify-center">
              3
            </Badge>
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
      </div>
      <div className="relative h-[2px] w-full">
        <div className="absolute left-0 right-0 h-full bg-gradient-to-r from-transparent via-brand-500 to-transparent bg-[length:200%_100%] animate-shimmer bg-shimmer-gradient"></div>
      </div>
    </header>
  );
};

export default DashboardHeader;
