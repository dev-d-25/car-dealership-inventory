import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema.js";

export const vehicleCategories = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
] as const;

export type VehicleCategory = (typeof vehicleCategories)[number];

export const vehicle = pgTable("vehicle", {
  id: uuid("id").primaryKey().defaultRandom(),
  maker: text("maker").notNull(),
  model: text("model").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const purchase = pgTable(
  "purchase",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicle.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("purchase_vehicleId_idx").on(table.vehicleId),
    index("purchase_userId_idx").on(table.userId),
    index("purchase_createdAt_idx").on(table.createdAt),
  ],
);

export const vehicleRelations = relations(vehicle, ({ many }) => ({
  purchases: many(purchase),
}));

export const purchaseRelations = relations(purchase, ({ one }) => ({
  vehicle: one(vehicle, {
    fields: [purchase.vehicleId],
    references: [vehicle.id],
  }),
  user: one(user, {
    fields: [purchase.userId],
    references: [user.id],
  }),
}));

export const userPurchaseRelations = relations(user, ({ many }) => ({
  purchases: many(purchase),
}));
