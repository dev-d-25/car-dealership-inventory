import { z } from "zod"

export const vehicleCategories = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
] as const

export type VehicleCategory = (typeof vehicleCategories)[number]

export const createVehicleSchema = z.object({
  maker: z.string().min(1, "Maker is required"),
  model: z.string().min(1, "Model is required"),
  category: z.enum(vehicleCategories, {
    error: "Invalid category",
  }),
  price: z.coerce.number().positive("Price must be greater than 0"),
  quantity: z.coerce
    .number()
    .int()
    .min(0, "Quantity cannot be negative")
    .default(0),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
})

export const updateVehicleSchema = createVehicleSchema.partial()

export const searchVehicleSchema = z.object({
  maker: z.string().optional(),
  model: z.string().optional(),
  category: z.enum(vehicleCategories).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["price", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
})

export const listVehicleSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
})

export const restockVehicleSchema = z.object({
  amount: z.coerce.number().int().positive("Amount must be greater than 0"),
})

export const vehicleSchema = z.object({
  id: z.string(),
  maker: z.string(),
  model: z.string(),
  category: z.string(),
  price: z.number(),
  quantity: z.number().int(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  emailVerified: z.boolean().optional(),
  image: z.string().nullable().optional(),
})

export const paginationSchema = z.object({
  currentPage: z.number().int(),
  total: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
})

export const paginatedVehicleSchema = z.object({
  success: z.boolean(),
  data: z.array(vehicleSchema),
  pagination: paginationSchema,
})

export const singleVehicleSchema = z.object({
  success: z.boolean(),
  data: vehicleSchema,
})

export const singleUserSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: userSchema,
  }),
})

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

export type Vehicle = z.infer<typeof vehicleSchema>
export type User = z.infer<typeof userSchema>
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
