
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import { OrderCreateInput, Product, MockProduct, OrderStatus } from '@/lib/models';
import { ShoppingCart } from 'lucide-react';

// Definir a interface correta para os parâmetros
interface RouteParams {
  restaurantId: string;
  [key: string]: string | undefined;
}

const MenuPage: React.FC = () => {
  const { restaurantId } = useParams<RouteParams>();
  const { products } = useRestaurant();
  const { cartItems, setCartItems } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const { toast } = useToast();

  useEffect(() => {
    // You might want to fetch the restaurant details here using restaurantId
    // and set the restaurant name, opening hours, etc.
  }, [restaurantId]);

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

  return (
    
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Cardápio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border rounded-md p-4">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-green-500 font-bold">R$ {product.price.toFixed(2)}</p>
            <Button onClick={() => setCartItems(prev => [...prev, { product, quantity: 1 }])}>
              Adicionar ao Carrinho
            </Button>
          </div>
        ))}
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

              <div className="mt-4">
                <h4 className="text-lg font-semibold">Detalhes do Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Input
                    type="text"
                    placeholder="Nome"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                  <Input
                    type="tel"
                    placeholder="Telefone"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder="Endereço de Entrega"
                  className="mt-2"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                />
                <Textarea
                  placeholder="Observações"
                  className="mt-2"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                />
                <select
                  className="mt-2 w-full p-2 border rounded-md"
                  value={deliveryType}
                  onChange={e => setDeliveryType(e.target.value as 'delivery' | 'pickup')}
                >
                  <option value="delivery">Entrega</option>
                  <option value="pickup">Retirada</option>
                </select>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-semibold">Total: R$ {calculateCartTotal().toFixed(2)}</h3>
              </div>
            
            </ScrollArea>
          )}

          <div className="mt-4 flex justify-between">
            <Button variant="secondary" onClick={() => setIsCheckoutOpen(false)}>
              Voltar ao Menu
            </Button>
            {!isOrderComplete && (
              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? "Processando..." : "Finalizar Pedido"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Summary */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span>{cartItems.length} itens</span>
            <span className="ml-4">Total: R$ {cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}</span>
          </div>
          <Button onClick={() => setIsCheckoutOpen(true)}>Ver Carrinho</Button>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
