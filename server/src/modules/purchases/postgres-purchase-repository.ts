import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { purchase, vehicle } from "../../db/schema.js";
import type {
  ChartDataPoint,
  DashboardStats,
  Purchase,
  PurchaseRepository,
  PurchaseWithVehicle,
} from "./purchase-repository.js";

type DrizzleDb = typeof db;

export class PostgresPurchaseRepository implements PurchaseRepository {
  constructor(private db: DrizzleDb) {}

  async create(input: {
    vehicleId: string;
    userId: string;
    quantity: number;
    unitPrice: number;
  }): Promise<Purchase> {
    const [created] = await this.db
      .insert(purchase)
      .values({
        vehicleId: input.vehicleId,
        userId: input.userId,
        quantity: input.quantity,
        unitPrice: input.unitPrice.toString(),
      })
      .returning();

    return { ...created, unitPrice: Number(created.unitPrice) };
  }

  async findById(id: string): Promise<PurchaseWithVehicle | null> {
    const [found] = await this.db
      .select({
        purchase,
        vehicle: {
          id: vehicle.id,
          maker: vehicle.maker,
          model: vehicle.model,
          category: vehicle.category,
          price: vehicle.price,
        },
      })
      .from(purchase)
      .innerJoin(vehicle, eq(purchase.vehicleId, vehicle.id))
      .where(eq(purchase.id, id))
      .limit(1);

    if (!found) return null;

    return {
      ...found.purchase,
      unitPrice: Number(found.purchase.unitPrice),
      vehicle: {
        ...found.vehicle,
        price: Number(found.vehicle.price),
      },
    };
  }

  async list(filters: {
    page: number;
    limit: number;
    vehicleId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: PurchaseWithVehicle[]; total: number }> {
    const { page, limit, vehicleId, userId, startDate, endDate } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (vehicleId) conditions.push(eq(purchase.vehicleId, vehicleId));
    if (userId) conditions.push(eq(purchase.userId, userId));
    if (startDate) conditions.push(gte(purchase.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(purchase.createdAt, new Date(endDate)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select({
        purchase,
        vehicle: {
          id: vehicle.id,
          maker: vehicle.maker,
          model: vehicle.model,
          category: vehicle.category,
          price: vehicle.price,
        },
      })
      .from(purchase)
      .innerJoin(vehicle, eq(purchase.vehicleId, vehicle.id))
      .where(where)
      .orderBy(desc(purchase.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(purchase)
      .where(where);

    return {
      data: rows.map((row) => ({
        ...row.purchase,
        unitPrice: Number(row.purchase.unitPrice),
        vehicle: {
          ...row.vehicle,
          price: Number(row.vehicle.price),
        },
      })),
      total,
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [{ totalModels }] = await this.db
      .select({ totalModels: count() })
      .from(vehicle);

    const [{ totalRevenue }] = await this.db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${purchase.unitPrice} * ${purchase.quantity}), 0)`,
      })
      .from(purchase);

    const [{ outOfStockModels }] = await this.db
      .select({ outOfStockModels: count() })
      .from(vehicle)
      .where(eq(vehicle.quantity, 0));

    return {
      totalModels,
      totalRevenue: Number(totalRevenue),
      carCategories: 5,
      outOfStockModels,
    };
  }

  async getChartData(days: number): Promise<ChartDataPoint[]> {
    const rows = await this.db
      .select({
        date: sql<string>`TO_CHAR(${purchase.createdAt}, 'YYYY-MM-DD')`,
        vehiclesSold: sql<number>`SUM(${purchase.quantity})`,
        revenue: sql<number>`SUM(${purchase.unitPrice} * ${purchase.quantity})`,
      })
      .from(purchase)
      .where(
        gte(
          purchase.createdAt,
          sql`NOW() - INTERVAL '${sql.raw(String(days))} days'`,
        ),
      )
      .groupBy(sql`TO_CHAR(${purchase.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${purchase.createdAt}, 'YYYY-MM-DD')`);

    return rows.map((row) => ({
      date: row.date,
      vehiclesSold: Number(row.vehiclesSold),
      revenue: Number(row.revenue),
    }));
  }
}
