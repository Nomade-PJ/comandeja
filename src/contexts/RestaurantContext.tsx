
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Types
export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  available: boolean;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  notes?: string;
  price: number;
  product: Product;
};

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryType: 'pickup' | 'delivery';
  scheduledFor?: Date;
  notes?: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Restaurant = {
  id: string;
  name: string;
  description: string;
  logo: string;
  address: string;
  phone: string;
  openingHours: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
};

type RestaurantContextType = {
  restaurant: Restaurant | null;
  categories: Category[];
  products: Product[];
  orders: Order[];
  updateRestaurantInfo: (info: Partial<Restaurant>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  isLoading: boolean;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Burgers' },
  { id: 'cat-2', name: 'Pizzas' },
  { id: 'cat-3', name: 'Drinks' },
  { id: 'cat-4', name: 'Desserts' }
];

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Classic Burger',
    description: 'Beef patty, lettuce, tomato, cheese, and our special sauce',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500',
    categoryId: 'cat-1',
    available: true
  },
  {
    id: 'prod-2',
    name: 'Veggie Burger',
    description: 'Plant-based patty with all the fixings',
    price: 10.99,
    imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=500',
    categoryId: 'cat-1',
    available: true
  },
  {
    id: 'prod-3',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni pizza with our signature sauce',
    price: 14.99,
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=500',
    categoryId: 'cat-2',
    available: true
  },
  {
    id: 'prod-4',
    name: 'Coca-Cola',
    description: 'Classic refreshing soda',
    price: 2.99,
    imageUrl: 'https://images.unsplash.com/photo-1629203432180-71e9b18d855c?q=80&w=500',
    categoryId: 'cat-3',
    available: true
  },
  {
    id: 'prod-5',
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with vanilla ice cream',
    price: 5.99,
    imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=500',
    categoryId: 'cat-4',
    available: true
  }
];

const mockOrders: Order[] = [
  {
    id: 'ord-1',
    items: [
      {
        productId: 'prod-1',
        quantity: 2,
        price: 12.99,
        product: mockProducts[0]
      },
      {
        productId: 'prod-4',
        quantity: 2,
        price: 2.99,
        product: mockProducts[3]
      }
    ],
    status: 'confirmed',
    customerName: 'João Silva',
    customerPhone: '+5511987654321',
    customerAddress: 'Rua das Flores, 123',
    deliveryType: 'delivery',
    totalAmount: 31.96,
    createdAt: new Date(new Date().getTime() - 45 * 60000), // 45 minutes ago
    updatedAt: new Date(new Date().getTime() - 30 * 60000)  // 30 minutes ago
  },
  {
    id: 'ord-2',
    items: [
      {
        productId: 'prod-3',
        quantity: 1,
        price: 14.99,
        product: mockProducts[2]
      }
    ],
    status: 'pending',
    customerName: 'Maria Santos',
    customerPhone: '+5511976543210',
    deliveryType: 'pickup',
    totalAmount: 14.99,
    createdAt: new Date(new Date().getTime() - 15 * 60000), // 15 minutes ago
    updatedAt: new Date(new Date().getTime() - 15 * 60000)  // 15 minutes ago
  }
];

const mockRestaurant: Restaurant = {
  id: 'resto-1',
  name: 'Burger Palace',
  description: 'The best burgers in town!',
  logo: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=500',
  address: 'Av. Paulista, 1000, São Paulo',
  phone: '+551144332211',
  openingHours: 'Mon-Sun: 11am - 10pm',
  owner: {
    id: '1',
    name: 'Restaurant Owner',
    email: 'owner@burgerpalace.com'
  }
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load restaurant data when user changes
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!user?.restaurantId) {
        setRestaurant(null);
        setCategories([]);
        setProducts([]);
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Mock API calls with timeout
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real app, these would be API calls
        setRestaurant(mockRestaurant);
        setCategories(mockCategories);
        setProducts(mockProducts);
        setOrders(mockOrders);
      } catch (error) {
        console.error('Failed to load restaurant data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurantData();
  }, [user]);

  const updateRestaurantInfo = (info: Partial<Restaurant>) => {
    if (!restaurant) return;
    setRestaurant({ ...restaurant, ...info });
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: `cat-${Date.now()}`
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (category: Category) => {
    setCategories(categories.map(c => c.id === category.id ? category : c));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter(c => c.id !== categoryId));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setOrders([newOrder, ...orders]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status,
          updatedAt: new Date()
        };
      }
      return order;
    }));
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        categories,
        products,
        orders,
        updateRestaurantInfo,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrderStatus,
        isLoading
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
