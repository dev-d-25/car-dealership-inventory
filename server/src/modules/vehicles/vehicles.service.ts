import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  type SQL,
} from "drizzle-orm";
import { db } from "../../db/index.js";
import { vehicle } from "../../db/schema.js";
import type {
  CreateVehicleInput,
  SearchVehicleInput,
  UpdateVehicleInput,
} from "./vehicles.dto.js";

export type Vehicle = typeof vehicle.$inferSelect;

function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

function buildSearchConditions(filters: SearchVehicleInput): SQL[] {
  const conditions: SQL[] = [];

  if (filters.maker) {
    conditions.push(ilike(vehicle.maker, `%${filters.maker}%`));
  }
  if (filters.model) {
    conditions.push(ilike(vehicle.model, `%${filters.model}%`));
  }
  if (filters.category) {
    conditions.push(eq(vehicle.category, filters.category));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(vehicle.price, filters.minPrice.toString()));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(vehicle.price, filters.maxPrice.toString()));
  }

  return conditions;
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
  const offset = getOffset(page, limit);

  const data = await db.select().from(vehicle).limit(limit).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(vehicle);

  return { data, total };
}

export async function searchVehicles(
  filters: SearchVehicleInput,
): Promise<{ data: Vehicle[]; total: number }> {
  const { page, limit, sortBy, sortOrder } = filters;
  const offset = getOffset(page, limit);
  const conditions = buildSearchConditions(filters);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderFn = sortOrder === "desc" ? desc : asc;
  const orderColumn = sortBy === "price" ? vehicle.price
    : sortBy === "updatedAt" ? vehicle.updatedAt
    : vehicle.createdAt;

  const data = await db
    .select()
    .from(vehicle)
    .where(where)
    .orderBy(orderFn(orderColumn))
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
