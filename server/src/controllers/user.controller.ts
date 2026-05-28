import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Product from "../models/Product";
import { ApiException } from "../utils/api-response";

/**
 * Get user's wishlist from MongoDB.
 */
export async function getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;

  const user = await User.findById(userId)
    .populate({
      path: "wishlist",
      model: Product,
    })
    .lean();

  if (!user) {
    throw new ApiException("User not found", 404);
  }

  // Map _id to id for frontend compatibility
  const wishlistItems = (user.wishlist || []).filter(Boolean).map((p: any) => ({
    ...p,
    id: p._id.toString(),
  }));

  res.status(200).json(wishlistItems);
}

/**
 * Add a product to the user's wishlist.
 */
export async function addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const { productId } = req.body;

  if (!productId) {
    throw new ApiException("Product ID required", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  const productExists = await Product.exists({ _id: productId });
  if (!productExists) {
    throw new ApiException("Product not found", 404);
  }

  const alreadyInWishlist = user.wishlist.some(
    (id) => id.toString() === productId.toString()
  );

  if (!alreadyInWishlist) {
    user.wishlist.push(productId as any);
    await user.save();
  }

  res.status(200).json({ success: true, wishlist: user.wishlist });
}

/**
 * Remove a product from the user's wishlist.
 */
export async function removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;
  const { productId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  ) as any;

  await user.save();

  res.status(200).json({ success: true, wishlist: user.wishlist });
}
