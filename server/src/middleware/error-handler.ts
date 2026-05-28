import { Request, Response, NextFunction } from "express";
import { ApiException } from "../utils/api-response";
import { logger } from "../utils/logger";
import { ZodError } from "zod";

/**
 * Express wrapper for async route handlers.
 * Ensures all async errors are caught and forwarded to the Express error middleware.
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Express global error-handling middleware.
 * Catches all errors from handlers and returns standardized JSON responses.
 */
export function globalErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { method, originalUrl } = req;
  logger.error(`[API ERROR] ${method} ${originalUrl} failed`, error);

  // Handle custom ApiException
  if (error instanceof ApiException) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors.length > 0 ? error.errors : undefined,
    });
    return;
  }

  // Handle Zod Validation Errors
  if (error instanceof ZodError) {
    const errorMessages = error.issues.map(
      (err: any) => `${err.path.join(".")}: ${err.message}`
    );
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
    return;
  }

  // Handle Mongoose / MongoDB Validation Errors
  if (error.name === "ValidationError") {
    const errors = Object.keys(error.errors).map(
      (key) => `${key}: ${error.errors[key].message}`
    );
    res.status(400).json({
      success: false,
      message: "Database validation failed",
      errors,
    });
    return;
  }

  // Handle Mongoose CastError
  if (error.name === "CastError") {
    res.status(400).json({
      success: false,
      message: `Invalid format for field: ${error.path}`,
    });
    return;
  }

  // Handle MongoDB Duplicate Key (11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    res.status(400).json({
      success: false,
      message: `Duplicate value entered for field: ${field}`,
    });
    return;
  }

  // Generic fallback for unhandled exceptions
  const message =
    process.env.NODE_ENV === "development"
      ? error.message
      : "Internal Server Error";
  res.status(500).json({
    success: false,
    message,
  });
}
