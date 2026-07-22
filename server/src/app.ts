import express, { type Express } from "express";
import cors from "cors";
import { authHandler } from "./modules/auth";

const app: Express = express();
const apiV1 = express.Router();

apiV1.all("/auth/{*any}", authHandler);

app.use(cors());
app.use("/api/v1", apiV1);
app.use(express.json());

export { app };
