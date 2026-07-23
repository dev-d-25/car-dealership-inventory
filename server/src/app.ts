import express, { type Express, type Request } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { authenticate } from "./common/middleware/auth.middleware.js";
import { errorHandler } from "./common/middleware/error-handler.js";
import { auth } from "./lib/auth.js";
import { vehiclesRoutes } from "./modules/vehicles/index.js";
import { purchasesRoutes } from "./modules/purchases/index.js";
import { env } from "./env.js";

type AuthenticatedRequest = Request & {
  user: typeof auth.$Infer.Session.user;
};

const app: Express = express();

const allowedOrigins =
  env.NODE_ENV === "production"
    ? [env.BETTER_AUTH_URL]
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/v1/auth/me", authenticate, (req, res) => {
  const { user } = req as AuthenticatedRequest;
  return res.json({ success: true, data: { user } });
});

app.all("/api/v1/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/vehicles", vehiclesRoutes);
app.use("/api/v1/purchases", purchasesRoutes);

app.use(errorHandler);

export default app;
