import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, Lock, User, Store, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSecurity } from "@/hooks/useSecurity";

// Interface para o formulário de registro
interface RegisterFormValues {
  name: string;
  email: string;
  restaurantName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { csrfToken } = useSecurity();

  // Configurar o formulário com validação Zod
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      restaurantName: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    }
  });

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (user && !isAuthLoading) {
      navigate("/dashboard");
    }
  }, [user, isAuthLoading, navigate]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await signUp(data.email, data.password, data.name, 'restaurant_owner');
      
      if (error) {
        console.error('Signup error:', error);
        toast.error("Erro ao criar conta: " + error.message);
        
        // Tratar erros específicos do Supabase
        if (error.message.includes('email')) {
          form.setError("email", { 
            message: "Este email já está em uso ou é inválido" 
          });
        }
      } else {
        console.log('Account created successfully');
        toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
        navigate("/login");
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("Erro inesperado ao criar conta");
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
            <CardTitle className="text-2xl">Crie sua conta</CardTitle>
            <CardDescription>
              Comece seu teste grátis de 15 dias agora mesmo
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
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Nome completo</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Seu nome"
                            className="pl-10"
                            autoComplete="name"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Nome do restaurante</FormLabel>
                      <div className="relative">
                        <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nome do seu restaurante"
                            className="pl-10"
                            autoComplete="organization"
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
                            autoComplete="new-password"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Confirmar senha</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            autoComplete="new-password"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="text-sm">
                        Aceito os{" "}
                        <Link to="/terms" className="text-brand-600 hover:text-brand-700">
                          termos de uso
                        </Link>{" "}
                        e{" "}
                        <Link to="/privacy" className="text-brand-600 hover:text-brand-700">
                          política de privacidade
                        </Link>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  {isLoading ? "Criando conta..." : "Criar conta grátis"}
                </Button>
              </form>
            </Form>
            
            <Separator className="my-6" />
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
