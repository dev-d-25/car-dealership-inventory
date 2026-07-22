import { and, count, eq, gte, ilike, lte, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import { vehicle } from "../../db/schema.js";
import type {
  CreateVehicleInput,
  SearchVehicleInput,
  UpdateVehicleInput,
} from "./vehicles.dto.js";

export type Vehicle = typeof vehicle.$inferSelect;

function buildSearchConditions(filters: SearchVehicleInput): SQL[] {
  return [
    filters.maker && ilike(vehicle.maker, filters.maker),
    filters.model && ilike(vehicle.model, filters.model),
    filters.category && eq(vehicle.category, filters.category),
    filters.minPrice !== undefined &&
      gte(vehicle.price, filters.minPrice.toString()),
    filters.maxPrice !== undefined &&
      lte(vehicle.price, filters.maxPrice.toString()),
  ].filter((c): c is SQL => Boolean(c));
}

export async function createVehicle(
  input: CreateVehicleInput,
): Promise<Vehicle> {
  const [created] = await db
    .insert(vehicle)
    .values({
      maker: input.maker,
      model: input.model,
      category: input.category,
      price: input.price.toString(),
      quantity: input.quantity,
      description: input.description,
      imageUrl: input.imageUrl,
    })
    .returning();

  return created;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const [found] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, id))
    .limit(1);

  return found ?? null;
}

export async function listVehicles(options: {
  page: number;
  limit: number;
}): Promise<{ data: Vehicle[]; total: number }> {
  const { page, limit } = options;
  const offset = (page - 1) * limit;

  const data = await db.select().from(vehicle).limit(limit).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(vehicle);

  return { data, total };
}

export async function searchVehicles(
  filters: SearchVehicleInput,
): Promise<{ data: Vehicle[]; total: number }> {
  const { page, limit } = filters;
  const offset = (page - 1) * limit;
  const conditions = buildSearchConditions(filters);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(vehicle)
    .where(where)
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(vehicle)
    .where(where);

  return { data, total };
}

export async function updateVehicle(
  id: string,
  input: UpdateVehicleInput,
): Promise<Vehicle | null> {
  const updates: Partial<typeof vehicle.$inferInsert> = {};

  if (input.maker !== undefined) updates.maker = input.maker;
  if (input.model !== undefined) updates.model = input.model;
  if (input.category !== undefined) updates.category = input.category;
  if (input.price !== undefined) updates.price = input.price.toString();
  if (input.quantity !== undefined) updates.quantity = input.quantity;
  if (input.description !== undefined) updates.description = input.description;
  if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl;

  if (Object.keys(updates).length === 0) {
    return getVehicleById(id);
  }

  const [updated] = await db
    .update(vehicle)
    .set(updates)
    .where(eq(vehicle.id, id))
    .returning();

  return updated ?? null;
}

export async function purchaseVehicle(id: string): Promise<Vehicle | null> {
  const found = await getVehicleById(id);

  if (!found) {
    return null;
  }

  if (found.quantity <= 0) {
    throw new Error("Out of stock");
  }

  const [updated] = await db
    .update(vehicle)
    .set({ quantity: found.quantity - 1 })
    .where(eq(vehicle.id, id))
    .returning();

  return updated ?? null;
}

export async function restockVehicle(
  id: string,
  amount: number,
): Promise<Vehicle | null> {
  const found = await getVehicleById(id);

  if (!found) {
    return null;
  }

  const [updated] = await db
    .update(vehicle)
    .set({ quantity: found.quantity + amount })
    .where(eq(vehicle.id, id))
    .returning();

  return updated ?? null;
}

export async function deleteVehicle(id: string): Promise<void> {
  await db.delete(vehicle).where(eq(vehicle.id, id));
}
