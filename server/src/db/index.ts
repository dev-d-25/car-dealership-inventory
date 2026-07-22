import { env } from "../env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./auth-schema.js";
import * as vehicleSchema from "./schema.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema: { ...authSchema, ...vehicleSchema } });
