import { randomUUID } from "node:crypto";
import type {
  CreateVehicleInput,
  SearchVehicleInput,
  UpdateVehicleInput,
} from "./vehicles.dto.js";
import type { Vehicle, VehicleRepository } from "./vehicle-repository.js";

export class InMemoryVehicleRepository implements VehicleRepository {
  private vehicles: Vehicle[] = [];
  private sequence = 0;

  clear(): void {
    this.vehicles = [];
    this.sequence = 0;
  }

  async create(input: CreateVehicleInput): Promise<Vehicle> {
    this.sequence++;
    const now = new Date();
    const createdAt = new Date(now.getTime() + this.sequence);
    const vehicle: Vehicle = {
      id: randomUUID(),
      maker: input.maker,
      model: input.model,
      category: input.category,
      price: input.price.toString(),
      quantity: input.quantity ?? 0,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      createdAt,
      updatedAt: createdAt,
    };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.vehicles.find((v) => v.id === id) ?? null;
  }

  async list(options: {
    page: number;
    limit: number;
  }): Promise<{ data: Vehicle[]; total: number }> {
    const sorted = [...this.vehicles].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const offset = (options.page - 1) * options.limit;
    const data = sorted.slice(offset, offset + options.limit);
    return { data, total: this.vehicles.length };
  }

  async search(
    filters: SearchVehicleInput,
  ): Promise<{ data: Vehicle[]; total: number }> {
    let results = [...this.vehicles];

    if (filters.maker) {
      results = results.filter((v) =>
        v.maker.toLowerCase().includes(filters.maker!.toLowerCase()),
      );
    }
    if (filters.model) {
      results = results.filter((v) =>
        v.model.toLowerCase().includes(filters.model!.toLowerCase()),
      );
    }
    if (filters.category) {
      results = results.filter((v) => v.category === filters.category);
    }
    if (filters.minPrice !== undefined) {
      results = results.filter((v) => Number(v.price) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((v) => Number(v.price) <= filters.maxPrice!);
    }

    const sortBy = filters.sortBy ?? "createdAt";
    const sortOrder = filters.sortOrder ?? "desc";
    results.sort((a, b) => {
      const aVal = sortBy === "price" ? Number(a.price) : a[sortBy].getTime();
      const bVal = sortBy === "price" ? Number(b.price) : b[sortBy].getTime();
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    const total = results.length;
    const offset = (filters.page - 1) * filters.limit;
    const data = results.slice(offset, offset + filters.limit);

    return { data, total };
  }

  async update(
    id: string,
    input: UpdateVehicleInput,
  ): Promise<Vehicle | null> {
    const index = this.vehicles.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const existing = this.vehicles[index];
    const updated: Vehicle = {
      ...existing,
      ...(input.maker !== undefined && { maker: input.maker }),
      ...(input.model !== undefined && { model: input.model }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.price !== undefined && { price: input.price.toString() }),
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      updatedAt: new Date(),
    };

    this.vehicles[index] = updated;
    return updated;
  }

  async atomicDecrement(id: string): Promise<Vehicle | null> {
    const index = this.vehicles.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const existing = this.vehicles[index];
    const updated: Vehicle = {
      ...existing,
      quantity: Math.max(existing.quantity - 1, 0),
      updatedAt: new Date(),
    };
    this.vehicles[index] = updated;
    return updated;
  }

  async atomicIncrement(id: string, amount: number): Promise<Vehicle | null> {
    const index = this.vehicles.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const existing = this.vehicles[index];
    const updated: Vehicle = {
      ...existing,
      quantity: existing.quantity + amount,
      updatedAt: new Date(),
    };
    this.vehicles[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.vehicles = this.vehicles.filter((v) => v.id !== id);
  }
}
