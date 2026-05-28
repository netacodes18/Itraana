import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { logger } from "./utils/logger";
import { globalErrorHandler } from "./middleware/error-handler";

// Route imports
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import userRoutes from "./routes/user.routes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().catch((err) => {
  logger.error("Database connection failed during app startup", err);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for flexibility, configure specific domains in production
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log Requests
app.use((req, res, next) => {
  logger.info(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);

// Root Ping Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
