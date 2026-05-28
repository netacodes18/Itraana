import connectDB from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import { ApiException } from "@/backend/utils/api-response";
import { logger } from "@/backend/utils/logger";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GetAllProductsOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
  featured?: boolean;
}

export interface PaginatedProducts {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*  getAllProducts                                                      */
/* ------------------------------------------------------------------ */

export async function getAllProducts(
  options: GetAllProductsOptions = {}
): Promise<PaginatedProducts> {
  await connectDB();

  const {
    page = 1,
    limit = 12,
    category,
    search,
    minPrice,
    maxPrice,
    sortBy = "newest",
    featured,
  } = options;

  // ---------- Build filter ----------
  const filter: Record<string, unknown> = { isActive: true };

  if (category) {
    filter.category = category;
  }

  if (typeof featured === "boolean") {
    filter.featured = featured;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) (filter.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (filter.price as Record<string, number>).$lte = maxPrice;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  // ---------- Build sort ----------
  let sort: Record<string, 1 | -1 | { $meta: "textScore" }> = {};

  switch (sortBy) {
    case "price_asc":
      sort = { price: 1 };
      break;
    case "price_desc":
      sort = { price: -1 };
      break;
    case "oldest":
      sort = { createdAt: 1 };
      break;
    case "newest":
    default:
      sort = { createdAt: -1 };
      break;
  }

  // When doing text search without an explicit sort, rank by relevance
  if (search && sortBy === "newest") {
    sort = { score: { $meta: "textScore" }, createdAt: -1 };
  }

  // ---------- Query ----------
  const skip = (page - 1) * limit;

  const projection = search ? { score: { $meta: "textScore" } } : {};

  const [products, total] = await Promise.all([
    Product.find(filter, projection).sort(sort).skip(skip).limit(limit).lean<IProduct[]>(),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  logger.info("getAllProducts", { total, page, totalPages, category, search });

  return { products, total, page, totalPages };
}

/* ------------------------------------------------------------------ */
/*  getProductById                                                     */
/* ------------------------------------------------------------------ */

export async function getProductById(id: string): Promise<IProduct> {
  await connectDB();

  const product = await Product.findById(id).lean<IProduct>();

  if (!product) {
    throw new ApiException(`Product not found with id: ${id}`, 404);
  }

  logger.debug("getProductById", { id });
  return product;
}

/* ------------------------------------------------------------------ */
/*  getProductBySlug                                                   */
/* ------------------------------------------------------------------ */

export async function getProductBySlug(slug: string): Promise<IProduct> {
  await connectDB();

  const product = await Product.findOne({ slug }).lean<IProduct>();

  if (!product) {
    throw new ApiException(`Product not found with slug: ${slug}`, 404);
  }

  logger.debug("getProductBySlug", { slug });
  return product;
}

/* ------------------------------------------------------------------ */
/*  searchProducts                                                     */
/* ------------------------------------------------------------------ */

export async function searchProducts(query: string): Promise<IProduct[]> {
  await connectDB();

  if (!query || query.trim().length === 0) {
    return [];
  }

  const products = await Product.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(20)
    .lean<IProduct[]>();

  logger.info("searchProducts", { query, resultCount: products.length });
  return products;
}
