import express, { type Express } from "express";
import cors from "cors";
import { errorHandler } from "./common/middleware/error-handler.js";
import { authHandler, authRoutes } from "./modules/auth/index.js";
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

app.all("/api/v1/auth/{*any}", authHandler);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehiclesRoutes);

app.use(errorHandler);

export { app };
