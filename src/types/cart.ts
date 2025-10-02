export type CheckoutAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  district: string;
  province: string;
  postalCode: string;
};

export type PaymentMethod = "cod" | "credit" | "promptpay" | "bank_transfer";

export type DiscountCode = {
  code: string;
  percentage: number;
  description?: string;
  expiresAt?: Date;
};


