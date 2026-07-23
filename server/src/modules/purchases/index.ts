import { db } from "../../db/index.js";
import { createPurchaseController } from "./purchases.controller.js";
import { createPurchaseRoutes } from "./purchases.route.js";
import { PostgresPurchaseRepository } from "./postgres-purchase-repository.js";
import { PurchaseService } from "./purchases.service.js";

const repo = new PostgresPurchaseRepository(db);
const service = new PurchaseService(repo);
const controller = createPurchaseController(service);
const purchasesRoutes = createPurchaseRoutes(controller);

export { purchasesRoutes };
