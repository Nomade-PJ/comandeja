import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Heart, ShoppingBag, Package, MapPin } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { user, signOut, isRestaurantOwner, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [registeredRestaurantSlug, setRegisteredRestaurantSlug] = useState<string | null>(null);

  useEffect(() => {
    // Ensure we have the user role available
    if (user && user.user_metadata?.role) {
      setUserRole(user.user_metadata.role);
    }
    
    // Verificar se o usuário é cliente e tem um restaurante registrado
    const checkRegisteredRestaurant = async () => {
      if (!user || user.user_metadata?.role !== 'customer') return;
      
      try {
        // Primeiro verificar nos metadados do usuário
        let registeredRestaurantId = user.user_metadata?.registered_restaurant_id;
        
        // Se não encontrar nos metadados, verificar no perfil
        if (!registeredRestaurantId) {
          const { data, error } = await supabase
            .from('profiles')
            .select('registered_restaurant_id')
            .eq('id', user.id)
            .single();
            
          if (!error && data && data.registered_restaurant_id) {
            registeredRestaurantId = data.registered_restaurant_id;
          }
        }
        
        // Se encontrou um restaurante registrado, buscar o slug
        if (registeredRestaurantId) {
          const { data, error } = await supabase
            .from('restaurants')
            .select('slug')
            .eq('id', registeredRestaurantId)
            .single();
            
          if (!error && data) {
            setRegisteredRestaurantSlug(data.slug);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar restaurante registrado:', error);
      }
    };
    
    checkRegisteredRestaurant();
  }, [user]);

  if (!user) {
    return null;
  }

  // Obter as iniciais do nome do usuário para o fallback do avatar
  const getUserInitials = () => {
    const name = user.user_metadata?.name || user.email || '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileClick = () => {
    // Check role from state first, then from functions, then from metadata directly
    const role = userRole || 
                (isRestaurantOwner() ? 'restaurant_owner' : 
                 isCustomer() ? 'customer' : 
                 user.user_metadata?.role || null);
    
    if (role === 'restaurant_owner') {
      navigate('/configuracoes');
    } else if (role === 'customer') {
      // Se for cliente e tiver um restaurante registrado, redirecionar para lá
      if (registeredRestaurantSlug) {
        navigate(`/${registeredRestaurantSlug}`);
      } else {
        navigate('/cliente/perfil');
      }
    } else {
      // Fallback to default profile page
      toast({
        title: "Redirecionando",
        description: "Você está sendo redirecionado para a página de perfil",
      });
      navigate('/cliente/perfil');
    }
  };
  
  const handleOrdersClick = () => {
    navigate('/meus-pedidos');
  };
  
  const handleTrackingClick = () => {
    navigate('/rastrear-pedido');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`rounded-full flex items-center focus:outline-none ${className}`}>
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || 'User'} />
            <AvatarFallback className="bg-primary text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user.user_metadata?.name || 'Usuário'}</span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
            {registeredRestaurantSlug && (
              <span className="text-xs text-primary mt-1">Restaurante vinculado</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick} className="flex items-center cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>{isCustomer() && registeredRestaurantSlug ? 'Meu Restaurante' : 'Meu Perfil'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOrdersClick} className="flex items-center cursor-pointer">
          <Package className="mr-2 h-4 w-4" />
          <span>Pedidos</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTrackingClick} className="flex items-center cursor-pointer">
          <MapPin className="mr-2 h-4 w-4" />
          <span>Rastrear</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 