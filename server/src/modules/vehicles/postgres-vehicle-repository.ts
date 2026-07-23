import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "../../db/index.js";
import { vehicle } from "../../db/schema.js";
import type {
  CreateVehicleInput,
  SearchVehicleInput,
  UpdateVehicleInput,
} from "./vehicles.dto.js";
import type { Vehicle, VehicleRepository } from "./vehicle-repository.js";

type DrizzleDb = typeof db;
type VehicleRow = typeof vehicle.$inferSelect;

function mapRow(row: VehicleRow): Vehicle {
  return { ...row, price: Number(row.price) };
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

export class PostgresVehicleRepository implements VehicleRepository {
  constructor(private db: DrizzleDb) {}

  async create(input: CreateVehicleInput): Promise<Vehicle> {
    const [created] = await this.db
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

    return mapRow(created);
  }

  async findById(id: string): Promise<Vehicle | null> {
    const [found] = await this.db
      .select()
      .from(vehicle)
      .where(eq(vehicle.id, id))
      .limit(1);

    return found ? mapRow(found) : null;
  }

  async list(options: {
    page: number;
    limit: number;
  }): Promise<{ data: Vehicle[]; total: number }> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const rows = await this.db
      .select()
      .from(vehicle)
      .orderBy(desc(vehicle.createdAt))
      .limit(limit)
      .offset(offset);
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(vehicle);

    return { data: rows.map(mapRow), total };
  }

  async search(
    filters: SearchVehicleInput,
  ): Promise<{ data: Vehicle[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = filters;
    const offset = (page - 1) * limit;
    const conditions = buildSearchConditions(filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const orderFn = sortOrder === "desc" ? desc : asc;
    const sortColumns = { price: vehicle.price, updatedAt: vehicle.updatedAt };
    const orderColumn = sortBy && sortBy in sortColumns
      ? sortColumns[sortBy as keyof typeof sortColumns]
      : vehicle.createdAt;

    const rows = await this.db
      .select()
      .from(vehicle)
      .where(where)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(vehicle)
      .where(where);

    return { data: rows.map(mapRow), total };
  }

  async update(
    id: string,
    input: UpdateVehicleInput,
  ): Promise<Vehicle | null> {
    const updates: Partial<typeof vehicle.$inferInsert> = {};

    if (input.maker !== undefined) updates.maker = input.maker;
    if (input.model !== undefined) updates.model = input.model;
    if (input.category !== undefined) updates.category = input.category;
    if (input.price !== undefined) updates.price = input.price.toString();
    if (input.quantity !== undefined) updates.quantity = input.quantity;
    if (input.description !== undefined)
      updates.description = input.description;
    if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl;

    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }

    const [updated] = await this.db
      .update(vehicle)
      .set(updates)
      .where(eq(vehicle.id, id))
      .returning();

    return updated ? mapRow(updated) : null;
  }

  async atomicDecrement(id: string): Promise<Vehicle | null> {
    const [updated] = await this.db
      .update(vehicle)
      .set({
        quantity: sql`GREATEST(${vehicle.quantity} - 1, 0)`,
      })
      .where(eq(vehicle.id, id))
      .returning();

    return updated ? mapRow(updated) : null;
  }

  async atomicIncrement(id: string, amount: number): Promise<Vehicle | null> {
    const [updated] = await this.db
      .update(vehicle)
      .set({
        quantity: sql`${vehicle.quantity} + ${amount}`,
      })
      .where(eq(vehicle.id, id))
      .returning();

    return updated ? mapRow(updated) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(vehicle).where(eq(vehicle.id, id));
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.db.transaction(fn);
  }
}
