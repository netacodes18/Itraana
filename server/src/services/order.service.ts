import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order, { IOrder, IOrderItem } from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { ApiException } from "@/backend/utils/api-response";
import { logger } from "@/backend/utils/logger";
import * as inventoryService from "@/backend/services/inventory.service";
import * as paymentService from "@/backend/services/payment.service";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PaginatedOrders {
  orders: IOrder[];
  total: number;
  page: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*  createOrder                                                        */
/* ------------------------------------------------------------------ */

/**
 * Full checkout orchestrator:
 *
 * 1. Fetch + validate cart
 * 2. Validate stock (pre‑flight)
 * 3. Compute totals SERVER‑SIDE (never trust frontend)
 * 4. Build snapshot order items from DB product data
 * 5. Run everything inside a Mongo transaction:
 *    - Create Order document
 *    - Atomically deduct stock
 *    - Clear user's cart
 * 6. Process payment (mock / COD)
 * 7. Return created order
 */
export async function createOrder(
  userId: string,
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  },
  paymentMethod: string,
  giftMessage?: string,
  deliveryPreferences?: string
): Promise<IOrder> {
  await connectDB();

  /* ---- 1. Fetch user + populated cart ---- */
  const user = await User.findById(userId).populate({
    path: "cart.productId",
    select: "name price image stock sizes isActive",
    model: Product,
  });

  if (!user) {
    throw new ApiException("User not found", 404);
  }

  if (!user.cart || user.cart.length === 0) {
    throw new ApiException("Your cart is empty. Add items before checking out.", 400);
  }

  /* ---- 2. Build stock validation list ---- */
  const stockItems = user.cart.map((item) => ({
    productId: item.productId.toString(),
    quantity: item.quantity,
  }));

  // Pre‑flight stock check (throws on failure)
  await inventoryService.validateStock(stockItems);

  /* ---- 3 & 4. Compute totals + build snapshot items ---- */
  const orderItems: IOrderItem[] = [];
  let totalAmount = 0;

  for (const cartItem of user.cart) {
    // cartItem.productId is populated — cast to the product fields we need
    const product = cartItem.productId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      price: number;
      image: string;
      stock: number;
      sizes: string[];
      isActive: boolean;
    };

    const subtotal = product.price * cartItem.quantity;
    totalAmount += subtotal;

    orderItems.push({
      productId: product._id,
      name: product.name,
      image: product.image,
      size: cartItem.size,
      quantity: cartItem.quantity,
      priceAtCheckout: product.price,
      subtotal,
    } as IOrderItem);
  }

  /* ---- 5. Transaction: create order → deduct stock → clear cart ---- */
  const session = await mongoose.startSession();
  let createdOrder: IOrder;

  try {
    session.startTransaction();

    // 5a. Create order
    const [order] = await Order.create(
      [
        {
          userId: user._id,
          items: orderItems,
          totalAmount,
          shippingAddress,
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
          orderStatus: "processing",
          giftMessage,
          deliveryPreferences,
        },
      ],
      { session }
    );

    // 5b. Atomically deduct stock inside the same transaction
    await inventoryService.deductStock(stockItems, session);

    // 5c. Clear user cart
    await User.findByIdAndUpdate(userId, { cart: [] }, { session });

    await session.commitTransaction();
    createdOrder = order;

    logger.info("createOrder – transaction committed", {
      orderId: order._id,
      userId,
      totalAmount,
      itemCount: orderItems.length,
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error("createOrder – transaction aborted", error);

    // Re‑throw if it's already an ApiException
    if (error instanceof ApiException) throw error;
    throw new ApiException("Order creation failed. Please try again.", 500);
  } finally {
    session.endSession();
  }

  /* ---- 6. Process payment (mock for COD) ---- */
  try {
    const intent = await paymentService.processPayment(
      paymentMethod,
      totalAmount,
      createdOrder._id.toString()
    );

    // Persist payment reference
    createdOrder.paymentId = intent.id;
    if (paymentMethod === "cod") {
      createdOrder.paymentStatus = "pending"; // COD is paid on delivery
    }
    await createdOrder.save();
  } catch (paymentError) {
    // Payment processing is non‑critical for COD; log and continue
    logger.warn("createOrder – payment processing failed (non‑critical)", paymentError);
  }

  /* ---- 7. Return ---- */
  return createdOrder;
}

/* ------------------------------------------------------------------ */
/*  getOrdersByUser                                                    */
/* ------------------------------------------------------------------ */

export async function getOrdersByUser(
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedOrders> {
  await connectDB();

  const filter = { userId };
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<IOrder[]>(),
    Order.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  logger.info("getOrdersByUser", { userId, total, page, totalPages });
  return { orders, total, page, totalPages };
}

/* ------------------------------------------------------------------ */
/*  getOrderById                                                       */
/* ------------------------------------------------------------------ */

export async function getOrderById(
  orderId: string,
  userId: string
): Promise<IOrder> {
  await connectDB();

  const order = await Order.findById(orderId).lean<IOrder>();

  if (!order) {
    throw new ApiException("Order not found", 404);
  }

  // Ownership check — only the order owner (or admin in the future) can view
  if (order.userId.toString() !== userId) {
    throw new ApiException("You are not authorised to view this order", 403);
  }

  logger.debug("getOrderById", { orderId, userId });
  return order;
}

/* ------------------------------------------------------------------ */
/*  cancelOrder                                                        */
/* ------------------------------------------------------------------ */

export async function cancelOrder(
  orderId: string,
  userId: string
): Promise<IOrder> {
  await connectDB();

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiException("Order not found", 404);
  }

  if (order.userId.toString() !== userId) {
    throw new ApiException("You are not authorised to cancel this order", 403);
  }

  if (order.orderStatus !== "processing") {
    throw new ApiException(
      `Cannot cancel an order with status "${order.orderStatus}". Only orders in "processing" status can be cancelled.`,
      400
    );
  }

  // Restore stock for all items
  const restoreItems = order.items.map((item) => ({
    productId: item.productId.toString(),
    quantity: item.quantity,
  }));

  await inventoryService.restoreStock(restoreItems);

  // Update order status
  order.orderStatus = "cancelled";
  if (order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
  }
  await order.save();

  logger.info("cancelOrder", { orderId, userId, restoredItems: restoreItems.length });
  return order;
}
