
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LockKeyhole } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        // Navigate to the restaurant's subdomain dashboard
        const restaurantSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
        navigate(`/dashboard`);
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
        description: 'Por favor, informe seu email para redefinir a senha.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSendingReset(true);
    
    try {
      // In a real app, this would be an API call to PostgreSQL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Email enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      
      setForgotPasswordOpen(false);
    } catch (error) {
      console.error('Failed to send reset email', error);
      toast({
        title: 'Falha ao enviar email',
        description: 'Não foi possível enviar o email de redefinição. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <h1 className="text-3xl font-bold text-[#4E3B8D]">ComandeJá</h1>
          </div>
          <p className="text-gray-500 mt-2">Bem-vindo de volta! Entre na sua conta.</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Digite seu email e senha para acessar seu painel.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button 
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <Link to="/register" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center mt-8">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar para home
          </Link>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5" />
              Recuperar Senha
            </DialogTitle>
            <DialogDescription>
              Informe seu email para receber as instruções de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword}>
            <div className="space-y-4 py-2">
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
            </div>
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setForgotPasswordOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSendingReset}>
                {isSendingReset ? 'Enviando...' : 'Enviar Instruções'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
