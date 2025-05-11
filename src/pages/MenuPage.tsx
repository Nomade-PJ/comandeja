
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurant, Category, Product, OrderStatus } from '@/contexts/RestaurantContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Clock, MapPin } from 'lucide-react';
import { CartProvider, CartItem, useCart } from '@/components/CartProvider';
import ProductCard from '@/components/ProductCard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';

const MenuPage = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  
  // In a real app, we would fetch restaurant data based on restaurantId
  // For now, just use the mock data
  
  return (
    <CartProvider restaurantId={restaurantId}>
      <MenuPageContent />
    </CartProvider>
  );
};

const MenuPageContent = () => {
  const { restaurant, categories, products, addOrder } = useRestaurant();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );
  
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const { 
    items: cartItems, 
    addToCart, 
    removeFromCart,
    updateQuantity, 
    totalAmount, 
    totalItems,
    clearCart
  } = useCart();

  // Filter products by selected category
  const filteredProducts = products.filter(
    (product) => !selectedCategory || product.categoryId === selectedCategory
  );
  
  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };
  
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone || (deliveryType === 'delivery' && !customerAddress)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Please add some items.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      const newOrder = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
          price: item.product.price,
          product: item.product
        })),
        status: 'pending' as OrderStatus,
        customerName,
        customerPhone,
        customerAddress: deliveryType === 'delivery' ? customerAddress : undefined,
        deliveryType,
        notes: orderNotes,
        totalAmount,
      };
      
      addOrder(newOrder);
      
      setOrderComplete(true);
      setIsSubmitting(false);
      
      // Reset checkout form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDeliveryType('delivery');
      setOrderNotes('');
      
      // Clear cart
      clearCart();
      
      // In a real app, we would also send the order via WhatsApp using Twilio API
      // and perform other backend operations
    }, 1500);
  };
  
  const handleCloseOrderComplete = () => {
    setOrderComplete(false);
    setIsCheckoutDialogOpen(false);
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading restaurant information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              {restaurant.logo && (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{restaurant.name}</h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{restaurant.openingHours}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>
                      Cart ({totalItems})
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md flex flex-col">
                  <SheetHeader>
                    <SheetTitle>Your Order</SheetTitle>
                    <SheetDescription>
                      Review your items before checkout.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <ScrollArea className="flex-1 pr-4">
                    {cartItems.length > 0 ? (
                      <div className="py-4 space-y-4">
                        {cartItems.map((item, index) => (
                          <CartItemCard
                            key={`${item.product.id}-${index}`}
                            item={item}
                            onRemove={() => removeFromCart(item.product.id)}
                            onUpdateQuantity={(qty) => updateQuantity(item.product.id, qty)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-gray-500">Your cart is empty.</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Add some delicious items from the menu!
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                  
                  <SheetFooter className="mt-auto border-t pt-4">
                    <div className="w-full">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>R$ {totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mb-4">
                        <span>Total</span>
                        <span>R$ {totalAmount.toFixed(2)}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg"
                        disabled={cartItems.length === 0}
                        onClick={() => setIsCheckoutDialogOpen(true)}
                      >
                        Checkout
                      </Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Info Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs 
          value={selectedCategory || categories[0]?.id} 
          onValueChange={setSelectedCategory as any}
          className="w-full mb-6"
        >
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="h-12 inline-flex">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products in this category.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {!orderComplete ? (
            <>
              <DialogHeader>
                <DialogTitle>Checkout</DialogTitle>
                <DialogDescription>
                  Complete your order information below.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCheckoutSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-base">Delivery Method *</Label>
                    <RadioGroup 
                      defaultValue="delivery" 
                      value={deliveryType}
                      onValueChange={(value) => setDeliveryType(value as 'pickup' | 'delivery')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery">Delivery</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">Pick up at restaurant</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {deliveryType === 'delivery' && (
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea
                        id="address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        required={deliveryType === 'delivery'}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions?"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Items ({totalItems})</span>
                      <span>R$ {totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Total</span>
                      <span>R$ {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-green-600">
                  Order Placed Successfully!
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <p className="mb-4">
                  Thank you for your order! We've sent your order to {restaurant.name}.
                </p>
                
                <p className="text-sm text-gray-600">
                  You'll receive confirmation via WhatsApp shortly.
                </p>
              </div>
              
              <DialogFooter>
                <Button onClick={handleCloseOrderComplete} className="w-full">
                  Back to Menu
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2">{restaurant.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{restaurant.description}</p>
            <p className="text-gray-600 text-sm">
              Powered by <span className="font-medium">ServeQuick</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
}) => {
  const handleIncrement = () => {
    onUpdateQuantity(item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1);
    } else {
      onRemove();
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b">
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
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-500 text-xs"
          >
            Remove
          </button>
        </div>

        {item.notes && (
          <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
        )}

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center border rounded">
            <button
              type="button"
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
              onClick={handleDecrement}
            >
              -
            </button>
            <span className="px-3">{item.quantity}</span>
            <button
              type="button"
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
              onClick={handleIncrement}
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
  );
};

export default MenuPage;
