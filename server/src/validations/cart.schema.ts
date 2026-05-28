import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addToCartSchema = z.object({
  productId: z
    .string()
    .regex(objectIdRegex, "Invalid Product ID format")
    .trim(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1"),
  size: z
    .string()
    .min(1, "Size is required")
    .trim()
    .optional(), // Make optional since frontend might not provide it
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1"), // Quantity must be positive to update
  size: z
    .string()
    .min(1, "Size is required")
    .trim()
    .optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
