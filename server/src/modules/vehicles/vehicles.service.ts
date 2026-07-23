import { ApiError } from "../../common/utils/api-error.js";
import type {
  CreateVehicleInput,
  SearchVehicleInput,
  UpdateVehicleInput,
} from "./vehicles.dto.js";
import type { Vehicle, VehicleRepository } from "./vehicle-repository.js";

export class VehicleService {
  constructor(private repo: VehicleRepository) {}

  async createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
    return this.repo.create(input);
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.repo.findById(id);
  }

  async listVehicles(options: {
    page: number;
    limit: number;
  }): Promise<{ data: Vehicle[]; total: number }> {
    return this.repo.list(options);
  }

  async searchVehicles(
    filters: SearchVehicleInput,
  ): Promise<{ data: Vehicle[]; total: number }> {
    return this.repo.search(filters);
  }

  async updateVehicle(
    id: string,
    input: UpdateVehicleInput,
  ): Promise<Vehicle | null> {
    return this.repo.update(id, input);
  }

  async purchaseVehicle(id: string): Promise<Vehicle> {
    const found = await this.repo.findById(id);

    if (!found) {
      throw ApiError.vehicleNotFound(id);
    }

    if (found.quantity <= 0) {
      throw ApiError.outOfStock(id);
    }

    const updated = await this.repo.atomicDecrement(id);

    return updated!;
  }

  async restockVehicle(id: string, amount: number): Promise<Vehicle> {
    const found = await this.repo.findById(id);

    if (!found) {
      throw ApiError.vehicleNotFound(id);
    }

    const updated = await this.repo.atomicIncrement(id, amount);

    return updated!;
  }

  async deleteVehicle(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
