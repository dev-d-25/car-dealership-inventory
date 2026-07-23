import express, { type Express } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { authenticate } from "./common/middleware/auth.middleware.js";
import { errorHandler } from "./common/middleware/error-handler.js";
import { auth } from "./lib/auth.js";
import { vehiclesRoutes } from "./modules/vehicles/index.js";

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/v1/auth/me", authenticate, (req, res) => {
  return res.json({ success: true, data: { user: req.user } });
});

app.all("/api/v1/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/vehicles", vehiclesRoutes);

app.use(errorHandler);

export { app };
