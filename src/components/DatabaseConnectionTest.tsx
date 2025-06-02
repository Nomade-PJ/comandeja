
import React, { useState, useEffect } from "react";
import { testConnection } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { LoaderIcon, CheckCircle, XCircle, RefreshCw } from "lucide-react"; // Import all needed icons

/**
 * Componente que testa a conexão com o Supabase
 */
const DatabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
    timestamp?: string;
  }>({ testing: false });

  const runConnectionTest = async () => {
    setStatus({ testing: true });
    try {
      const result = await testConnection();
      setStatus({
        testing: false,
        success: result.success,
        message: result.message,
        timestamp: result.timestamp,
      });
    } catch (error) {
      setStatus({
        testing: false,
        success: false,
        message: `Erro não tratado: ${(error as Error).message}`,
      });
    }
  };

  useEffect(() => {
    // Executar o teste quando o componente for montado
    runConnectionTest();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Status da Conexão com Supabase</span>
          {status.success !== undefined && (
            <Badge variant={status.success ? "default" : "destructive"} className={status.success ? "bg-green-100 text-green-800" : ""}>
              {status.success ? "Conectado" : "Desconectado"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Verifique se a conexão com o Supabase está funcionando
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Status da Conexão</h3>
            <div className="flex items-center gap-2 text-sm">
              {status.success !== undefined ? (
                status.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )
              ) : (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              )}
              <span>{status.message || "Verificando conexão..."}</span>
            </div>
            
            {status.timestamp && (
              <p className="text-xs text-muted-foreground mt-1">
                Verificado em: {new Date(status.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runConnectionTest} 
          disabled={status.testing}
          className="w-full"
        >
          {status.testing ? (
            <>
              <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Conexão
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseConnectionTest;
