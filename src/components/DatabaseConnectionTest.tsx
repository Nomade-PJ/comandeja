import React, { useState, useEffect } from "react";
import { testConnection } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderIcon, CheckCircle, XCircle } from "lucide-react";

/**
 * Componente que testa a conexão com o PostgreSQL
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
        timestamp: result.timestamp ? new Date(result.timestamp).toLocaleString() : undefined,
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
        <CardTitle>Status da Conexão com PostgreSQL</CardTitle>
        <CardDescription>Verifique se a conexão com o banco de dados está funcionando</CardDescription>
      </CardHeader>
      <CardContent>
        {status.success !== undefined && (
          <Alert variant={status.success ? "default" : "destructive"} className="mb-4">
            {status.success ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            <AlertTitle>{status.success ? "Conexão estabelecida" : "Falha na conexão"}</AlertTitle>
            <AlertDescription>
              {status.message}
              {status.timestamp && (
                <div className="mt-2 text-sm">
                  Horário do servidor: {status.timestamp}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runConnectionTest} disabled={status.testing}>
          {status.testing && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
          {status.testing ? "Testando..." : "Testar conexão"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseConnectionTest; 