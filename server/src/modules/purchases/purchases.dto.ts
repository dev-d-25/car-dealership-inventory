import { z } from "zod";

export const listPurchasesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  vehicleId: z.string().uuid().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ListPurchasesInput = z.infer<typeof listPurchasesSchema>;

export const dashboardStatsSchema = z.object({});

export const chartDataSchema = z.object({
  days: z.coerce.number().int().positive().default(30),
});

export type ChartDataInput = z.infer<typeof chartDataSchema>;
