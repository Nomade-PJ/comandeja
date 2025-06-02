import { useState, useEffect } from 'react';
import { testConnection } from '@/lib/supabase';
import { SUPABASE_CONFIG, getApiUrl } from '@/lib/env';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export function DbInfo() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    timestamp?: string;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    try {
      // Primeiro, tenta usar o endpoint da API
      try {
        const apiUrl = `${getApiUrl()}/api/status`;
        console.log('Testando conexão via API:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Erro de API: ${response.status}`);
        }
        
        const data = await response.json();
        setConnectionStatus(data);
        console.log('Resultado do teste via API:', data);
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Falha ao testar via API, tentando método direto:', apiError);
      }
      
      // Se falhar, tenta o método direto
      const status = await testConnection();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Erro ao testar conexão: ${(error as Error).message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Status da Conexão Supabase</span>
          {connectionStatus && (
            <Badge variant={connectionStatus.success ? "default" : "destructive"} className={connectionStatus.success ? "bg-green-100 text-green-800" : ""}>
              {connectionStatus.success ? "Conectado" : "Desconectado"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Informações sobre a conexão com o Supabase
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Status da Conexão</h3>
            <div className="flex items-center gap-2 text-sm">
              {connectionStatus ? (
                connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )
              ) : (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
              <span>{connectionStatus?.message || "Verificando conexão..."}</span>
            </div>
            
            {connectionStatus?.timestamp && (
              <p className="text-xs text-muted-foreground mt-1">
                Verificado em: {new Date(connectionStatus.timestamp).toLocaleString()}
              </p>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-1">Configuração</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">URL:</span>
              <span>{SUPABASE_CONFIG.url}</span>
              
              <span className="text-muted-foreground">Chave Anônima:</span>
              <span>{SUPABASE_CONFIG.anonKey ? '********' : 'Não configurada'}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
} 