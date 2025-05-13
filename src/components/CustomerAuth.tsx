
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerAuthProps {
  restaurantSlug: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const CustomerAuth: React.FC<CustomerAuthProps> = ({ 
  restaurantSlug, 
  trigger, 
  onSuccess 
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  
  const { customerLogin, registerCustomer } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoginSubmitting(true);
    
    try {
      console.log(`Attempting customer login for restaurant: ${restaurantSlug}`);
      const success = await customerLogin(loginEmail, loginPassword, restaurantSlug);
      
      if (success) {
        setOpen(false);
        toast({
          title: 'Login realizado',
          description: 'Bem-vindo de volta!',
        });
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsLoginSubmitting(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsRegisterSubmitting(true);
    
    try {
      console.log(`Attempting customer registration for restaurant: ${restaurantSlug}`);
      const success = await registerCustomer(
        registerName, 
        registerEmail, 
        registerPhone, 
        registerPassword,
        restaurantSlug
      );
      
      if (success) {
        setOpen(false);
        toast({
          title: 'Cadastro realizado',
          description: 'Bem-vindo ao ComandeJá!',
        });
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsRegisterSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Entrar / Cadastrar</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Sua conta</DialogTitle>
          <DialogDescription className="text-center">
            Entre ou crie uma conta para continuar
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoginSubmitting}
              >
                {isLoginSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
              
              <div className="text-center text-sm mt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-primary hover:underline"
                >
                  Não tem uma conta? Cadastre-se
                </button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome completo *</Label>
                <Input
                  id="register-name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email">Email *</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-phone">Telefone *</Label>
                <Input
                  id="register-phone"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha *</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirmar senha *</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isRegisterSubmitting}
              >
                {isRegisterSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
              
              <div className="text-center text-sm mt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-primary hover:underline"
                >
                  Já tem uma conta? Faça login
                </button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAuth;
