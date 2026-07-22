import { z } from "zod";

export const vehicleCategoryEnum = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
] as const;

export type VehicleCategory = (typeof vehicleCategoryEnum)[number];

export const createVehicleSchema = z.object({
  maker: z.string().min(1, "Maker is required"),
  model: z.string().min(1, "Model is required"),
  category: z.enum(vehicleCategoryEnum, {
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
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const listVehicleSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
});

export const searchVehicleSchema = z.object({
  maker: z.string().optional(),
  model: z.string().optional(),
  category: z.enum(vehicleCategoryEnum).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["price", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
});

export const restockVehicleSchema = z.object({
  amount: z.coerce.number().int().positive("Amount must be greater than 0"),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type ListVehicleInput = z.infer<typeof listVehicleSchema>;
export type SearchVehicleInput = z.infer<typeof searchVehicleSchema>;
export type RestockVehicleInput = z.infer<typeof restockVehicleSchema>;
