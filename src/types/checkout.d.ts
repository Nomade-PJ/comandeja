// Tipos específicos para o checkout
import { CartItem } from '../contexts/CartContext';
import { OrderItem } from '../components/ui/order-receipt';

// Tipagem explícita para mapeamento entre CartItem e OrderItem
declare global {
  interface CartItemToOrderItem {
    (item: CartItem): OrderItem;
  }
} 