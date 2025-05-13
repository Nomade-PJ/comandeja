
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRestaurant, Category, Product } from '@/contexts/RestaurantContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Search, ShoppingCart, Clock, MapPin, Check, Phone } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductDetail from '@/components/ProductDetail';
import CustomerAuth from '@/components/CustomerAuth';

const CustomerRestaurantView = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  
  // Cart state
  const [cartItems, setCartItems] = useState<{
    product: Product;
    quantity: number;
    notes: string;
  }[]>([]);
  
  // Checkout form state
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLocationShared, setIsLocationShared] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auth state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  // For demo purposes, use these mock data if there's no actual restaurant data available yet
  const mockRestaurant = {
    id: 'resto-demo',
    name: restaurantSlug ? restaurantSlug.charAt(0).toUpperCase() + restaurantSlug.slice(1) : 'Demo Restaurant',
    description: 'Deliciosos pratos para satisfazer seu paladar',
    logo: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=500',
    address: 'Av. Paulista, 1000, São Paulo',
    phone: '+551144332211',
    openingHours: 'Seg-Dom: 11h - 22h'
  };

  const mockCategories = [
    { id: 'cat-1', name: 'Burgers' },
    { id: 'cat-2', name: 'Pizzas' },
    { id: 'cat-3', name: 'Bebidas' },
    { id: 'cat-4', name: 'Sobremesas' }
  ];

  const mockProducts = [
    {
      id: 'prod-1',
      name: 'Classic Burger',
      description: 'Hambúrguer de carne bovina, alface, tomate, queijo e molho especial',
      price: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500',
      categoryId: 'cat-1',
      available: true
    },
    {
      id: 'prod-2',
      name: 'Pizza Margherita',
      description: 'Pizza tradicional italiana com molho de tomate, mussarela e manjericão',
      price: 14.99,
      imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=500',
      categoryId: 'cat-2',
      available: true
    }
  ];
  
  const { restaurant, categories, products } = useRestaurant();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (restaurant === null) {
      console.log("No restaurant data available, would load from API using slug:", restaurantSlug);
      // In a real implementation, here you would fetch restaurant data from the database using the slug
    }
    
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    } else if (categories.length === 0 && mockCategories.length > 0) {
      setSelectedCategory(mockCategories[0].id);
    }
  }, [restaurant, categories, selectedCategory, restaurantSlug]);
  
  // Calculate total items and amount
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
  const totalAmount = subtotal + deliveryFee;
  
  // Filter products by search and category
  const displayProducts = products.length > 0 ? products : mockProducts;
  const displayCategories = categories.length > 0 ? categories : mockCategories;
  const displayRestaurant = restaurant ? restaurant : mockRestaurant;
  
  const filteredProducts = displayProducts.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory && product.available;
  });
  
  const handleAddToCart = (product: Product, quantity: number, notes: string = '') => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          notes: notes || updatedItems[existingItemIndex].notes
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity, notes }];
      }
    });
  };
  
  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };
  
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    }
  };
  
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };
  
  const handleProceedToCheckout = () => {
    if (!user) {
      setShowAuthPrompt(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };
  
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocationShared(true);
          toast({
            title: "Localização compartilhada",
            description: "Sua localização foi compartilhada com sucesso.",
          });
        },
        () => {
          toast({
            title: "Erro ao compartilhar localização",
            description: "Não foi possível obter sua localização. Verifique as permissões do navegador.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Localização não suportada",
        description: "Seu navegador não suporta compartilhamento de localização.",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de finalizar o pedido.",
        variant: "destructive"
      });
      return;
    }
    
    if (!name || !phone || (deliveryType === 'delivery' && !address)) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, here we would send the order to the restaurant via API
      // The order would include the restaurant slug to identify which restaurant it belongs to
      // The order would be saved in the database and shown in the restaurant's dashboard
      
      setIsOrderComplete(true);
      setCartItems([]);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Failed to submit order:', error);
      toast({
        title: "Erro ao enviar pedido",
        description: "Não foi possível enviar seu pedido. Tente novamente mais tarde.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  const handleAuthSuccess = () => {
    // If the user was trying to check out, continue to checkout
    if (cartItems.length > 0) {
      setIsCheckoutOpen(true);
    }
  };
  
  const handleViewOrder = () => {
    // In a real app, we'd navigate to the actual order ID
    const mockOrderId = "123456";
    navigate(`/r/${restaurantSlug}/pedido/${mockOrderId}`);
    setIsOrderComplete(false);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <header className="bg-primary text-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              {displayRestaurant.logo && (
                <img
                  src={displayRestaurant.logo}
                  alt={displayRestaurant.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{displayRestaurant.name}</h1>
                <div className="flex items-center text-sm text-white/80 mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{displayRestaurant.openingHours}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CustomerAuth 
                restaurantSlug={restaurantSlug || ''}
                onSuccess={handleAuthSuccess}
                trigger={
                  user ? (
                    <Button variant="secondary" className="text-sm">
                      Olá, {user.name.split(' ')[0]}
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm">
                      Entrar / Cadastrar
                    </Button>
                  )
                }
              />
              
              <Button 
                variant="secondary" 
                className="flex items-center gap-2"
                onClick={() => setIsCheckoutOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>
                  Carrinho ({totalItems})
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Info Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center text-sm text-gray-600 mb-2 sm:mb-0">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{displayRestaurant.address}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{displayRestaurant.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              className="pl-10"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs 
          value={selectedCategory || displayCategories[0]?.id} 
          onValueChange={setSelectedCategory as any}
          className="w-full mb-6"
        >
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="h-12 inline-flex">
              {displayCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {displayCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.filter(p => p.categoryId === category.id).map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    className="cursor-pointer"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={() => handleProductClick(product)}
                    />
                  </div>
                ))}
              </div>
              
              {filteredProducts.filter(p => p.categoryId === category.id).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum produto encontrado nesta categoria.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          open={isProductDetailOpen}
          onOpenChange={setIsProductDetailOpen}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart/Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{isOrderComplete ? "Pedido realizado com sucesso!" : "Seu pedido"}</DialogTitle>
            <DialogDescription>
              {isOrderComplete 
                ? "Seu pedido foi enviado ao restaurante." 
                : "Revise seus itens antes de finalizar o pedido."}
            </DialogDescription>
          </DialogHeader>
          
          {isOrderComplete ? (
            <div className="py-6 text-center flex-1 overflow-y-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">Pedido realizado com sucesso!</h3>
              <p className="mb-4">
                Seu pedido foi enviado para {restaurant.name}.
              </p>
              
              <p className="text-sm text-gray-600 mb-6">
                Você receberá uma confirmação em breve.
              </p>
              
              <Button onClick={handleViewOrder} className="w-full">
                Acompanhar pedido
              </Button>
            </div>
          ) : (
            <>
              {cartItems.length > 0 ? (
                <form onSubmit={handleSubmitOrder} className="flex-1 overflow-hidden flex flex-col">
                  <Tabs defaultValue="cart" className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="cart">Carrinho</TabsTrigger>
                      <TabsTrigger value="delivery">Entrega</TabsTrigger>
                      <TabsTrigger value="payment">Pagamento</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="cart" className="flex-1 overflow-y-auto">
                      <ScrollArea className="h-[40vh]">
                        <div className="space-y-4 pr-4">
                          {cartItems.map((item, index) => (
                            <div key={index} className="flex gap-3 py-3 border-b">
                              {item.product.imageUrl && (
                                <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              <div className="flex-grow">
                                <div className="flex justify-between">
                                  <h4 className="font-medium">{item.product.name}</h4>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromCart(item.product.id)}
                                    className="text-gray-400 hover:text-gray-500 text-xs"
                                  >
                                    Remover
                                  </button>
                                </div>

                                {item.notes && (
                                  <p className="text-xs text-gray-500 mt-1">Obs: {item.notes}</p>
                                )}

                                <div className="flex justify-between items-center mt-2">
                                  <div className="flex items-center border rounded">
                                    <button
                                      type="button"
                                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                    >
                                      -
                                    </button>
                                    <span className="px-3">{item.quantity}</span>
                                    <button
                                      type="button"
                                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <p className="font-medium">
                                    R$ {(item.product.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className="mt-4 space-y-4">
                        <div className="pt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <Button type="button" variant="default" className="w-full">
                          Continuar para entrega
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="delivery" className="flex-1 overflow-y-auto">
                      <ScrollArea className="h-[40vh]">
                        <div className="space-y-4 pr-4">
                          <div className="space-y-2">
                            <Label className="text-base">Método de entrega *</Label>
                            <RadioGroup 
                              defaultValue="delivery" 
                              value={deliveryType}
                              onValueChange={(value) => setDeliveryType(value as 'pickup' | 'delivery')}
                              className="pt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="delivery" id="delivery" />
                                <Label htmlFor="delivery">Entrega</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pickup" id="pickup" />
                                <Label htmlFor="pickup">Retirada no local</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome completo *</Label>
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Seu nome completo"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone *</Label>
                            <Input
                              id="phone"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="(00) 00000-0000"
                              required
                            />
                          </div>
                          
                          {deliveryType === 'delivery' && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="address">Endereço completo *</Label>
                                <Textarea
                                  id="address"
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  placeholder="Rua, número, complemento, bairro, cidade, estado"
                                  required
                                />
                              </div>
                              
                              <div className="pt-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={handleShareLocation}
                                  disabled={isLocationShared}
                                >
                                  {isLocationShared ? (
                                    <Check className="mr-2 h-4 w-4" />
                                  ) : (
                                    <MapPin className="mr-2 h-4 w-4" />
                                  )}
                                  {isLocationShared ? 'Localização compartilhada' : 'Compartilhar localização'}
                                </Button>
                                {isLocationShared && coordinates && (
                                  <p className="text-xs text-muted-foreground mt-1 text-center">
                                    Localização: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                          
                          <div className="space-y-2">
                            <Label htmlFor="notes">Observações (opcional)</Label>
                            <Textarea
                              id="notes"
                              value={orderNotes}
                              onChange={(e) => setOrderNotes(e.target.value)}
                              placeholder="Alguma informação adicional para o restaurante?"
                            />
                          </div>
                        </div>
                      </ScrollArea>
                      
                      <div className="mt-4 space-y-4">
                        <div className="pt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Taxa de entrega</span>
                            <span>R$ {deliveryFee.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <Button type="button" variant="default" className="w-full">
                          Continuar para pagamento
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="payment" className="flex-1 overflow-y-auto">
                      <ScrollArea className="h-[40vh]">
                        <div className="space-y-4 pr-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Resumo do pedido</h3>
                            
                            {cartItems.map((item, index) => (
                              <div key={index} className="flex justify-between py-1 text-sm">
                                <span>{item.quantity}x {item.product.name}</span>
                                <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            
                            <div className="border-t mt-2 pt-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Taxa de entrega</span>
                                <span>R$ {deliveryFee.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold mt-2">
                                <span>Total</span>
                                <span>R$ {totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-base">Forma de pagamento *</Label>
                            <RadioGroup defaultValue="cash" className="pt-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash">Dinheiro</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card">Cartão na entrega</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pix" id="pix" />
                                <Label htmlFor="pix">PIX</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <h3 className="font-semibold mb-2">Informações de entrega</h3>
                            <p className="text-sm">
                              <span className="font-medium">Nome:</span> {name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Telefone:</span> {phone}
                            </p>
                            {deliveryType === 'delivery' && (
                              <p className="text-sm">
                                <span className="font-medium">Endereço:</span> {address}
                              </p>
                            )}
                            {orderNotes && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">Observações:</span> {orderNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                      
                      <div className="mt-4">
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Processando...' : 'Finalizar pedido'}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              ) : (
                <div className="py-12 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Seu carrinho está vazio.</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Adicione alguns produtos deliciosos do menu!
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Voltar ao menu
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Authentication Dialog */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>É necessário fazer login</DialogTitle>
            <DialogDescription>
              Para finalizar seu pedido, é necessário fazer login ou criar uma conta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <CustomerAuth 
              restaurantSlug={restaurantSlug || ''} 
              onSuccess={() => {
                setShowAuthPrompt(false);
                handleProceedToCheckout();
              }}
              trigger={
                <Button className="w-full">Entrar / Cadastrar</Button>
              }
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAuthPrompt(false)}
            >
              Voltar ao carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2">{displayRestaurant.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{displayRestaurant.description}</p>
            <p className="text-gray-600 text-sm">
              Powered by <span className="font-medium text-primary">ComandeJá</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerRestaurantView;
