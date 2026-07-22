import { env } from "../env.js";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { admin } from "better-auth/plugins";
import { ac, superadmin, admin as adminRole, moderator, user } from "./permissions.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/v1/auth",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      adminRoles: ["superadmin"],
      ac,
      roles: {
        superadmin,
        admin: adminRole,
        moderator,
        user,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
