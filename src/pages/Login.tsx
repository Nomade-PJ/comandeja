
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordSubmitting, setIsForgotPasswordSubmitting] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { login, requestPasswordReset } = useAuth();
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
        navigate('/dashboard');
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <h1 className="text-3xl font-bold text-[#4E3B8D]">ComandeJá</h1>
          </div>
          <p className="text-gray-500 mt-2">Faça login para acessar seu painel</p>
        </div>
        
        <Card>
          <CardHeader>
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
    </div>
  );
};

export default Login;
