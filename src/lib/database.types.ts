
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          phone: string | null
          address: string | null
          opening_hours: string | null
          logo_url: string | null
          banner_url: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          phone?: string | null
          address?: string | null
          opening_hours?: string | null
          logo_url?: string | null
          banner_url?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          description?: string | null
          phone?: string | null
          address?: string | null
          opening_hours?: string | null
          logo_url?: string | null
          banner_url?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      products: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          has_variations: boolean
          preparation_time: number | null
          created_at: string
          updated_at: string
          available: boolean
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          has_variations?: boolean
          preparation_time?: number | null
          created_at?: string
          updated_at?: string
          available?: boolean
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          has_variations?: boolean
          preparation_time?: number | null
          created_at?: string
          updated_at?: string
          available?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          image_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          customer_id: string
          order_number: string
          status: string
          subtotal: number
          delivery_fee: number
          discount: number
          total: number
          payment_method: string
          payment_status: string
          delivery_method: string
          delivery_address: string | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          estimated_delivery_time: string | null
          delivery_driver_id: string | null
          notes: string | null
          scheduled_for: string | null
          created_at: string
          updated_at: string
          customer_name: string
          customer_phone: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_id: string
          order_number: string
          status: string
          subtotal: number
          delivery_fee: number
          discount: number
          total: number
          payment_method: string
          payment_status: string
          delivery_method: string
          delivery_address?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          estimated_delivery_time?: string | null
          delivery_driver_id?: string | null
          notes?: string | null
          scheduled_for?: string | null
          created_at?: string
          updated_at?: string
          customer_name: string
          customer_phone: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          customer_id?: string
          order_number?: string
          status?: string
          subtotal?: number
          delivery_fee?: number
          discount?: number
          total?: number
          payment_method?: string
          payment_status?: string
          delivery_method?: string
          delivery_address?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          estimated_delivery_time?: string | null
          delivery_driver_id?: string | null
          notes?: string | null
          scheduled_for?: string | null
          created_at?: string
          updated_at?: string
          customer_name?: string
          customer_phone?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variation_id: string | null
          name: string
          quantity: number
          unit_price: number
          subtotal: number
          notes: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variation_id?: string | null
          name: string
          quantity: number
          unit_price: number
          subtotal: number
          notes?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variation_id?: string | null
          name?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          notes?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          last_login: string | null
          is_active: boolean
          restaurant_id: string | null
          restaurant_slug: string | null
          role: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          last_login?: string | null
          is_active?: boolean
          restaurant_id?: string | null
          restaurant_slug?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          last_login?: string | null
          is_active?: boolean
          restaurant_id?: string | null
          restaurant_slug?: string | null
          role?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
