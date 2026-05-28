import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number cannot exceed 15 characters")
    .trim(),
  street: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .trim(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .trim(),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .trim(),
  pinCode: z
    .string()
    .regex(/^\d{6}$/, "Pin code must be exactly 6 digits")
    .trim(),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z
    .enum(["cod", "card", "upi"] as const, {
      message: "Payment method must be 'cod', 'card', or 'upi'",
    })
    .default("cod"),
  giftMessage: z
    .string()
    .max(500, "Gift message cannot exceed 500 characters")
    .optional(),
  deliveryPreferences: z
    .string()
    .max(200, "Delivery preferences cannot exceed 200 characters")
    .optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
