import { db } from "../../db/index.js";
import { createVehicleController } from "./vehicles.controller.js";
import { createVehicleRoutes } from "./vehicles.route.js";
import { PostgresVehicleRepository } from "./postgres-vehicle-repository.js";
import { VehicleService } from "./vehicles.service.js";

const repo = new PostgresVehicleRepository(db);
const service = new VehicleService(repo);
const controller = createVehicleController(service);
const vehiclesRoutes = createVehicleRoutes(controller);

export { vehiclesRoutes };
