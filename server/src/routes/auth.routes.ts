import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticateRequest } from "../middleware/auth.middleware";
import { rateLimiter } from "../middleware/rate-limiter";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

// Auth routes wrapped in asyncHandler
router.post("/signup", rateLimiter(15, 60_000), asyncHandler(authController.register));
router.post("/login", rateLimiter(15, 60_000), asyncHandler(authController.login));
router.get("/me", authenticateRequest, asyncHandler(authController.getProfile));
router.post("/logout", (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export default router;
