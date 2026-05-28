import { Request, Response, NextFunction } from "express";
import * as cartService from "../services/cart.service";
import { addToCartSchema, updateCartItemSchema } from "../validations/cart.schema";
import Product from "../models/Product";

/**
 * Get current user's cart.
 */
export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const cartItems = await cartService.getCart(userId);
  res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    data: cartItems,
  });
}

/**
 * Add an item to the cart.
 */
export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const validatedData = addToCartSchema.parse(req.body);

  // If size is not provided, query the product to use its first available size
  let size = validatedData.size;
  if (!size) {
    const product = await Product.findById(validatedData.productId).lean();
    size = product?.sizes?.[0] || "6ml";
  }

  const updatedCart = await cartService.addToCart(
    userId,
    validatedData.productId,
    validatedData.quantity,
    size
  );

  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    data: updatedCart,
  });
}

/**
 * Update an item's quantity or size in the cart.
 */
export async function updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const { productId } = req.params;

  const validatedData = updateCartItemSchema.parse(req.body);

  const updatedCart = await cartService.updateCartItem(
    userId,
    productId,
    validatedData.quantity,
    validatedData.size
  );

  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: updatedCart,
  });
}

/**
 * Remove an item from the cart.
 */
export async function removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const { productId } = req.params;

  const updatedCart = await cartService.removeFromCart(userId, productId);

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: updatedCart,
  });
}

/**
 * Clear the user's cart.
 */
export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  await cartService.clearCart(userId);
  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: null,
  });
}
