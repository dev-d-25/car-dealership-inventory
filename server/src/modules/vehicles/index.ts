import { db } from "../../db/index.js";
import { createVehicleController } from "./vehicles.controller.js";
import { createVehicleRoutes } from "./vehicles.route.js";
import { PostgresVehicleRepository } from "./postgres-vehicle-repository.js";
import { PostgresPurchaseRepository } from "../purchases/postgres-purchase-repository.js";
import { VehicleService } from "./vehicles.service.js";

const repo = new PostgresVehicleRepository(db);
const purchaseRepo = new PostgresPurchaseRepository(db);
const service = new VehicleService(repo, purchaseRepo);
const controller = createVehicleController(service);
const vehiclesRoutes = createVehicleRoutes(controller);

export { vehiclesRoutes };
