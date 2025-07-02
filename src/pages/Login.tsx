import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Location } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Lock, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSecurity } from "@/hooks/useSecurity";

// Definir interface para o estado de localização
interface LocationState {
  from?: {
    pathname?: string;
    search?: string;
  };
  message?: string;
}

// Interface para o formulário de login
interface LoginFormValues {
  email: string;
  password: string;
}

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { csrfToken } = useSecurity();
  
  // Configurar o formulário com validação Zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  
  // Obter o estado da localização
  const locationState = location.state as LocationState | null;

  // Verificar se o usuário já está autenticado e redirecionar com base no papel
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      console.log("checkUserAndRedirect - Iniciando verificação", { user, isAuthLoading });
      if (!user || isAuthLoading) return;

      // Verificar se estamos tentando acessar diretamente a página de perfil
      const fromProfile = locationState?.from?.pathname === '/perfil' && locationState?.from?.search?.includes('direct=true');
      console.log("checkUserAndRedirect - Estado da localização:", { locationState, fromProfile });
      
      // Se estamos tentando acessar diretamente a página de perfil, redirecionar para lá
      if (fromProfile) {
        navigate('/perfil?direct=true');
        return;
      }

      try {
        console.log("checkUserAndRedirect - Buscando perfil para o usuário:", user.id);
        // Obter o papel (role) do usuário
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar perfil:', error);
          
          // Se houver erro ao buscar o perfil, verificar se há informações de papel nos metadados do usuário
          console.log("checkUserAndRedirect - Verificando papel nos metadados do usuário");
          const userRole = user.user_metadata?.role || 'customer';
          console.log("checkUserAndRedirect - Papel encontrado nos metadados:", userRole);
          
          // Usar o papel encontrado nos metadados para determinar o redirecionamento
          if (userRole === 'customer') {
            // Redirecionamento para cliente
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
            navigate('/');
          } else {
            // Para admin ou restaurant_owner, redirecionar para o dashboard
            navigate('/dashboard');
          }
          return;
        }

        console.log("checkUserAndRedirect - Dados do perfil:", data);
        // Verificar o tipo de usuário e redirecionar adequadamente
        const userRole = data?.role;
        console.log("checkUserAndRedirect - Papel do usuário:", userRole);
        
        if (userRole === 'customer') {
          // Se for cliente, verificar restaurante registrado nos metadados
          const registeredRestaurantId = user.user_metadata?.registered_restaurant_id;
          console.log("checkUserAndRedirect - ID do restaurante registrado:", registeredRestaurantId);
          
          if (registeredRestaurantId) {
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('slug')
              .eq('id', registeredRestaurantId)
              .single();
              
            console.log("checkUserAndRedirect - Dados do restaurante:", restaurant);
            if (restaurant?.slug) {
              console.log(`checkUserAndRedirect - Redirecionando para /restaurante/${restaurant.slug}`);
              navigate(`/restaurante/${restaurant.slug}`);
              return;
            }
          }
          
          // Fallback para home se não encontrar restaurante
          console.log("checkUserAndRedirect - Redirecionando para home (/)");
          navigate('/');
        } else {
          // Se for admin ou dono de restaurante, vai para o dashboard
          console.log("checkUserAndRedirect - Redirecionando para o dashboard");
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Erro ao verificar perfil:', err);
        // Em caso de erro, manda para o dashboard como fallback
        console.log("checkUserAndRedirect - Erro, redirecionando para o dashboard");
        navigate('/dashboard');
      }
    };
    
    checkUserAndRedirect();
  }, [user, isAuthLoading, navigate, locationState]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Não é mais necessário aplicar applyCSRFToFormData, apenas garantir que o campo _csrf está no form
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        // Tratar erros específicos do Supabase
        if (error.message.includes('Invalid login credentials')) {
          form.setError('root', { 
            message: 'Email ou senha incorretos'
          });
        } else if (error.message.includes('Email not confirmed')) {
          form.setError('email', { 
            message: 'Email não confirmado. Verifique sua caixa de entrada.'
          });
        } else {
          toast.error("Erro ao fazer login: " + error.message);
        }
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Campo oculto para o token CSRF */}
                <input type="hidden" name="_csrf" value={csrfToken} />
                
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <ShieldCheck className="h-3 w-3 mr-1 text-brand-500" />
                  <span>Conexão segura</span>
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            autoComplete="email"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Senha</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            autoComplete="current-password"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700">
                    Esqueceu a senha?
                  </Link>
                </div>
                
                <Alert variant="destructive" className={form.formState.errors.root ? "block" : "hidden"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {form.formState.errors.root?.message}
                  </AlertDescription>
                </Alert>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
            
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
