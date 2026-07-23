import { Router, type Router as RouterType } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { asyncHandler } from "../../common/middleware/error-handler.js";
import { validateQuery } from "../../common/middleware/validate.middleware.js";
import {
  chartDataSchema,
  listPurchasesSchema,
} from "./purchases.dto.js";
import type { PurchaseController } from "./purchases.controller.js";

export function createPurchaseRoutes(controller: PurchaseController): RouterType {
  const router: RouterType = Router();

  router.get(
    "/dashboard/stats",
    authenticate,
    asyncHandler(controller.getDashboardStats),
  );
  router.get(
    "/dashboard/chart",
    authenticate,
    validateQuery(chartDataSchema),
    asyncHandler(controller.getChartData),
  );
  router.get(
    "/",
    authenticate,
    validateQuery(listPurchasesSchema),
    asyncHandler(controller.listPurchases),
  );
  router.get(
    "/:id",
    authenticate,
    asyncHandler(controller.getPurchase),
  );

  return router;
}
