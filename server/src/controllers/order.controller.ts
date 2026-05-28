import { Request, Response, NextFunction } from "express";
import * as orderService from "../services/order.service";
import { checkoutSchema } from "../validations/checkout.schema";

/**
 * Place a new order (checkout).
 */
export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  
  // Validate shipping details and payment method
  const validatedData = checkoutSchema.parse(req.body);

  const order = await orderService.createOrder(
    userId,
    validatedData.shippingAddress,
    validatedData.paymentMethod,
    validatedData.giftMessage,
    validatedData.deliveryPreferences
  );

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
}

/**
 * Get all orders for the authenticated user.
 */
export async function getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "10", 10);

  const result = await orderService.getOrdersByUser(userId, page, limit);
  
  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
}

/**
 * Get a specific order by ID.
 */
export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const order = await orderService.getOrderById(id, userId);
  
  res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    data: order,
  });
}

/**
 * Cancel an order.
 */
export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const cancelledOrder = await orderService.cancelOrder(id, userId);

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    data: cancelledOrder,
  });
}
