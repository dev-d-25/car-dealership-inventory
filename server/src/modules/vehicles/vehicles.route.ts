import { Router, type Router as RouterType } from "express";
import { authenticate, requirePermission } from "../../common/middleware/auth.middleware.js";
import { asyncHandler } from "../../common/middleware/error-handler.js";
import {
  validateBody,
  validateQuery,
} from "../../common/middleware/validate.middleware.js";
import {
  createVehicleSchema,
  listVehicleSchema,
  restockVehicleSchema,
  searchVehicleSchema,
  updateVehicleSchema,
} from "./vehicles.dto.js";
import * as controller from "./vehicles.controller.js";

const router: RouterType = Router();

router.get(
  "/search",
  authenticate,
  validateQuery(searchVehicleSchema),
  asyncHandler(controller.searchVehicles),
);
router.get(
  "/",
  authenticate,
  validateQuery(listVehicleSchema),
  asyncHandler(controller.listVehicles),
);
router.post(
  "/",
  authenticate,
  requirePermission("vehicle", "create"),
  validateBody(createVehicleSchema),
  asyncHandler(controller.createVehicle),
);
router.put(
  "/:id",
  authenticate,
  requirePermission("vehicle", "update"),
  validateBody(updateVehicleSchema),
  asyncHandler(controller.updateVehicle),
);
router.delete(
  "/:id",
  authenticate,
  requirePermission("vehicle", "delete"),
  asyncHandler(controller.deleteVehicle),
);
router.post(
  "/:id/purchase",
  authenticate,
  requirePermission("vehicle", "purchase"),
  asyncHandler(controller.purchaseVehicle),
);
router.post(
  "/:id/restock",
  authenticate,
  requirePermission("vehicle", "restock"),
  validateBody(restockVehicleSchema),
  asyncHandler(controller.restockVehicle),
);

export default router;
