import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Shield, Lock, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import supabase from '@/lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const { adminLogin, adminUser, refreshAdminSession } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Verificar se há uma sessão ativa
        if (adminUser) {
          // Obter a URL de retorno, se houver
          const from = location.state?.from?.pathname || "/admin/dashboard";
          navigate(from, { replace: true });
          return;
        }
        
        // Tentar recuperar sessão
        const recovered = await refreshAdminSession();
        if (recovered) {
          // Obter a URL de retorno, se houver
          const from = location.state?.from?.pathname || "/admin/dashboard";
          navigate(from, { replace: true });
          return;
        }
      } catch (e) {
        console.error("Erro ao verificar autenticação:", e);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuthentication();
  }, [adminUser, navigate, location.state, refreshAdminSession]);

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessPassword === 'josecarlos@24h') {
      setHasAccess(true);
    } else {
      toast({
        title: 'Acesso Negado',
        description: 'Senha de acesso incorreta.',
        variant: 'destructive',
      });
    }
  };

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
      const success = await adminLogin(email, password);
      
      if (success) {
        // Obter a URL de retorno, se houver
        const from = location.state?.from?.pathname || "/admin/dashboard";
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Verificando sessão...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center mb-2">
              <Lock className="h-10 w-10 text-primary mr-2" />
              <h1 className="text-3xl font-bold text-primary">Área Restrita</h1>
            </div>
            <p className="text-gray-500 mt-2">Digite a senha de acesso para continuar</p>
          </div>
          
          <Card>
            <form onSubmit={handleAccessSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="accessPassword">Senha de Acesso</Label>
                  <Input
                    id="accessPassword"
                    type="password"
                    placeholder="••••••••••"
                    value={accessPassword}
                    onChange={(e) => setAccessPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                >
                  Verificar Acesso
                </Button>
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
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <Shield className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-primary">ComandeJá Admin</h1>
          </div>
          <p className="text-gray-500 mt-2">Acesso ao painel administrativo</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login Administrativo</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email/Admin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
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

export default AdminLogin;
