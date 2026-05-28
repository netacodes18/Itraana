import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";

/**
 * Get all active products with pagination, filtering, search, and sorting.
 */
export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "12", 10);
  const category = (req.query.category as string) || undefined;
  const search = (req.query.search as string) || undefined;
  
  const minPriceStr = req.query.minPrice as string;
  const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;

  const maxPriceStr = req.query.maxPrice as string;
  const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;

  const sortBy = (req.query.sortBy as any) || "newest";
  
  const featuredStr = req.query.featured as string;
  const featured = featuredStr === "true" ? true : featuredStr === "false" ? false : undefined;

  const result = await productService.getAllProducts({
    page,
    limit,
    category,
    search,
    minPrice,
    maxPrice,
    sortBy,
    featured,
  });

  const productsWithId = result.products.map((p: any) => ({
    ...p,
    id: p._id.toString(),
  }));

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: { ...result, products: productsWithId },
  });
}

/**
 * Get a single product by ID.
 */
export async function getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { productId } = req.params;

  const product = await productService.getProductById(productId);
  const productWithId = {
    ...(product as any),
    id: (product as any)._id.toString(),
  };

  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: productWithId,
  });
}

/**
 * Get a single product by its slug.
 */
export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { slug } = req.params;

  const product = await productService.getProductBySlug(slug);
  const productWithId = {
    ...(product as any),
    id: (product as any)._id.toString(),
  };

  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: productWithId,
  });
}
