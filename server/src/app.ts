import express, { type Express } from "express";
import cors from "cors";
import { authHandler } from "./modules/auth/index.js";

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.all("/api/v1/auth/{*any}", authHandler);

app.use(express.json());

export { app };
