import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { formatCurrency } from "@/lib/utils";
import { X, Plus, Minus, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateOrder?: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[];
    deliveryMethod: 'delivery' | 'pickup';
    deliveryAddress?: string;
    paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'voucher';
    notes?: string;
  }) => Promise<string | null>;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const NewOrderModal = ({ open, onOpenChange, onCreateOrder }: NewOrderModalProps) => {
  const { restaurant } = useRestaurant();
  
  // Dados do pedido
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'pix' | 'cash' | 'voucher'>('cash');
  const [notes, setNotes] = useState("");
  
  // Produtos e itens do pedido
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Carregar produtos quando o modal for aberto
  useEffect(() => {
    if (open && restaurant) {
      fetchProducts();
    }
  }, [open, restaurant]);

  // Filtrar produtos baseado na busca
  useEffect(() => {
    if (productSearch.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowerSearch = productSearch.toLowerCase();
      setFilteredProducts(
        products.filter(product => 
          product.name.toLowerCase().includes(lowerSearch) ||
          product.description?.toLowerCase().includes(lowerSearch)
        )
      );
    }
  }, [productSearch, products]);

  // Buscar produtos do restaurante
  const fetchProducts = async () => {
    if (!restaurant) return;
    
    setLoadingProducts(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, description')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return;
      }
      
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Adicionar produto ao pedido
  const addProductToOrder = (product: Product) => {
    // Verificar se o produto já está no pedido
    const existingItemIndex = orderItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Aumentar quantidade se já existir
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      // Adicionar novo item
      setOrderItems([
        ...orderItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  // Aumentar quantidade de um item
  const incrementItemQuantity = (itemId: string) => {
    setOrderItems(
      orderItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Diminuir quantidade de um item
  const decrementItemQuantity = (itemId: string) => {
    setOrderItems(
      orderItems.map(item =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Remover item do pedido
  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  // Calcular valor total do pedido
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Resetar formulário
  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setDeliveryMethod("pickup");
    setAddress("");
    setPaymentMethod("cash");
    setNotes("");
    setOrderItems([]);
    setProductSearch("");
  };

  // Enviar pedido
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast({
        title: "Pedido vazio",
        description: "Adicione pelo menos um produto ao pedido",
        variant: "destructive",
      });
      return;
    }
    
    if (!customerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do cliente",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (onCreateOrder) {
        const orderData = {
          customerName,
          customerPhone,
          customerEmail,
          items: orderItems,
          deliveryMethod,
          deliveryAddress: address,
          paymentMethod,
          notes,
        };
        
        const result = await onCreateOrder(orderData);
        
        if (result) {
          resetForm();
          onOpenChange(false);
        }
      } else {
        // Fallback se não tiver o callback de criação de pedido
        console.log("Criando pedido:", {
          customerName,
          customerPhone,
          customerEmail,
          items: orderItems,
          deliveryMethod,
          address,
          paymentMethod,
          notes,
        });
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro ao processar o pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Crie um novo pedido para um cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dados do cliente */}
          <div>
            <h3 className="text-sm font-medium mb-3">Dados do cliente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Digite o nome do cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Produtos */}
          <div>
            <h3 className="text-sm font-medium mb-3">Produtos</h3>
            <div className="space-y-4">
              {/* Busca de produtos */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-10"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              
              {/* Lista de produtos */}
              <div className="border rounded-md h-36 overflow-y-auto">
                {loadingProducts ? (
                  <div className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">Carregando produtos...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="divide-y">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="p-2 flex items-center justify-between hover:bg-muted">
                        <div className="flex items-center space-x-3">
                          {product.image_url && (
                            <div className="h-10 w-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden">
                              <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(product.price)}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => addProductToOrder(product)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
                  </div>
                )}
              </div>
              
              {/* Itens no pedido */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Itens no pedido</h4>
                  {orderItems.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setOrderItems([])}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
                
                <div className="border rounded-md">
                  {orderItems.length > 0 ? (
                    <div className="divide-y">
                      {orderItems.map((item) => (
                        <div key={item.id} className="p-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center border rounded-md">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => decrementItemQuantity(item.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => incrementItemQuantity(item.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground"
                              onClick={() => removeItem(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-3 font-medium flex justify-between">
                        <span>Total</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center">
                      <p className="text-sm text-muted-foreground">Nenhum item adicionado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Detalhes de entrega e pagamento */}
          <div>
            <h3 className="text-sm font-medium mb-3">Entrega e Pagamento</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryMethod">Método de Entrega</Label>
                <Select 
                  value={deliveryMethod} 
                  onValueChange={(value) => setDeliveryMethod(value as 'delivery' | 'pickup')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="pickup">Retirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'voucher')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="voucher">Vale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {deliveryMethod === "delivery" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="address">Endereço de Entrega</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  required={deliveryMethod === 'delivery'}
                />
              </div>
            )}
            
            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white"
              disabled={loading || orderItems.length === 0}
            >
              {loading ? "Criando..." : "Criar Pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderModal;
