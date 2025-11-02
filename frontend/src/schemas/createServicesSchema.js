import { z } from "zod";

export const createServicesSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  price: z.preprocess(
    (val) => Number(val),
    z.number().nonnegative("Enter a valid non-negative number")
  ),
  image: z
    .instanceof(File, { message: "Image is required" })
    .refine((file) => file.type.startsWith("image/"), {
      message: "Only image files are allowed",
    }),
});