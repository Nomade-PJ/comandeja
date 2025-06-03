import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { OrderCreateInput, Product, MockProduct, OrderStatus, Category } from '@/lib/models';
import { ShoppingCart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import supabase from '@/lib/supabase';

// Definir a interface correta para os parâmetros
interface RouteParams {
  restaurantId: string;
  [key: string]: string | undefined;
}

const MenuPage: React.FC = () => {
  const { restaurantId } = useParams<RouteParams>();
  const { products, categories, loadCategories } = useRestaurant();
  const { cartItems, setCartItems } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [restaurantInfo, setRestaurantInfo] = useState<{name: string, openingHours: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Verificar se o restaurante existe quando o componente for montado
  useEffect(() => {
    const checkRestaurant = async () => {
      if (!restaurantId) {
        navigate('/');
        return;
      }
      
      setIsLoading(true);
      try {
        // Verificar se o restaurante existe pelo slug
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name, opening_hours')
          .eq('slug', restaurantId)
          .single();
        
        if (error || !data) {
          console.error('Restaurante não encontrado:', error);
          // Redirecionar para a página inicial após um pequeno delay
          setTimeout(() => navigate('/'), 100);
          return;
        }
        
        // Se chegou aqui, o restaurante existe
        setRestaurantInfo({
          name: data.name,
          openingHours: data.opening_hours || 'Horário não informado'
        });
        
        // Carregar categorias específicas para este restaurante
        if (loadCategories) {
          await loadCategories();
        }
      } catch (error) {
        console.error('Erro ao verificar restaurante:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRestaurant();
  }, [restaurantId, navigate, loadCategories]);

  useEffect(() => {
    // Set the first category as active when categories load
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const handleAddToCart = (product: Product | MockProduct) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);

      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity: 1 }];
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

  // Função para calcular o total do carrinho
  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Função para finalizar o pedido
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao seu carrinho para finalizar o pedido",
        variant: "destructive"
      });
      return;
    }

    if (!customerName || !customerPhone) {
      toast({
        title: "Informações incompletas",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (deliveryType === 'delivery' && !customerAddress) {
      toast({
        title: "Endereço obrigatório",
        description: "Informe o endereço de entrega",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Calcular subtotal
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
      const total = subtotal + deliveryFee;
      
      // Gerar número do pedido
      const orderNumber = `${Date.now().toString().substring(6)}`;
      
      // Criar objeto de pedido
      const orderData: OrderCreateInput = {
        restaurant_id: restaurantId || '',
        customer_id: '00000000-0000-0000-0000-000000000000', // Placeholder, em um ambiente real seria o ID do cliente
        order_number: orderNumber,
        status: 'pending',
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        discount: 0,
        total: total,
        payment_method: 'cash', // Assumindo pagamento em dinheiro como padrão
        payment_status: 'pending',
        delivery_method: deliveryType,
        delivery_address: deliveryType === 'delivery' ? customerAddress : '',
        customer_name: customerName,
        customer_phone: customerPhone,
        notes: orderNotes,
        items: cartItems.map(item => ({
          id: '', // Será gerado pelo backend
          order_id: '', // Será gerado pelo backend
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.product.price * item.quantity,
          notes: item.notes,
          productId: item.product.id // Campo de compatibilidade
        }))
      };
      
      // Como não temos createOrder na RestaurantContext, vamos simular o sucesso
      console.log('Pedido criado:', orderData);
      
      // Limpar carrinho e mostrar mensagem de sucesso
      setCartItems([]);
      setIsOrderComplete(true);
      setIsProcessing(false);
      
      // Fechar o checkout após concluir o pedido
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setIsOrderComplete(false);
        
        // Reset dos dados do cliente
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setOrderNotes('');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Não foi possível completar seu pedido. Tente novamente.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  // Agrupar produtos por categoria
  const getProductsByCategory = (categoryId: string) => {
    return products.filter(product => product.category_id === categoryId || product.categoryId === categoryId);
  };

  // Produtos sem categoria
  const getUncategorizedProducts = () => {
    return products.filter(product => !product.category_id && !product.categoryId);
  };

  // Se estiver carregando ou verificando o restaurante
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando informações do restaurante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho do Restaurante */}
      <div className="bg-slate-800 text-white rounded-lg p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{restaurantInfo?.name || "PizzariaEsquina"}</h1>
          <p className="text-sm mt-1">{restaurantInfo?.openingHours || "Seg-Dom: 11h - 22h"}</p>
          <p className="text-sm mt-1">Endereço não informado</p>
          <p className="text-sm">Telefone não informado</p>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={() => setIsCheckoutOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Carrinho ({cartItems.length})</span>
          </Button>
        </div>
      </div>
      
      {/* Campo de Busca */}
      <div className="mb-6">
        <Input 
          type="search" 
          placeholder="Buscar produtos..." 
          className="w-full max-w-xl"
        />
      </div>
      
      {/* Área de categorias e produtos - substituída por uma mensagem informativa */}
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Menu do Restaurante</h2>
        <p className="text-gray-500 mb-4">
          Adicione categorias e produtos através do painel administrativo para que apareçam aqui.
        </p>
        <p className="text-gray-400 text-sm">
          Vá para a página "Produtos" no painel admin para gerenciar seu cardápio.
        </p>
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Revise seu pedido e preencha os detalhes para finalizar a compra.
            </DialogDescription>
          </DialogHeader>

          {isOrderComplete ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold">Pedido Confirmado!</h2>
              <p>Seu pedido foi recebido e está sendo processado.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] w-full">
              
              <div className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <div key={item.product.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <p className="font-bold">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {/* Informações do cliente */}
              {cartItems.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Informações para entrega</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Seu telefone com DDD"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Button
                        variant={deliveryType === 'delivery' ? 'default' : 'outline'}
                        onClick={() => setDeliveryType('delivery')}
                      >
                        Entrega
                      </Button>
                      <Button
                        variant={deliveryType === 'pickup' ? 'default' : 'outline'}
                        onClick={() => setDeliveryType('pickup')}
                      >
                        Retirada
                      </Button>
                    </div>
                    
                    {deliveryType === 'delivery' && (
                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço de entrega</Label>
                        <Textarea
                          id="address"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Endereço completo para entrega"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Alguma observação para seu pedido?"
                      rows={2}
                    />
                  </div>
                  
                  <div className="pt-6 mt-6 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>R$ {calculateCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Taxa de entrega</span>
                      <span>R$ {(deliveryType === 'delivery' ? 5 : 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>R$ {(calculateCartTotal() + (deliveryType === 'delivery' ? 5 : 0)).toFixed(2)}</span>
                    </div>
                    
                    <Button 
                      className="w-full mt-4 bg-green-500 hover:bg-green-600"
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processando..." : "Finalizar Pedido"}
                    </Button>
                  </div>
                </div>
              )}
              
              {cartItems.length === 0 && (
                <div className="text-center py-8">
                  <p>Seu carrinho está vazio.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsCheckoutOpen(false)}>
                    Voltar para o cardápio
                  </Button>
                </div>
              )}
              
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuPage;
