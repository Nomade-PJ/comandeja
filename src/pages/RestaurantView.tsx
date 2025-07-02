import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Star, Clock, MapPin, Search, Phone, Instagram, Facebook, ChevronDown, Info, Heart, UserCircle, Settings, User, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { CartDrawer } from '@/components/ui/cart-drawer';
import { AuthModal } from '@/components/ui/auth-modal';
import { UserMenu } from '@/components/ui/user-menu';
import { formatCurrency } from '@/lib/utils';
import { Restaurant, Category, Product, Profile } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RestaurantView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const { addItem, getItemCount, toggleFavorite, isFavorite } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (slug) {
      fetchRestaurantData();
    }
  }, [slug]);

  const fetchRestaurantData = async () => {
    try {
      // Buscar dados do restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (restaurantError) {
        return;
      }

      if (!restaurantData) {
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) {
      } else {
        setCategories(categoriesData || []);
      }

      // Buscar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .order('display_order');

      if (productsError) {
      } else {
        setProducts(productsData || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  // Função para incrementar a quantidade de um produto
  const incrementQuantity = (productId: string) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Função para decrementar a quantidade de um produto
  const decrementQuantity = (productId: string) => {
    if ((productQuantities[productId] || 0) > 0) {
      setProductQuantities(prev => ({
        ...prev,
        [productId]: prev[productId] - 1
      }));
    }
  };

  // Função para adicionar produto ao carrinho com a quantidade especificada
  const handleAddToCartWithQuantity = async (product: Product, quantity: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Se a quantidade for 0, não adiciona ao carrinho
    if (quantity <= 0) return;
    
    // Verificação de restaurante existente
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível verificar seu perfil",
            variant: "destructive",
          });
          return;
        }
        
        const registeredRestaurantId = (data as any).registered_restaurant_id;
        
        if (registeredRestaurantId && registeredRestaurantId !== restaurant.id) {
          toast({
            title: "Acesso Negado",
            description: "Você só pode fazer pedidos no restaurante onde se cadastrou.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        return;
      }
    }
    
    // Adiciona ao carrinho a quantidade especificada
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        restaurant_id: product.restaurant_id
      });
    }
    
    // Reseta a quantidade do produto
    setProductQuantities(prev => ({
      ...prev,
      [product.id]: 0
    }));
    
    toast({
      title: "Produto adicionado",
      description: `${quantity} ${quantity > 1 ? 'unidades' : 'unidade'} de ${product.name} ${quantity > 1 ? 'foram adicionadas' : 'foi adicionada'} ao carrinho.`,
      duration: 2000,
    });
  };

  const handleAddToCart = async (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click from triggering
    }
    
    // Se o usuário estiver logado, verificar se ele pode pedir neste restaurante
    if (user) {
      try {
        // Usar any para contornar problemas de tipagem com a nova coluna
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível verificar seu perfil",
            variant: "destructive",
          });
          return;
        }
        
        // Verificar se o usuário está registrado em outro restaurante
        const registeredRestaurantId = (data as any).registered_restaurant_id;
        
        if (registeredRestaurantId && registeredRestaurantId !== restaurant.id) {
          toast({
            title: "Acesso Negado",
            description: "Você só pode fazer pedidos no restaurante onde se cadastrou.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        return;
      }
    }
    
    // Continuar com o processo normal se passou na verificação
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      restaurant_id: product.restaurant_id
    });
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
      duration: 2000,
    });
  };

  const handleToggleFavorite = () => {
    if (!user) {
      // Se não estiver logado, abrir modal de autenticação
      setIsAuthModalOpen(true);
      return;
    }
    
    if (restaurant) {
      toggleFavorite(restaurant.id);
      
      toast({
        title: isFavorite(restaurant.id) ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: `${restaurant.name} foi ${isFavorite(restaurant.id) ? "removido dos" : "adicionado aos"} favoritos.`,
        duration: 2000,
      });
    }
  };

  const filteredProducts = products.filter(product => 
    (selectedCategory === 'all' || product.category_id === selectedCategory) && 
    (searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const featuredProducts = products.filter(product => product.is_featured);

  // Update the product cards to be clickable
  // This is for the featured products section
  const renderFeaturedProductCard = (product: Product) => {
    const quantity = productQuantities[product.id] || 0;
    
    return (
    <Card 
      key={product.id} 
      className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
    >
      <div 
        className="relative"
        onClick={() => handleProductClick(product.id)}
      >
        {product.image_url ? (
          <div className="relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Botão visualização rápida */}
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/80 hover:bg-white text-gray-800"
                onClick={(e) => openQuickView(product, e)}
              >
                Visualização Rápida
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sem imagem</span>
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-primary text-white">
          Destaque
        </Badge>
      </div>
      <CardContent className="p-4">
        <div 
          className="flex justify-between items-start mb-2"
          onClick={() => handleProductClick(product.id)}
        >
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(product.price)}
          </p>
        </div>
        {product.description && (
          <p 
            className="text-gray-600 text-sm mb-3 line-clamp-2"
            onClick={() => handleProductClick(product.id)}
          >
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span 
            className="text-xs text-gray-500 flex items-center gap-1"
            onClick={() => handleProductClick(product.id)}
          >
            <Clock className="w-3 h-3" />
            {product.preparation_time} min
          </span>
          
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            {quantity > 0 ? (
              <div className="flex items-center border border-gray-200 rounded-md">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    decrementQuantity(product.id);
                  }} 
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementQuantity(product.id);
                  }} 
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  incrementQuantity(product.id);
                }}
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            )}
            
            {quantity > 0 && (
              <Button 
                size="sm" 
                className="ml-2 bg-primary hover:bg-primary/90 text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={(e) => {
                  console.log("Botão confirmar clicado (destaque)");
                  e.stopPropagation(); 
                  
                  // Método direto de adicionar ao carrinho
                  for (let i = 0; i < quantity; i++) {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      restaurant_id: product.restaurant_id
                    });
                  }
                  
                  // Notificação
                  toast({
                    title: "Produto adicionado",
                    description: `${quantity} ${quantity > 1 ? 'unidades' : 'unidade'} de ${product.name} adicionada ao carrinho.`,
                    duration: 2000,
                  });
                  
                  // Resetar contador
                  setProductQuantities(prev => ({
                    ...prev,
                    [product.id]: 0
                  }));
                }}
                aria-label="Confirmar"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Confirmar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  // This is for the category products section
  const renderProductCard = (product: Product) => {
    const quantity = productQuantities[product.id] || 0;
    
    return (
    <Card 
      key={product.id} 
      className="overflow-hidden hover:shadow-lg transition-shadow group border border-gray-200 cursor-pointer relative"
    >
      {product.image_url ? (
        <div 
          className="relative overflow-hidden h-48"
          onClick={() => handleProductClick(product.id)}
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.is_featured && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-500 text-white">Popular</Badge>
            </div>
          )}
          
          {/* Botão visualização rápida */}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/80 hover:bg-white text-gray-800"
              onClick={(e) => openQuickView(product, e)}
            >
              Visualização Rápida
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="w-full h-48 bg-gray-100 flex items-center justify-center"
          onClick={() => handleProductClick(product.id)}
        >
          <span className="text-gray-400">Sem imagem</span>
        </div>
      )}
      <CardContent className="p-4">
        <div 
          className="flex justify-between items-start mb-2"
          onClick={() => handleProductClick(product.id)}
        >
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(product.price)}
          </p>
        </div>
        {product.description && (
          <p 
            className="text-gray-600 text-sm mb-3 line-clamp-2"
            onClick={() => handleProductClick(product.id)}
          >
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span 
            className="text-xs text-gray-500 flex items-center gap-1"
            onClick={() => handleProductClick(product.id)}
          >
            <Clock className="w-3 h-3" />
            {product.preparation_time} min
          </span>
          
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            {quantity > 0 ? (
              <div className="flex items-center border border-gray-200 rounded-md">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    decrementQuantity(product.id);
                  }} 
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementQuantity(product.id);
                  }} 
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  incrementQuantity(product.id);
                }}
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            )}
            
            {quantity > 0 && (
              <Button 
                size="sm" 
                className="ml-2 bg-primary hover:bg-primary/90 text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={(e) => {
                  console.log("Botão confirmar clicado");
                  e.stopPropagation(); 
                  
                  // Método direto de adicionar ao carrinho
                  for (let i = 0; i < quantity; i++) {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      restaurant_id: product.restaurant_id
                    });
                  }
                  
                  // Notificação
                  toast({
                    title: "Produto adicionado",
                    description: `${quantity} ${quantity > 1 ? 'unidades' : 'unidade'} de ${product.name} adicionada ao carrinho.`,
                    duration: 2000,
                  });
                  
                  // Resetar contador
                  setProductQuantities(prev => ({
                    ...prev,
                    [product.id]: 0
                  }));
                }}
                aria-label="Confirmar"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Confirmar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  // Função para abrir a visualização rápida do produto
  const openQuickView = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setQuickViewProduct(product);
    // Inicializar a quantidade do produto se não estiver definida
    if (!productQuantities[product.id]) {
      setProductQuantities(prev => ({
        ...prev,
        [product.id]: 1  // Começar com 1 por padrão
      }));
    }
  };

  // Função para adicionar produto ao carrinho a partir da visualização rápida
  const addToCartFromQuickView = () => {
    if (quickViewProduct) {
      const quantity = productQuantities[quickViewProduct.id] || 1;
      console.log("Adicionando do QuickView:", quickViewProduct.name, "quantidade:", quantity);
      
      // Método direto de adicionar ao carrinho
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: quickViewProduct.id,
          name: quickViewProduct.name,
          price: quickViewProduct.price,
          image_url: quickViewProduct.image_url,
          restaurant_id: quickViewProduct.restaurant_id
        });
      }
      
      // Notificação
      toast({
        title: "Produto adicionado",
        description: `${quantity} ${quantity > 1 ? 'unidades' : 'unidade'} de ${quickViewProduct.name} adicionada ao carrinho.`,
        duration: 2000,
      });
      
      // Resetar contador e fechar modal
      setProductQuantities(prev => ({
        ...prev,
        [quickViewProduct.id]: 0
      }));
      
      setQuickViewProduct(null); // Fechar o modal após adicionar
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-primary/30 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Info className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurante não encontrado</h1>
          <p className="text-gray-600">O restaurante que você está procurando não existe ou está inativo.</p>
          <p className="text-gray-400 text-sm mt-2">Slug buscado: {slug}</p>
        </div>
      </div>
    );
  }

  // Define a cor primária para o tema
  const primaryColor = '#ff6b35';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Hero com os botões de favorito e carrinho incorporados */}
      <div className="relative">
        {restaurant.banner_url ? (
          <div 
            className="h-24 md:h-32 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${restaurant.banner_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold mb-0 drop-shadow-md">{restaurant.name}</h1>
                <div className="flex items-center space-x-3">
                  {!user ? (
                    <button 
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center"
                      onClick={() => setIsAuthModalOpen(true)}
                    >
                      <UserCircle className="w-5 h-5 text-white mr-1" />
                      <span className="text-white text-sm">Entrar</span>
                    </button>
                  ) : (
                    <>
                      <UserMenu className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-1" />
                    </>
                  )}
                  <button 
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md relative"
                    onClick={() => setIsCartOpen(true)}
                  >
                    <ShoppingCart className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {getItemCount()}
                    </span>
                  </button>
                </div>
              </div>
              {restaurant.description && (
                <p className="text-xs md:text-sm mb-1 max-w-lg drop-shadow-sm line-clamp-1">{restaurant.description}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary hover:bg-primary/90 px-2 py-0.5 text-xs font-medium">
                  <Star className="w-3 h-3 fill-white mr-1" />
                  <span>4.8</span>
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-2 py-0.5 text-xs font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>30-45 min</span>
                </Badge>
                {restaurant.address && (
                  <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-2 py-0.5 text-xs font-medium">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[120px]">{restaurant.address}</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-24 md:h-32 bg-gradient-to-r from-primary/90 to-primary/70 relative">
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold mb-0">{restaurant.name}</h1>
                <div className="flex items-center space-x-3">
                  {!user ? (
                    <button 
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center"
                      onClick={() => setIsAuthModalOpen(true)}
                    >
                      <UserCircle className="w-5 h-5 text-white mr-1" />
                      <span className="text-white text-sm">Entrar</span>
                    </button>
                  ) : (
                    <>
                      <UserMenu className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-1" />
                    </>
                  )}
                  <button 
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md relative"
                    onClick={() => setIsCartOpen(true)}
                  >
                    <ShoppingCart className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {getItemCount()}
                    </span>
                  </button>
                </div>
              </div>
              {restaurant.description && (
                <p className="text-xs md:text-sm mb-1 max-w-lg opacity-90 line-clamp-1">{restaurant.description}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 text-xs font-medium">
                  <Star className="w-3 h-3 fill-white mr-1" />
                  <span>4.8</span>
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 text-xs font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>30-45 min</span>
                </Badge>
                {restaurant.address && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 text-xs font-medium">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[120px]">{restaurant.address}</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              className="pl-10 pr-4 py-2 w-full border-gray-300 focus:ring-primary focus:border-primary rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Layout de Duas Colunas */}
      <div className="max-w-6xl mx-auto py-8 flex flex-col md:flex-row">
        {/* Menu Lateral de Categorias (Visível apenas em telas médias e grandes) */}
        <div className="hidden md:block w-64 pr-4 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Categorias</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Todos os Produtos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 px-4">
          {/* Categorias como Chips rolantes horizontalmente (apenas em dispositivos móveis) */}
          <div className="md:hidden sticky top-[57px] z-20 bg-white shadow-sm py-3 -mx-4 px-4 mb-6">
            <div className="overflow-x-auto pb-1 hide-scrollbar">
              <div className="flex space-x-2 min-w-max">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos os Produtos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Produtos em Destaque */}
          {featuredProducts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🔥</span> Destaques
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.slice(0, 3).map(renderFeaturedProductCard)}
              </div>
            </div>
          )}

          {/* Lista de Produtos por Categoria */}
          {categories.map((category) => {
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
            if (categoryProducts.length === 0 && selectedCategory !== category.id) return null;

            return (
              <div key={category.id} className="mb-12" id={`category-${category.id}`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                </div>

                {category.description && (
                  <p className="text-gray-600 mb-5">{category.description}</p>
                )}

                {categoryProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {categoryProducts.map(renderProductCard)}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Nenhum produto encontrado nesta categoria</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Produtos sem categoria */}
          {(() => {
            const uncategorizedProducts = filteredProducts.filter(p => !p.category_id);
            if (uncategorizedProducts.length === 0) return null;

            return (
              <div className="mb-12" id="category-others">
                <h2 className="text-2xl font-bold text-gray-900 mb-5">Outros Produtos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {uncategorizedProducts.map(renderProductCard)}
                </div>
              </div>
            );
          })()}

          {/* Mensagem quando não há produtos */}
          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">Cardápio em breve</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Este restaurante ainda não adicionou produtos ao cardápio. Volte em breve!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização Rápida */}
      <Dialog open={quickViewProduct !== null} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
        {quickViewProduct && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{quickViewProduct.name}</DialogTitle>
              <DialogDescription className="text-gray-500">
                {quickViewProduct.description}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 py-4">
              {quickViewProduct.image_url && (
                <img 
                  src={quickViewProduct.image_url} 
                  alt={quickViewProduct.name} 
                  className="w-full h-48 object-cover rounded-md" 
                />
              )}

              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-primary">{formatCurrency(quickViewProduct.price)}</p>
                <div className="flex items-center border border-gray-200 rounded-md">
                  <button 
                    onClick={() => decrementQuantity(quickViewProduct.id)} 
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center">{productQuantities[quickViewProduct.id] || 1}</span>
                  <button 
                    onClick={() => incrementQuantity(quickViewProduct.id)} 
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <h4 className="font-medium mb-1">Tempo de Preparo</h4>
                <p className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {quickViewProduct.preparation_time} minutos
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuickViewProduct(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                style={{ backgroundColor: primaryColor }}
                onClick={addToCartFromQuickView}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Carrinho Flutuante */}
      {getItemCount() > 0 && (
        <div 
          className="fixed bottom-6 right-6 z-40 cursor-pointer"
          onClick={() => setIsCartOpen(true)}
        >
          <div className="relative bg-primary text-white p-4 rounded-full shadow-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold">
              {getItemCount()}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="font-bold text-xl mb-3">{restaurant.name}</h3>
              {restaurant.description && (
                <p className="text-gray-300 mb-4 max-w-md">{restaurant.description}</p>
              )}
              {restaurant.address && (
                <div className="flex items-start mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-gray-400 mt-0.5" />
                  <span className="text-gray-300">
                    {restaurant.address}
                    {restaurant.city && `, ${restaurant.city}`}
                    {restaurant.state && ` - ${restaurant.state}`}
                  </span>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center mb-2">
                  <Phone className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-300">{restaurant.phone}</span>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-3">Redes Sociais</h4>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {restaurant.name}. Todos os direitos reservados.</p>
            <p>Desenvolvido com ♥ por Comanda Já</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          toast({
            title: "Login realizado com sucesso!",
            description: "Agora você pode favoritar restaurantes e fazer pedidos.",
            duration: 3000,
          });
        }}
      />

      {/* Adicionar CSS para esconder a scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RestaurantView;
