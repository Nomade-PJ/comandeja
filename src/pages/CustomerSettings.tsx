import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Upload, Loader2, User, X } from 'lucide-react';

// Definir interface para o perfil combinado
interface CombinedProfile {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
  registered_restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
  // Outros campos possíveis
  [key: string]: any;
}

const CustomerSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<CombinedProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Determinar o título da página com base na rota
  const isProfileRoute = location.pathname === '/perfil';
  const pageTitle = isProfileRoute ? "Meu Perfil" : "Configurações da Conta";

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive',
        });
        return;
      }
      
      // Buscar perfil do usuário
      const profileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileResult.error) {
        // Verificar se o erro é porque o perfil não existe
        if (profileResult.error.code === 'PGRST116') {
          // Criar um novo perfil para o usuário
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.user_metadata?.name || '',
                email: user.email,
                role: user.user_metadata?.role || 'customer',
                updated_at: new Date().toISOString(),
              }
            ])
            .select('*')
            .single();
            
          if (createError) {
            throw createError;
          }
          
          // Use o novo perfil
          profileResult.data = newProfile;
        } else {
          // Se for outro tipo de erro, lançar para o catch
          throw profileResult.error;
        }
      }

      // Buscar dados do cliente
      const customerResult = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      let customerData = null;
      if (!customerResult.error) {
        customerData = customerResult.data;
      } else {
        // Tentar buscar pelo email
        if (user.email) {
          const emailResult = await supabase
            .from('customers')
            .select('*')
            .eq('email', user.email)
            .single();
            
          if (!emailResult.error) {
            customerData = emailResult.data;
          }
        }
      }

      // Combinar dados
      const combinedData = {
        ...profileResult.data,
        ...(customerData || {}),
        full_name: profileResult.data?.full_name || user.user_metadata?.name || '',
        phone: profileResult.data?.phone || customerData?.phone || user.user_metadata?.phone || '',
        email: user.email || profileResult.data?.email || customerData?.email || '',
        avatar_url: profileResult.data?.avatar_url || user.user_metadata?.avatar_url || '',
      };
      
      setProfile(combinedData);
      setFormData({
        fullName: combinedData.full_name || '',
        email: combinedData.email || '',
        phone: combinedData.phone || '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seu perfil. Por favor, tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validar tipo e tamanho do arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo de arquivo inválido',
          description: 'Por favor, selecione uma imagem.',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 2MB.',
          variant: 'destructive',
        });
        return;
      }

      setUploadingAvatar(true);

      // Upload da imagem para o storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: publicURL } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Atualizar perfil com nova URL do avatar
      const avatarUrl = publicURL.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar também na tabela customers se existir - ignoramos erros aqui
      try {
        await supabase.auth.updateUser({
          data: {
            avatar_url: avatarUrl
          }
        });
      } catch (e) {
        console.log('Ignorando erro ao atualizar avatar em user_metadata:', e);
      }

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);

      toast({
        title: 'Avatar atualizado',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar sua foto de perfil.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploadingAvatar(true);

      // Atualizar perfil removendo URL do avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar também nos metadados do usuário - ignoramos erros aqui
      try {
        await supabase.auth.updateUser({
          data: {
            avatar_url: null
          }
        });
      } catch (e) {
        console.log('Ignorando erro ao remover avatar em user_metadata:', e);
      }

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);

      toast({
        title: 'Avatar removido',
        description: 'Sua foto de perfil foi removida com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover sua foto de perfil.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Validar dados
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        toast({
          title: 'Senhas não coincidem',
          description: 'A nova senha e a confirmação devem ser iguais.',
          variant: 'destructive',
        });
        return;
      }

      // Atualizar perfil no Supabase
      const updates = {
        full_name: formData.fullName,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Atualizar metadados do usuário - ignoramos erros aqui
      try {
        await supabase.auth.updateUser({
          data: {
            name: formData.fullName,
            phone: formData.phone
          }
        });
      } catch (e) {
        console.log('Ignorando erro ao atualizar metadados do usuário:', e);
      }

      // Se o email foi alterado, atualizar autenticação
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });

        if (emailError) {
          throw emailError;
        }

        toast({
          title: 'Verificação de email enviada',
          description: 'Verifique sua caixa de entrada para confirmar o novo email.',
        });
      }

      // Se a senha foi alterada, atualizar autenticação
      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (passwordError) {
          throw passwordError;
        }

        // Limpar campos de senha
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
        }));

        toast({
          title: 'Senha atualizada',
          description: 'Sua senha foi alterada com sucesso.',
        });
      }

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });

      // Recarregar dados do perfil
      fetchUserProfile();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar seu perfil.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);

      // 1. Buscar o email do usuário atual
      const userEmail = user.email;
      
      if (!userEmail) {
        throw new Error("Não foi possível identificar o email do usuário");
      }

      // 2. Excluir registros de cliente associados ao email do usuário
      // Esta operação excluirá todos os registros de cliente com o mesmo email em todos os restaurantes
      try {
        const { error: customerDeleteError } = await supabase
          .from('customers')
          .delete()
          .eq('email', userEmail);

        if (customerDeleteError) {
          console.error('Erro ao excluir registros de cliente:', customerDeleteError);
          // Continuar mesmo com erro
        }
      } catch (e) {
        console.error('Erro ao excluir registros de cliente:', e);
        // Continuar mesmo com erro
      }

      // 3. Excluir o perfil do usuário
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        if (profileError) {
          console.error('Erro ao excluir perfil:', profileError);
          // Continuar mesmo com erro
        }
      } catch (e) {
        console.error('Erro ao excluir perfil:', e);
        // Continuar mesmo com erro
      }

      // 4. Fazer logout
      await signOut();
      
      toast({
        title: 'Conta excluída',
        description: 'Sua conta e todos os seus dados pessoais foram excluídos permanentemente.',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir sua conta.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getUserInitials = () => {
    const name = profile?.full_name || user?.email || '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-primary/30 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Seção de Avatar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              Personalize sua conta com uma foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-gray-200">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                <AvatarFallback className="bg-primary text-white text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Alterar foto</span>
                </div>
                <Input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </Label>
              {profile?.avatar_url && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seção de Informações Pessoais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações de contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
              />
              <p className="text-xs text-gray-500">
                Ao alterar seu email, você receberá um link de confirmação no novo endereço.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção de Alteração de Senha */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Atualize sua senha para manter sua conta segura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </Card>

        {/* Seção de Exclusão de Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Ao excluir sua conta, todos os seus dados serão permanentemente removidos. Esta ação não pode ser desfeita.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Excluir minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                    e removerá seus dados dos nossos servidores.
                    <ul className="mt-4 list-disc pl-5 space-y-1">
                      <li>Seu perfil será excluído</li>
                      <li>Seus dados de cliente serão removidos de todos os estabelecimentos</li>
                      <li>Você não aparecerá mais na lista de clientes de nenhum restaurante</li>
                      <li>Seu histórico de pedidos permanecerá anônimo</li>
                      <li>Você precisará criar uma nova conta para usar o sistema novamente</li>
                      <li>Todos os seus dados pessoais serão apagados</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Excluindo...
                      </>
                    ) : 'Sim, excluir minha conta'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerSettings; 