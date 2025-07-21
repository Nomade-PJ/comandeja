import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, User, Mail, Lock, Phone } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { RegisterCustomerResponse } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface RegisterCustomerParams {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  restaurant_slug: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [loading, setLoading] = useState(false);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);
  const [currentRestaurantName, setCurrentRestaurantName] = useState<string | null>(null);
  const location = useLocation();
  const { signUp, signIn } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Obter o restaurante atual baseado na URL
  useEffect(() => {
    const fetchCurrentRestaurant = async () => {
      const pathSegments = location.pathname.split('/');
      const slug = pathSegments[1]; // Agora pegamos direto o primeiro segmento após a /
      
      if (slug) {
        try {
          const { data, error } = await supabase
            .from('restaurants')
            .select('id, name')
            .eq('slug', slug)
            .maybeSingle();
            
          if (error) {
            return;
          }
          
          if (data) {
            setCurrentRestaurantId(data.id);
            setCurrentRestaurantName(data.name);
          }
        } catch (error) {
          // Remover log de erro
        }
      }
    };
    
    fetchCurrentRestaurant();
  }, [location.pathname]);

  // Função para formatar o telefone
  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const phoneNumber = value.replace(/\D/g, '');
    
    // Aplica a formatação
    if (phoneNumber.length <= 2) {
      return `(${phoneNumber}`;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    } else if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    } else {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setRegisterPhone(formattedPhone);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        throw error;
      }
      
      // Não mostramos a mensagem de sucesso aqui, pois será mostrada após o redirecionamento
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Modifique a função handleRegister para usar o contexto de autenticação
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Verificar se estamos em uma página de restaurante
      if (!currentRestaurantId) {
        toast({
          title: "Erro no cadastro",
          description: "É necessário se cadastrar a partir de uma página de restaurante.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Usar o contexto de autenticação para registrar o usuário
      const { error } = await signUp(
        registerEmail, 
        registerPassword, 
        registerName, 
        'customer', 
        currentRestaurantId
      );

      if (error) {
        throw error;
      }
      
      // Atualizar o perfil com o telefone
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        // Atualizar o perfil com o telefone e garantir que o restaurante está registrado
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            phone: registerPhone,
            registered_restaurant_id: currentRestaurantId
          })
          .eq('id', userData.user.id);
          
        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          // Continuar mesmo com erro
        }
      }
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Conta criada para o restaurante ${currentRestaurantName}. Verifique seu e-mail para confirmar sua conta.`,
      });
      
      // Switch to login tab after successful registration
      setActiveTab('login');
      setLoginEmail(registerEmail);
      
      // Reset register form
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPhone('');
      setRegisterPassword('');
      
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Acesse sua conta</DialogTitle>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="pl-10"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Button type="button" variant="link" className="p-0 h-auto text-xs">
                    Esqueceu a senha?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            {currentRestaurantName && (
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Você está acessando o restaurante <span className="font-semibold">{currentRestaurantName}</span></p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="register-name" 
                    type="text" 
                    placeholder="Seu nome" 
                    className="pl-10"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="pl-10"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="register-phone" 
                    type="text" 
                    placeholder="(00) 00000-0000" 
                    className="pl-10"
                    value={registerPhone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="register-password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>

              {currentRestaurantName && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-center text-xs text-blue-700">
                    <span className="font-semibold">Importante:</span> Ao se cadastrar através de {currentRestaurantName}, você só poderá fazer pedidos neste restaurante específico.
                  </p>
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 