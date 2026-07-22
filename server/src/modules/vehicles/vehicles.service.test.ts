import { describe, expect, it } from "vitest";
import {
  createVehicle,
  getVehicleById,
  listVehicles,
  purchaseVehicle,
  restockVehicle,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
} from "./vehicles.service.js";

describe("vehicles.service", () => {
  it("createVehicle makes a vehicle retrievable by id", async () => {
    const created = await createVehicle({
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

    const found = await getVehicleById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.maker).toBe("Toyota");
    expect(found?.model).toBe("Camry");
  });

  it("listVehicles returns paginated inventory", async () => {
    await createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    await createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 2,
    });
    await createVehicle({
      maker: "Ford",
      model: "F-150",
      category: "Truck",
      price: 40000,
      quantity: 1,
    });

    const page1 = await listVehicles({ page: 1, limit: 2 });
    expect(page1.total).toBe(3);
    expect(page1.data).toHaveLength(2);

    const page2 = await listVehicles({ page: 2, limit: 2 });
    expect(page2.total).toBe(3);
    expect(page2.data).toHaveLength(1);
  });

  it("searchVehicles combines multiple filters with AND logic", async () => {
    await createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    await createVehicle({
      maker: "Toyota",
      model: "RAV4",
      category: "SUV",
      price: 32000,
      quantity: 1,
    });
    await createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 1,
    });

    const result = await searchVehicles({
      maker: "Toyota",
      category: "Sedan",
      page: 1,
      limit: 10,
    });
    expect(result.total).toBe(1);
    expect(result.data[0]?.model).toBe("Camry");

    const noMatch = await searchVehicles({
      maker: "Toyota",
      category: "Truck",
      page: 1,
      limit: 10,
    });
    expect(noMatch.total).toBe(0);
    expect(noMatch.data).toHaveLength(0);
  });

  it("searchVehicles filters by maker, category, and price range", async () => {
    await createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });
    await createVehicle({
      maker: "Toyota",
      model: "RAV4",
      category: "SUV",
      price: 32000,
      quantity: 1,
    });
    await createVehicle({
      maker: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 1,
    });

    const byMaker = await searchVehicles({
      maker: "Toyota",
      page: 1,
      limit: 10,
    });
    expect(byMaker.total).toBe(2);
    expect(byMaker.data.every((v) => v.maker === "Toyota")).toBe(true);

    const byCategory = await searchVehicles({
      category: "Sedan",
      page: 1,
      limit: 10,
    });
    expect(byCategory.total).toBe(2);
    expect(byCategory.data.every((v) => v.category === "Sedan")).toBe(true);

    const byPrice = await searchVehicles({
      minPrice: 23000,
      maxPrice: 30000,
      page: 1,
      limit: 10,
    });
    expect(byPrice.total).toBe(1);
    expect(byPrice.data[0]?.model).toBe("Camry");
  });

  it("updateVehicle changes vehicle details", async () => {
    const created = await createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 3,
    });

    const updated = await updateVehicle(created.id, {
      price: 27000,
      quantity: 5,
    });

    expect(updated).not.toBeNull();
    expect(Number(updated!.price)).toBe(27000);
    expect(updated!.quantity).toBe(5);

    const found = await getVehicleById(created.id);
    expect(Number(found!.price)).toBe(27000);
    expect(found!.quantity).toBe(5);
  });

  it("purchaseVehicle decreases quantity by one", async () => {
    const created = await createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 3,
    });

    const purchased = await purchaseVehicle(created.id);

    expect(purchased).not.toBeNull();
    expect(purchased!.quantity).toBe(2);

    const found = await getVehicleById(created.id);
    expect(found!.quantity).toBe(2);
  });

  it("purchaseVehicle rejects when out of stock", async () => {
    const created = await createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 0,
    });

    await expect(purchaseVehicle(created.id)).rejects.toThrow("Out of stock");
  });

  it("restockVehicle increases quantity", async () => {
    const created = await createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 2,
    });

    const restocked = await restockVehicle(created.id, 5);

    expect(restocked).not.toBeNull();
    expect(restocked!.quantity).toBe(7);

    const found = await getVehicleById(created.id);
    expect(found!.quantity).toBe(7);
  });

  it("deleteVehicle removes vehicle from inventory", async () => {
    const created = await createVehicle({
      maker: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 1,
    });

    await deleteVehicle(created.id);

    const found = await getVehicleById(created.id);
    expect(found).toBeNull();
  });
});
