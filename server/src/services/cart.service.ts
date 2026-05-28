import connectDB from "@/lib/db";
import User, { ICartItem } from "@/models/User";
import Product from "@/models/Product";
import { ApiException } from "@/backend/utils/api-response";
import { logger } from "@/backend/utils/logger";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PopulatedCartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    sizes: string[];
  };
  quantity: number;
  size: string;
}

/* ------------------------------------------------------------------ */
/*  getCart                                                             */
/* ------------------------------------------------------------------ */

export async function getCart(userId: string): Promise<PopulatedCartItem[]> {
  await connectDB();

  const user = await User.findById(userId)
    .populate({
      path: "cart.productId",
      select: "name price image stock sizes isActive",
      model: Product,
    })
    .lean();

  if (!user) {
    throw new ApiException("User not found", 404);
  }

  // Filter out any cart items whose products have been deleted or deactivated
  const validItems = (user.cart as unknown as PopulatedCartItem[]).filter(
    (item) => item.productId && (item.productId as any).isActive !== false
  );

  logger.debug("getCart", { userId, itemCount: validItems.length });
  return validItems;
}

/* ------------------------------------------------------------------ */
/*  addToCart                                                           */
/* ------------------------------------------------------------------ */

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
  size: string
): Promise<ICartItem[]> {
  await connectDB();

  // 1. Validate product
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new ApiException("Product not found", 404);
  }
  if (!product.isActive) {
    throw new ApiException("This product is currently unavailable", 400);
  }

  // 2. Validate size
  if (!product.sizes.includes(size)) {
    throw new ApiException(
      `Size "${size}" is not available. Available sizes: ${product.sizes.join(", ")}`,
      400
    );
  }

  // 3. Validate stock
  if (product.stock < quantity) {
    throw new ApiException(
      `Insufficient stock for "${product.name}". Available: ${product.stock}`,
      400
    );
  }

  // 4. Fetch user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  // 5. Check if product + size combo already in cart
  const existingIndex = user.cart.findIndex(
    (item) => item.productId.toString() === productId && item.size === size
  );

  if (existingIndex !== -1) {
    // Update quantity, cap at stock
    const newQty = Math.min(user.cart[existingIndex].quantity + quantity, product.stock);
    user.cart[existingIndex].quantity = newQty;
    logger.info("addToCart – updated existing item", { userId, productId, size, newQty });
  } else {
    user.cart.push({
      productId: product._id,
      quantity,
      size,
    } as ICartItem);
    logger.info("addToCart – added new item", { userId, productId, size, quantity });
  }

  await user.save();
  return user.cart;
}

/* ------------------------------------------------------------------ */
/*  updateCartItem                                                     */
/* ------------------------------------------------------------------ */

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number,
  size?: string
): Promise<ICartItem[]> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  const cartItem = user.cart.find(
    (item) => item.productId.toString() === productId
  );
  if (!cartItem) {
    throw new ApiException("Item not found in cart", 404);
  }

  // Validate stock
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new ApiException("Product no longer exists", 404);
  }

  if (quantity > product.stock) {
    throw new ApiException(
      `Cannot set quantity to ${quantity}. Only ${product.stock} in stock for "${product.name}"`,
      400
    );
  }

  if (quantity <= 0) {
    throw new ApiException("Quantity must be at least 1. Use removeFromCart to delete.", 400);
  }

  // Validate size if being changed
  if (size !== undefined) {
    if (!product.sizes.includes(size)) {
      throw new ApiException(
        `Size "${size}" is not available. Available sizes: ${product.sizes.join(", ")}`,
        400
      );
    }
    cartItem.size = size;
  }

  cartItem.quantity = quantity;

  await user.save();

  logger.info("updateCartItem", { userId, productId, quantity, size });
  return user.cart;
}

/* ------------------------------------------------------------------ */
/*  removeFromCart                                                     */
/* ------------------------------------------------------------------ */

export async function removeFromCart(
  userId: string,
  productId: string
): Promise<ICartItem[]> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  const initialLength = user.cart.length;
  user.cart = user.cart.filter(
    (item) => item.productId.toString() !== productId
  ) as typeof user.cart;

  if (user.cart.length === initialLength) {
    throw new ApiException("Item not found in cart", 404);
  }

  await user.save();

  logger.info("removeFromCart", { userId, productId });
  return user.cart;
}

/* ------------------------------------------------------------------ */
/*  clearCart                                                           */
/* ------------------------------------------------------------------ */

export async function clearCart(userId: string): Promise<void> {
  await connectDB();

  const result = await User.findByIdAndUpdate(userId, { cart: [] });
  if (!result) {
    throw new ApiException("User not found", 404);
  }

  logger.info("clearCart", { userId });
}
