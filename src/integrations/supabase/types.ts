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
      banners: {
        Row: {
          id: string;
          restaurant_id: string;
          title: string;
          description: string | null;
          image_url: string;
          link_url: string | null;
          coupon_code: string | null;
          discount_value: number | null;
          start_date: string;
          end_date: string;
          is_active: boolean | null;
          display_order: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          title: string;
          description?: string | null;
          image_url: string;
          link_url?: string | null;
          coupon_code?: string | null;
          discount_value?: number | null;
          start_date: string;
          end_date: string;
          is_active?: boolean | null;
          display_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string;
          link_url?: string | null;
          coupon_code?: string | null;
          discount_value?: number | null;
          start_date?: string;
          end_date?: string;
          is_active?: boolean | null;
          display_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          product_id: string
          product_name: string
          price: number
          quantity: number
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          product_id: string
          product_name: string
          price: number
          quantity: number
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          product_id?: string
          product_name?: string
          price?: number
          quantity?: number
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string | null
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          minimum_order_value: number | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_order_value?: number | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_order_value?: number | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          last_order_at: string | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          restaurant_id: string | null
          state: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
          zip_code: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_order_at?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          restaurant_id?: string | null
          state?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          zip_code?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_order_at?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          restaurant_id?: string | null
          state?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          zip_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      dashboard_statistics: {
        Row: {
          average_order_value: number | null
          created_at: string | null
          date: string
          id: string
          restaurant_id: string | null
          total_customers: number | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          average_order_value?: number | null
          created_at?: string | null
          date: string
          id?: string
          restaurant_id?: string | null
          total_customers?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          average_order_value?: number | null
          created_at?: string | null
          date?: string
          id?: string
          restaurant_id?: string | null
          total_customers?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_statistics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_fee: number | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          delivery_state: string | null
          delivery_zip_code: string | null
          discount_amount: number | null
          estimated_delivery_time: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          restaurant_id: string | null
          scheduled_delivery_at: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_fee?: number | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          delivery_state?: string | null
          delivery_zip_code?: string | null
          discount_amount?: number | null
          estimated_delivery_time?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          restaurant_id?: string | null
          scheduled_delivery_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_fee?: number | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          delivery_state?: string | null
          delivery_zip_code?: string | null
          discount_amount?: number | null
          estimated_delivery_time?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          restaurant_id?: string | null
          scheduled_delivery_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_values: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_default: boolean | null
          name: string
          option_id: string | null
          price_adjustment: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_default?: boolean | null
          name: string
          option_id?: string | null
          price_adjustment?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_default?: boolean | null
          name?: string
          option_id?: string | null
          price_adjustment?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_required: boolean | null
          max_selections: number | null
          min_selections: number | null
          name: string
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name: string
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name?: string
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          preparation_time: number | null
          price: number
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          preparation_time?: number | null
          price: number
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          registered_restaurant_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          registered_restaurant_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          registered_restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_registered_restaurant_id_fkey"
            columns: ["registered_restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      restaurant_pages: {
        Row: {
          created_at: string | null
          custom_css: string | null
          custom_js: string | null
          description: string | null
          footer_html: string | null
          header_html: string | null
          id: string
          is_published: boolean | null
          meta_tags: Json | null
          restaurant_id: string
          theme_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_css?: string | null
          custom_js?: string | null
          description?: string | null
          footer_html?: string | null
          header_html?: string | null
          id?: string
          is_published?: boolean | null
          meta_tags?: Json | null
          restaurant_id: string
          theme_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_css?: string | null
          custom_js?: string | null
          description?: string | null
          footer_html?: string | null
          header_html?: string | null
          id?: string
          is_published?: boolean | null
          meta_tags?: Json | null
          restaurant_id?: string
          theme_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_pages_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          accepted_payment_methods: string[] | null
          accepts_orders: boolean | null
          created_at: string | null
          delivery_fee: number | null
          delivery_radius: number | null
          estimated_delivery_time: number | null
          id: string
          minimum_order_value: number | null
          notification_settings: Json | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_payment_methods?: string[] | null
          accepts_orders?: boolean | null
          created_at?: string | null
          delivery_fee?: number | null
          delivery_radius?: number | null
          estimated_delivery_time?: number | null
          id?: string
          minimum_order_value?: number | null
          notification_settings?: Json | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_payment_methods?: string[] | null
          accepts_orders?: boolean | null
          created_at?: string | null
          delivery_fee?: number | null
          delivery_radius?: number | null
          estimated_delivery_time?: number | null
          id?: string
          minimum_order_value?: number | null
          notification_settings?: Json | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_themes: {
        Row: {
          accent_color: string | null
          background_color: string | null
          banner_style: string | null
          created_at: string | null
          custom_css: string | null
          font_family: string | null
          id: string
          logo_position: string | null
          primary_color: string | null
          restaurant_id: string | null
          secondary_color: string | null
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          banner_style?: string | null
          created_at?: string | null
          custom_css?: string | null
          font_family?: string | null
          id?: string
          logo_position?: string | null
          primary_color?: string | null
          restaurant_id?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          banner_style?: string | null
          created_at?: string | null
          custom_css?: string | null
          font_family?: string | null
          id?: string
          logo_position?: string | null
          primary_color?: string | null
          restaurant_id?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_themes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          banner_url: string | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          owner_id: string | null
          phone: string | null
          slug: string
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          slug: string
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          slug?: string
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          order_id: string | null
          rating: number | null
          responded_at: string | null
          response: string | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_id?: string | null
          rating?: number | null
          responded_at?: string | null
          response?: string | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_id?: string | null
          rating?: number | null
          responded_at?: string | null
          response?: string | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_slug: {
        Args: { name: string }
        Returns: string
      }
    }
    Enums: {
      delivery_method: "delivery" | "pickup"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method: "credit_card" | "debit_card" | "pix" | "cash" | "voucher"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      user_role: "admin" | "restaurant_owner" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      delivery_method: ["delivery", "pickup"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["credit_card", "debit_card", "pix", "cash", "voucher"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      user_role: ["admin", "restaurant_owner", "customer"],
    },
  },
} as const

export type Banner = Database['public']['Tables']['banners']['Row'];
export type BannerInsert = Database['public']['Tables']['banners']['Insert'];
export type BannerUpdate = Database['public']['Tables']['banners']['Update'];

export interface BannerFormValues {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  coupon_code?: string;
  discount_value?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  display_order: number;
}

// Definição da tabela de rastreamento de entregadores
export interface DeliveryTracking {
  id: string;
  order_id: string;
  delivery_person_id: string | null;
  delivery_person_name: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  last_updated: string;
  status: Database["public"]["Enums"]["order_status"] | null;
  estimated_arrival_time: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface DeliveryTrackingInsert {
  id?: string;
  order_id: string;
  delivery_person_id?: string | null;
  delivery_person_name?: string | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_updated?: string;
  status?: Database["public"]["Enums"]["order_status"] | null;
  estimated_arrival_time?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DeliveryTrackingUpdate {
  id?: string;
  order_id?: string;
  delivery_person_id?: string | null;
  delivery_person_name?: string | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_updated?: string;
  status?: Database["public"]["Enums"]["order_status"] | null;
  estimated_arrival_time?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RegisterCustomerResponse {
  success: boolean;
  user_id?: string;
  profile_id?: string;
  restaurant_id?: string;
  error?: string;
}
