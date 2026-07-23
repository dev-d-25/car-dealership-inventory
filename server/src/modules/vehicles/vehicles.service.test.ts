import { describe, expect, it, beforeEach } from "vitest";
import { ApiError } from "../../common/utils/api-error.js";
import { InMemoryVehicleRepository } from "./in-memory-vehicle-repository.js";
import { VehicleService } from "./vehicles.service.js";

const repo = new InMemoryVehicleRepository();
const service = new VehicleService(repo);

beforeEach(() => {
  repo.clear();
});

describe("vehicles.service", () => {
  it("createVehicle makes a vehicle retrievable by id", async () => {
    const created = await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 3,
      description: "Reliable sedan",
    });

    expect(created.id).toBeDefined();
    expect(created.maker).toBe("Toyota");
    expect(created.model).toBe("Camry");
    expect(created.category).toBe("Sedan");
    expect(Number(created.price)).toBe(25000);
    expect(created.quantity).toBe(3);
    expect(created.description).toBe("Reliable sedan");

    const found = await service.getVehicleById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.maker).toBe("Toyota");
    expect(found?.model).toBe("Camry");
  });

  it("listVehicles returns paginated inventory", async () => {
    await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    await service.createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 2,
    });
    await service.createVehicle({
      maker: "Ford",
      model: "F-150",
      category: "Truck",
      price: 40000,
      quantity: 1,
    });

    const page1 = await service.listVehicles({ page: 1, limit: 2 });
    expect(page1.total).toBe(3);
    expect(page1.data).toHaveLength(2);

    const page2 = await service.listVehicles({ page: 2, limit: 2 });
    expect(page2.total).toBe(3);
    expect(page2.data).toHaveLength(1);
  });

  it("listVehicles returns vehicles sorted by createdAt descending", async () => {
    const first = await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    const second = await service.createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 1,
    });
    const third = await service.createVehicle({
      maker: "Ford",
      model: "F-150",
      category: "Truck",
      price: 40000,
      quantity: 1,
    });

    const { data } = await service.listVehicles({ page: 1, limit: 10 });
    expect(data[0]?.id).toBe(third.id);
    expect(data[1]?.id).toBe(second.id);
    expect(data[2]?.id).toBe(first.id);
  });

  it("searchVehicles combines multiple filters with AND logic", async () => {
    await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    await service.createVehicle({
      maker: "Toyota",
      model: "RAV4",
      category: "SUV",
      price: 32000,
      quantity: 1,
    });
    await service.createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 1,
    });

    const result = await service.searchVehicles({
      maker: "Toyota",
      category: "Sedan",
      page: 1,
      limit: 10,
    });
    expect(result.total).toBe(1);
    expect(result.data[0]?.model).toBe("Camry");

    const noMatch = await service.searchVehicles({
      maker: "Toyota",
      category: "Truck",
      page: 1,
      limit: 10,
    });
    expect(noMatch.total).toBe(0);
    expect(noMatch.data).toHaveLength(0);
  });

  it("searchVehicles uses partial matching for maker and model", async () => {
    await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    await service.createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 1,
    });

    const partialMaker = await service.searchVehicles({
      maker: "Toy",
      page: 1,
      limit: 10,
    });
    expect(partialMaker.total).toBe(1);
    expect(partialMaker.data[0]?.maker).toBe("Toyota");

    const partialModel = await service.searchVehicles({
      model: "Cam",
      page: 1,
      limit: 10,
    });
    expect(partialModel.total).toBe(1);
    expect(partialModel.data[0]?.model).toBe("Camry");
  });

  it("searchVehicles sorts by price ascending and descending", async () => {
    await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    await service.createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 1,
    });
    await service.createVehicle({
      maker: "Ford",
      model: "F-150",
      category: "Truck",
      price: 40000,
      quantity: 1,
    });

    const asc = await service.searchVehicles({
      sortBy: "price",
      sortOrder: "asc",
      page: 1,
      limit: 10,
    });
    expect(asc.data[0]?.model).toBe("Civic");
    expect(asc.data[2]?.model).toBe("F-150");

    const desc = await service.searchVehicles({
      sortBy: "price",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });
    expect(desc.data[0]?.model).toBe("F-150");
    expect(desc.data[2]?.model).toBe("Civic");
  });

  it("searchVehicles filters by maker, category, and price range", async () => {
    await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    await service.createVehicle({
      maker: "Toyota",
      model: "RAV4",
      category: "SUV",
      price: 32000,
      quantity: 1,
    });
    await service.createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 1,
    });

    const byMaker = await service.searchVehicles({
      maker: "Toyota",
      page: 1,
      limit: 10,
    });
    expect(byMaker.total).toBe(2);
    expect(byMaker.data.every((v) => v.maker === "Toyota")).toBe(true);

    const byCategory = await service.searchVehicles({
      category: "Sedan",
      page: 1,
      limit: 10,
    });
    expect(byCategory.total).toBe(2);
    expect(byCategory.data.every((v) => v.category === "Sedan")).toBe(true);

    const byPrice = await service.searchVehicles({
      minPrice: 23000,
      maxPrice: 30000,
      page: 1,
      limit: 10,
    });
    expect(byPrice.total).toBe(1);
    expect(byPrice.data[0]?.model).toBe("Camry");
  });

  it("updateVehicle changes vehicle details", async () => {
    const created = await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 3,
    });

    const updated = await service.updateVehicle(created.id, {
      price: 27000,
      quantity: 5,
    });

    expect(updated).not.toBeNull();
    expect(Number(updated!.price)).toBe(27000);
    expect(updated!.quantity).toBe(5);

    const found = await service.getVehicleById(created.id);
    expect(Number(found!.price)).toBe(27000);
    expect(found!.quantity).toBe(5);
  });

  it("purchaseVehicle decreases quantity by one", async () => {
    const created = await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 3,
    });

    const purchased = await service.purchaseVehicle(created.id);

    expect(purchased).not.toBeNull();
    expect(purchased!.quantity).toBe(2);

    const found = await service.getVehicleById(created.id);
    expect(found!.quantity).toBe(2);
  });

  it("purchaseVehicle rejects when out of stock", async () => {
    const created = await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 0,
    });

    await expect(service.purchaseVehicle(created.id)).rejects.toThrow(
      ApiError,
    );
  });

  it("purchaseVehicle throws VehicleNotFoundError for missing vehicle", async () => {
    await expect(service.purchaseVehicle("nonexistent")).rejects.toThrow(
      ApiError,
    );
  });

  it("restockVehicle increases quantity", async () => {
    const created = await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 2,
    });

    const restocked = await service.restockVehicle(created.id, 5);

    expect(restocked).not.toBeNull();
    expect(restocked!.quantity).toBe(7);

    const found = await service.getVehicleById(created.id);
    expect(found!.quantity).toBe(7);
  });

  it("deleteVehicle removes vehicle from inventory", async () => {
    const created = await service.createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });

    await service.deleteVehicle(created.id);

    const found = await service.getVehicleById(created.id);
    expect(found).toBeNull();
  });
});
