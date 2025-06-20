import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Location } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Definir interface para o estado de localização
interface LocationState {
  from?: {
    pathname?: string;
    search?: string;
  };
  message?: string;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter o estado da localização
  const locationState = location.state as LocationState | null;

  // Verificar se o usuário já está autenticado e redirecionar com base no papel
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!user || isAuthLoading) return;

      // Verificar se estamos tentando acessar diretamente a página de perfil
      const fromProfile = locationState?.from?.pathname === '/perfil' && locationState?.from?.search?.includes('direct=true');
      
      // Se estamos tentando acessar diretamente a página de perfil, redirecionar para lá
      if (fromProfile) {
        navigate('/perfil?direct=true');
        return;
      }

      try {
        // Obter o papel (role) do usuário
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar perfil:', error);
          return;
        }

        // Verificar o tipo de usuário e redirecionar adequadamente
        const userRole = data?.role;
        
        if (userRole === 'customer') {
          // Se for cliente, verificar restaurante registrado nos metadados
          const registeredRestaurantId = user.user_metadata?.registered_restaurant_id;
          
          if (registeredRestaurantId) {
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('slug')
              .eq('id', registeredRestaurantId)
              .single();
              
            if (restaurant?.slug) {
              navigate(`/restaurante/${restaurant.slug}`);
              return;
            }
          }
          
          // Fallback para home se não encontrar restaurante
          navigate('/');
        } else {
          // Se for admin ou dono de restaurante, vai para o dashboard
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Erro ao verificar perfil:', err);
        // Em caso de erro, manda para o dashboard como fallback
        navigate('/dashboard');
      }
    };
    
    checkUserAndRedirect();
  }, [user, isAuthLoading, navigate, locationState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error("Erro ao fazer login: " + error.message);
      } else {
        toast.success("Login realizado com sucesso!");
        // O redirecionamento é gerenciado pelo useEffect
      }
    } catch (error) {
      toast.error("Erro inesperado ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-primary/30 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se o usuário já estiver autenticado, o useEffect acima irá redirecionar
  // Caso contrário, mostrar o formulário de login
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-brand-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CJ</span>
            </div>
            <span className="text-2xl font-bold gradient-text">ComandeJá</span>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
            <CardDescription>
              Entre na sua conta para acessar o dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700">
                  Esqueceu a senha?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <Separator className="my-6" />
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Ainda não tem uma conta?{" "}
                <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
