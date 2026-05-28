import connectDB from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import { ApiException } from "@/backend/utils/api-response";
import { logger } from "@/backend/utils/logger";
import { ClientSession } from "mongoose";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StockItem {
  productId: string;
  quantity: number;
}

export interface ValidatedProduct {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  requestedQty: number;
}

/* ------------------------------------------------------------------ */
/*  validateStock                                                      */
/* ------------------------------------------------------------------ */

/**
 * Validates that every item in the list is in‑stock and active.
 * Returns an enriched array with product details for order building.
 *
 * Throws ApiException (400) with a descriptive message if any item fails.
 */
export async function validateStock(
  items: StockItem[]
): Promise<ValidatedProduct[]> {
  await connectDB();

  const validated: ValidatedProduct[] = [];

  for (const item of items) {
    const product = await Product.findById(item.productId).lean<IProduct>();

    if (!product) {
      throw new ApiException(
        `Product not found (id: ${item.productId})`,
        404
      );
    }

    if (!product.isActive) {
      throw new ApiException(
        `Product "${product.name}" is currently unavailable`,
        400
      );
    }

    if (product.stock < item.quantity) {
      throw new ApiException(
        `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${product.stock}`,
        400
      );
    }

    validated.push({
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      requestedQty: item.quantity,
    });
  }

  logger.info("validateStock – all items passed", { count: validated.length });
  return validated;
}

/* ------------------------------------------------------------------ */
/*  deductStock                                                        */
/* ------------------------------------------------------------------ */

/**
 * Atomically decrements stock for each item.
 * Uses `{ stock: { $gte: quantity } }` as a guard to prevent overselling
 * in concurrent scenarios (race‑condition safe).
 *
 * If a session is provided, all updates participate in its transaction.
 */
export async function deductStock(
  items: StockItem[],
  session?: ClientSession
): Promise<void> {
  await connectDB();

  for (const item of items) {
    const opts = session ? { session } : {};

    const result = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        stock: { $gte: item.quantity },
      },
      { $inc: { stock: -item.quantity } },
      { new: true, ...opts }
    );

    if (!result) {
      // Either the product disappeared or another request drained the stock
      throw new ApiException(
        `Failed to deduct stock for product "${item.productId}". ` +
          `The requested quantity (${item.quantity}) may no longer be available.`,
        409 // Conflict – client should retry
      );
    }

    logger.debug("deductStock", {
      productId: item.productId,
      deducted: item.quantity,
      remainingStock: result.stock,
    });
  }

  logger.info("deductStock – complete", { itemCount: items.length });
}

/* ------------------------------------------------------------------ */
/*  restoreStock                                                       */
/* ------------------------------------------------------------------ */

/**
 * Reverses a previous deduction — adds quantity back to each product.
 * Used when an order is cancelled.
 */
export async function restoreStock(items: StockItem[]): Promise<void> {
  await connectDB();

  for (const item of items) {
    const result = await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: item.quantity } },
      { new: true }
    );

    if (!result) {
      // Product may have been deleted; log and continue (best effort)
      logger.warn("restoreStock – product not found, skipping", {
        productId: item.productId,
      });
      continue;
    }

    logger.debug("restoreStock", {
      productId: item.productId,
      restored: item.quantity,
      newStock: result.stock,
    });
  }

  logger.info("restoreStock – complete", { itemCount: items.length });
}
