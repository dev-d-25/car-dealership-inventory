import type { CreateVehicleInput, SearchVehicleInput, UpdateVehicleInput } from "./vehicles.dto.js";

export type Vehicle = {
  id: string;
  maker: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface VehicleRepository {
  create(input: CreateVehicleInput): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  list(options: { page: number; limit: number }): Promise<{ data: Vehicle[]; total: number }>;
  search(filters: SearchVehicleInput): Promise<{ data: Vehicle[]; total: number }>;
  update(id: string, input: UpdateVehicleInput): Promise<Vehicle | null>;
  atomicDecrement(id: string): Promise<Vehicle | null>;
  atomicIncrement(id: string, amount: number): Promise<Vehicle | null>;
  delete(id: string): Promise<void>;
}
