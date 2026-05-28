import { Router, Request, Response, NextFunction } from "express";
import * as productController from "../controllers/product.controller";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

router.get("/", asyncHandler(productController.getProducts));
router.get("/search", asyncHandler(productController.getProducts)); // Also mapped to getProducts search filters
router.get("/category/:category", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Pass category to getProducts query parameters dynamically
  req.query.category = req.params.category;
  req.query.limit = "50"; // default high limit for category view
  await productController.getProducts(req, res, next);
}));
router.get("/:productId", asyncHandler(productController.getProductById));

export default router;
