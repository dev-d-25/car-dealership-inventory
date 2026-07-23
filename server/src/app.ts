import express, { type Express } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { fromNodeHeaders } from "better-auth/node";
import { errorHandler } from "./common/middleware/error-handler.js";
import { ApiError } from "./common/utils/api-error.js";
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

app.get("/api/v1/auth/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw ApiError.unauthorized("Not authenticated");
  }

  return res.json({ success: true, data: { user: session.user } });
});

app.all("/api/v1/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/vehicles", vehiclesRoutes);

app.use(errorHandler);

export { app };
