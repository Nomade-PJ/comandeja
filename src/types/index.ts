import { User } from "@supabase/supabase-js";

export interface UserProfile extends User {
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'restaurant_owner' | 'customer';
  avatar_url?: string;
  registered_restaurant_id?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  restaurant_id: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  logo_url?: string;
  banner_url?: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  restaurant_id: string;
  display_order?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  preparation_time: number;
  category_id?: string;
  restaurant_id: string;
  display_order?: number;
}