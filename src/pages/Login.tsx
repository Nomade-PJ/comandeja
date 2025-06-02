import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import supabase from '@/lib/supabase';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

// Constante para o cookie de autenticação
const AUTH_TOKEN_COOKIE = 'comandeja_auth_token';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordSubmitting, setIsForgotPasswordSubmitting] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const { login, requestPasswordReset, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Verificar se há uma sessão ativa
        const { data } = await supabase.auth.getSession();
        const hasCookies = !!Cookies.get(AUTH_TOKEN_COOKIE);
        
        // Se o usuário já estiver autenticado, redirecionar para o dashboard
        if (data.session && data.session.user) {
          // Obter a URL de retorno, se houver
          const from = location.state?.from?.pathname || "/dashboard";
          navigate(from, { replace: true });
        }
      } catch (e) {
        console.error("Erro ao verificar autenticação:", e);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuthentication();
  }, [navigate, user, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Obter a URL de retorno, se houver
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe seu email.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsForgotPasswordSubmitting(true);
    
    try {
      const success = await requestPasswordReset(forgotPasswordEmail);
      
      if (success) {
        setResetEmailSent(true);
      }
    } finally {
      setIsForgotPasswordSubmitting(false);
    }
  };

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Limpar todos os dados de sessão
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpar cookies
    const allCookies = document.cookie.split(';');
    for (const cookie of allCookies) {
      const [name] = cookie.trim().split('=');
      if (name) {
        Cookies.remove(name, { path: '/' });
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    }
    
    // Fazer logout no Supabase
    supabase.auth.signOut();
    
    // Navegar para a página inicial
    navigate('/');
  };
  
  // Exibir uma tela de carregamento enquanto verifica a autenticação
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-0">
      <div className="w-full max-w-md">
        <div className="text-center -mb-4">
          <img src="/images/logo.png" alt="ComandeJá" className="h-52 mx-auto -mb-4" />
        </div>
        
        <Card className="mt-0">
          <CardHeader className="pb-2 pt-3">
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com seu email e senha para acessar o painel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Dialog open={forgotPasswordDialogOpen} onOpenChange={setForgotPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <button 
                        type="button"
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setForgotPasswordEmail(email || '');
                          setResetEmailSent(false);
                        }}
                      >
                        Esqueceu a senha?
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Recuperar senha</DialogTitle>
                        <DialogDescription>
                          {!resetEmailSent ? (
                            'Informe seu email para receber as instruções de recuperação de senha.'
                          ) : (
                            'Enviamos as instruções para recuperação de senha. Verifique seu email.'
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {!resetEmailSent ? (
                        <form onSubmit={handleForgotPassword} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              placeholder="seu@email.com"
                              required
                            />
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={isForgotPasswordSubmitting}
                              className="w-full"
                            >
                              {isForgotPasswordSubmitting ? 'Enviando...' : 'Enviar instruções'}
                            </Button>
                          </DialogFooter>
                        </form>
                      ) : (
                        <DialogFooter className="pt-4">
                          <Button 
                            className="w-full" 
                            onClick={() => setForgotPasswordDialogOpen(false)}
                          >
                            Fechar
                          </Button>
                        </DialogFooter>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
              <p className="text-sm text-center text-gray-500">
                Não tem uma conta?{' '}
                <Link to="/plans" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center mt-8">
          <a 
            href="#" 
            onClick={handleBackToHome}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Voltar para home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
