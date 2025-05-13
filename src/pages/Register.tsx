import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter no mínimo 2 caracteres.',
  }),
  restaurantName: z.string().min(2, {
    message: 'Nome do estabelecimento deve ter no mínimo 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Email inválido.',
  }),
  password: z.string().min(6, {
    message: 'Senha deve ter no mínimo 6 caracteres.',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem.',
  path: ['confirmPassword'],
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [slug, setSlug] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      restaurantName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Gera o slug baseado no nome do restaurante
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Atualiza o slug quando o nome do restaurante é alterado
  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('restaurantName', value);
    setSlug(generateSlug(value));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('📝 Iniciando processo de registro:', { 
      name: values.name, 
      email: values.email, 
      restaurantName: values.restaurantName 
    });
    
    try {
      const success = await register(
        values.name,
        values.email,
        values.password,
        values.restaurantName
      );

      if (success) {
        console.log('✅ Registro realizado com sucesso, redirecionando para o dashboard');
        navigate('/dashboard');
      } else {
        console.log('❌ Falha no registro');
        // Mensagem de erro já exibida pelo AuthContext
      }
    } catch (error) {
      console.error('❌ Erro durante o registro:', error);
      toast({
        title: "Erro no registro",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">ComandeJá</h1>
          <p className="text-muted-foreground mt-2">
            Crie sua conta e comece a receber pedidos online
          </p>
        </div>

        <div className="bg-card border rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2">Cadastro</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Preencha os dados abaixo para criar sua conta
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Seu nome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="restaurantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do estabelecimento</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Nome do seu restaurante"
                        onChange={handleRestaurantNameChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {slug && (
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                  Seu estabelecimento estará disponível em:
                  <div className="font-medium mt-1">comandeja.com/{slug}</div>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="seu@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
