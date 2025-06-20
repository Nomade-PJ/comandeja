import { formatCurrency } from "@/lib/utils";
import { Card } from "./card";
import { Separator } from "./separator";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderReceiptProps {
  orderNumber: string;
  items: OrderItem[];
  customerName: string;
  deliveryAddress?: string;
  deliveryMethod: "delivery" | "pickup";
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  restaurantName: string;
  orderDate: Date;
}

export function OrderReceipt({
  orderNumber,
  items,
  customerName,
  deliveryAddress,
  deliveryMethod,
  paymentMethod,
  subtotal,
  deliveryFee,
  total,
  restaurantName,
  orderDate,
}: OrderReceiptProps) {
  return (
    <Card className="p-6 border-dashed border-2 bg-white">
      <div className="mb-4 text-center">
        <h3 className="font-bold text-lg">{restaurantName}</h3>
        <p className="text-sm text-gray-500">
          {new Date(orderDate).toLocaleDateString()} •{" "}
          {new Date(orderDate).toLocaleTimeString()}
        </p>
      </div>

      <Separator className="my-4" />
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Pedido:</span>
          <span>#{orderNumber}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Cliente:</span>
          <span>{customerName}</span>
        </div>
        {deliveryMethod === "delivery" && deliveryAddress && (
          <div className="flex justify-between">
            <span className="font-semibold">Endereço:</span>
            <span className="text-right max-w-[200px]">{deliveryAddress}</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="mb-6">
        <div className="font-semibold mb-2">Itens:</div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <div>
                <span className="font-medium">{item.quantity}x</span> {item.name}
              </div>
              <div className="font-medium">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {deliveryMethod === "delivery" && (
          <div className="flex justify-between mb-2">
            <span>Taxa de entrega</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg mt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Método de entrega:</span>
          <span>
            {deliveryMethod === "delivery" ? "Entrega" : "Retirada no local"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Pagamento:</span>
          <span>
            {paymentMethod === "credit_card"
              ? "Cartão de crédito"
              : paymentMethod === "debit_card"
              ? "Cartão de débito"
              : paymentMethod === "pix"
              ? "PIX"
              : paymentMethod === "cash"
              ? "Dinheiro"
              : "Vale-refeição"}
          </span>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Agradecemos a sua preferência!</p>
        <p>ComAndeJá - A melhor forma de pedir online</p>
      </div>
    </Card>
  );
} 