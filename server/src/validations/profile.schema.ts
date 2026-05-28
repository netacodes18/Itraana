import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name must be at least 1 character")
    .max(50, "Last name cannot exceed 50 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
