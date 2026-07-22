import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  uuid,
} from "drizzle-orm/pg-core";

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
