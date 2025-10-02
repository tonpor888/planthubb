import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { firestore } from "../../lib/firebaseClient";
import type { CartItem } from "../../store/cartStore";
import type { CheckoutAddress, PaymentMethod } from "../../types/cart";

export type OrderStatus = "pending" | "awaiting_payment" | "paid" | "processing" | "shipping" | "completed" | "cancelled" | "refunded";

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId?: string;
}

export interface CreateOrderPayload {
  buyerId: string;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string | null;
  total: number;
  paymentMethod: PaymentMethod;
  shippingAddress: CheckoutAddress;
  paymentProofUrl?: string | null;
}

const ORDERS_COLLECTION = "orders";

export async function createOrder(payload: CreateOrderPayload) {
  const orderRef = doc(collection(firestore, ORDERS_COLLECTION));

  const orderItems: OrderItemSnapshot[] = payload.cartItems.map((item) => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    sellerId: item.sellerId,
  }));

  const now = new Date();
  const orderData = {
    id: orderRef.id,
    buyerId: payload.buyerId,
    items: orderItems,
    subtotal: payload.subtotal,
    discountAmount: payload.discountAmount,
    discountCode: payload.discountCode ?? null,
    total: payload.total,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === "cod" ? "pending" as const : "awaiting_confirmation" as const,
    paymentProofUrl: payload.paymentProofUrl ?? null,
    shippingAddress: payload.shippingAddress,
    status: "pending" as OrderStatus,
    statusLogs: [
      {
        status: "pending" as OrderStatus,
        message: "สั่งซื้อสำเร็จ กำลังรอการยืนยัน",
        createdAt: now,
      },
    ],
    sellerIds: [...new Set(orderItems.map(item => item.sellerId).filter(Boolean))],
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(orderRef, orderData);

  return orderRef;
}

