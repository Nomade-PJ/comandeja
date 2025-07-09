import React, { useEffect, useState } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardLoadingProps {
  title?: string;
}

export function DashboardLoading({ title = "Carregando dados..." }: DashboardLoadingProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simular progresso de carregamento
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + Math.random() * 10, 100);
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
            <h3 className="text-lg font-medium text-center">{title}</h3>
            <LoadingIndicator 
              variant="linear" 
              progress={progress} 
              showText 
              text={`${Math.round(progress)}% concluído`}
              className="w-full"
            />
            <div className="text-sm text-gray-500 text-center">
              Estamos preparando tudo para você. Isso levará apenas alguns segundos.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 