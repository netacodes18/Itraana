import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { registerSchema, loginSchema } from "../validations/auth.schema";
import { updateProfileSchema } from "../validations/profile.schema";
import { ApiException } from "../utils/api-response";

const JWT_SECRET = process.env.JWT_SECRET || "itraana_super_secret_key";
const JWT_EXPIRES_IN = "7d";

/**
 * Generate a JWT token for the user.
 */
function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * User registration controller.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await User.findOne({ email: validatedData.email });
  if (existingUser) {
    throw new ApiException("User with this email already exists", 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(validatedData.password, salt);

  // Create user
  const newUser = await User.create({
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    email: validatedData.email,
    password: hashedPassword,
    cart: [],
    wishlist: [],
  });

  const token = generateToken(newUser._id.toString());

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
      token,
    },
  });
}

/**
 * User login controller.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Validate credentials
  const validatedData = loginSchema.parse(req.body);

  // Find user
  const user = await User.findOne({ email: validatedData.email });
  if (!user) {
    throw new ApiException("Invalid email or password", 401);
  }

  // Verify password
  const isMatch = await bcrypt.compare(validatedData.password, user.password || "");
  if (!isMatch) {
    throw new ApiException("Invalid email or password", 401);
  }

  const token = generateToken(user._id.toString());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token,
    },
  });
}

/**
 * Fetch profile controller.
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;

  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  const profileData = {
    ...(user as any),
    id: (user as any)._id.toString(),
  };

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: profileData,
  });
}

/**
 * Update profile controller.
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;

  // Validate partial update
  const validatedData = updateProfileSchema.parse(req.body);

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  // If email is changing, ensure it's unique
  if (validatedData.email && validatedData.email !== user.email) {
    const emailExists = await User.findOne({ email: validatedData.email });
    if (emailExists) {
      throw new ApiException("Email is already taken", 400);
    }
    user.email = validatedData.email;
  }

  if (validatedData.firstName) user.firstName = validatedData.firstName;
  if (validatedData.lastName) user.lastName = validatedData.lastName;

  await user.save();

  const profileData = {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: profileData,
  });
}
