import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiException } from "../utils/api-response";

const JWT_SECRET = process.env.JWT_SECRET || "itraana_super_secret_key";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Express middleware to authenticate request using JWT from Authorization header.
 * Attaches the authenticated user's ID to `req.userId`.
 */
export function authenticateRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiException("Authentication required. Please provide a valid token.", 401)
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiException("Authentication required. Token is missing.", 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded?.id) {
      return next(new ApiException("Invalid token payload.", 401));
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiException("Token has expired. Please login again.", 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiException("Invalid token. Please login again.", 401));
    }

    next(new ApiException("Authentication failed.", 401));
  }
}
