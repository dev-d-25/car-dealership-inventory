import { Router, type Router as RouterType } from "express";
import { getMe } from "./auth.controller.js";

const router: RouterType = Router();

router.get("/me", getMe);

export default router;
