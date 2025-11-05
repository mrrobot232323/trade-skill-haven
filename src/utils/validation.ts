import { z } from 'zod';

// Authentication validation - separate schemas for login and signup
export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(128, { message: "Password must be less than 128 characters" })
});

export const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(128, { message: "Password must be less than 128 characters" }),
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100, { message: "Name must be less than 100 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.confirmPassword === data.password, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Legacy schema for backward compatibility
export const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(128, { message: "Password must be less than 128 characters" }),
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100, { message: "Name must be less than 100 characters" }).optional().or(z.literal('')),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.confirmPassword && data.confirmPassword !== data.password) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Message validation
export const messageSchema = z.object({
  text: z.string().trim().min(1, { message: "Message cannot be empty" }).max(1000, { message: "Message must be less than 1000 characters" })
});

// Profile update validation
export const profileSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100, { message: "Name must be less than 100 characters" }),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
  location: z.string().max(100, { message: "Location must be less than 100 characters" }).optional(),
  profilePicture: z.string().url({ message: "Profile picture must be a valid URL" }).optional().or(z.literal(''))
});

// Skill validation
export const skillSchema = z.object({
  name: z.string().trim().min(2, { message: "Skill name must be at least 2 characters" }).max(100, { message: "Skill name must be less than 100 characters" }),
  description: z.string().max(500, { message: "Description must be less than 500 characters" }).optional(),
  category: z.string().trim().min(2, { message: "Category must be at least 2 characters" }).max(50, { message: "Category must be less than 50 characters" })
});

export type AuthFormData = z.infer<typeof authSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type SkillData = z.infer<typeof skillSchema>;
