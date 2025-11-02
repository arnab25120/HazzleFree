import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password is required" }),
    contactNumber: z
      .string()
      .regex(/^[0-9]{10}$/, { message: "Contact number must be exactly 10 digits" }),
    role: z.enum(["consumer", "provider"], { required_error: "Role is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
