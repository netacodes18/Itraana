import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as userController from "../controllers/user.controller";
import * as orderController from "../controllers/order.controller";
import { authenticateRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

// All user routes require authentication
router.use(authenticateRequest);

// Profile
router.get("/profile", asyncHandler(authController.getProfile));
router.put("/profile", asyncHandler(authController.updateProfile));

// Orders (for user order history compatibility)
router.get("/orders", asyncHandler(orderController.getOrders));

// Wishlist
router.get("/wishlist", asyncHandler(userController.getWishlist));
router.post("/wishlist", asyncHandler(userController.addToWishlist));
router.delete("/wishlist/:productId", asyncHandler(userController.removeFromWishlist));

export default router;
