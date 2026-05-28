import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticateRequest } from "../middleware/auth.middleware";
import { rateLimiter } from "../middleware/rate-limiter";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

// All order routes require authentication
router.use(authenticateRequest);

router.post("/", rateLimiter(10, 60_000), asyncHandler(orderController.createOrder));
router.get("/", asyncHandler(orderController.getOrders));
router.get("/:id", asyncHandler(orderController.getOrderById));
router.put("/:id", asyncHandler(orderController.cancelOrder));

export default router;
