import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authenticateRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

// All cart routes require authentication
router.use(authenticateRequest);

router.get("/", asyncHandler(cartController.getCart));
router.post("/", asyncHandler(cartController.addToCart));
router.put("/:productId", asyncHandler(cartController.updateCartItem));
router.delete("/:productId", asyncHandler(cartController.removeFromCart));
router.delete("/", asyncHandler(cartController.clearCart));

export default router;
