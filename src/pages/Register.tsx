
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

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !restaurantName) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const restaurantSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const success = await register(name, email, password, restaurantName);
      
      if (success) {
        toast({
          title: 'Cadastro realizado com sucesso!',
          description: `Seu estabelecimento foi criado em comandeja.com/${restaurantSlug}`,
        });
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRestaurantName(value);
  };

  // Generate slug preview
  const getSlugPreview = () => {
    if (!restaurantName) return '';
    return restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <h1 className="text-3xl font-bold text-[#4E3B8D]">ComandeJá</h1>
          </div>
          <p className="text-gray-500 mt-2">Crie sua conta e comece a receber pedidos online</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">Nome do estabelecimento</Label>
                <Input
                  id="restaurant-name"
                  value={restaurantName}
                  onChange={handleRestaurantNameChange}
                  placeholder="Nome do seu restaurante ou estabelecimento"
                  required
                />
              </div>

              {restaurantName && (
                <div className="bg-muted px-3 py-2 rounded-md text-sm">
                  <span className="text-muted-foreground">Seu estabelecimento estará disponível em: </span>
                  <span className="font-medium">comandeja.com/{getSlugPreview()}</span>
                </div>
              )}
              
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
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? 'Cadastrando...' : 'Criar conta'}
              </Button>
              <p className="text-sm text-center text-gray-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Faça login
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

export default Register;
