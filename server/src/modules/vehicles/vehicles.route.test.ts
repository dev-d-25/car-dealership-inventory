import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import app from "../../app.js";
import { auth } from "../../lib/auth.js";
import { db } from "../../db/index.js";
import { vehicle } from "../../db/schema.js";
import { user } from "../../db/auth-schema.js";

const adminSession = {
  user: {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "admin",
    banned: false,
    banReason: null,
    banExpires: null,
  },
  session: {
    id: "session-admin",
    userId: "admin-1",
    token: "admin-token",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    impersonatedBy: null,
  },
};

const userSession = {
  user: {
    id: "user-1",
    name: "Regular User",
    email: "user@example.com",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
  },
  session: {
    id: "session-user",
    userId: "user-1",
    token: "user-token",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    impersonatedBy: null,
  },
};

function mockAdminSession() {
  vi.spyOn(auth.api, "getSession").mockResolvedValue(adminSession);
  vi.spyOn(auth.api, "userHasPermission").mockResolvedValue({ success: true } as any);
}

function mockUserSession() {
  vi.spyOn(auth.api, "getSession").mockResolvedValue(userSession);
  vi.spyOn(auth.api, "userHasPermission").mockImplementation(async ({ body }: any) => {
    const perms = body.permissions;
    const userPerms: Record<string, string[]> = {
      vehicle: ["read", "search", "purchase"],
    };
    const resource = Object.keys(perms)[0];
    const actions = perms[resource];
    const allowed = userPerms[resource] ?? [];
    const hasAll = actions.every((a: string) => allowed.includes(a));
    return { success: hasAll } as any;
  });
}

function mockNoSession() {
  vi.spyOn(auth.api, "getSession").mockResolvedValue(null);
}

async function seedVehicle(data: {
  maker?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}) {
  const [row] = await db
    .insert(vehicle)
    .values({
      maker: data.maker ?? "Toyota",
      model: data.model ?? "Camry",
      category: (data.category as any) ?? "Sedan",
      price: (data.price ?? 25000).toString(),
      quantity: data.quantity ?? 5,
    })
    .returning();
  return row;
}

async function seedUser(data: { id: string; role?: string }) {
  await db
    .insert(user)
    .values({
      id: data.id,
      name: data.id,
      email: `${data.id}@example.com`,
      emailVerified: false,
      role: data.role ?? "user",
    })
    .onConflictDoNothing();
}

beforeEach(async () => {
  vi.restoreAllMocks();
  await db.delete(vehicle);
  await seedUser({ id: "admin-1", role: "admin" });
  await seedUser({ id: "user-1", role: "user" });
});

describe("vehicles routes", () => {
  describe("GET /api/v1/vehicles", () => {
    it("returns 401 without authentication", async () => {
      mockNoSession();

      const res = await request(app).get("/api/v1/vehicles");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns paginated inventory for authenticated users", async () => {
      mockAdminSession();
      await seedVehicle({ maker: "Toyota", model: "Camry" });
      await seedVehicle({ maker: "Honda", model: "Civic" });

      const res = await request(app).get("/api/v1/vehicles");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it("respects pagination params", async () => {
      mockAdminSession();
      await seedVehicle({ maker: "A", model: "1" });
      await seedVehicle({ maker: "B", model: "2" });
      await seedVehicle({ maker: "C", model: "3" });

      const res = await request(app).get("/api/v1/vehicles?page=1&limit=2");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(3);
    });
  });

  describe("GET /api/v1/vehicles/search", () => {
    it("returns 401 without authentication", async () => {
      mockNoSession();

      const res = await request(app).get("/api/v1/vehicles/search");

      expect(res.status).toBe(401);
    });

    it("filters by maker", async () => {
      mockAdminSession();
      await seedVehicle({ maker: "Toyota", model: "Camry" });
      await seedVehicle({ maker: "Honda", model: "Civic" });

      const res = await request(app).get("/api/v1/vehicles/search?maker=Toyota");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].maker).toBe("Toyota");
    });

    it("filters by category", async () => {
      mockAdminSession();
      await seedVehicle({ maker: "Toyota", model: "Camry", category: "Sedan" });
      await seedVehicle({ maker: "Toyota", model: "RAV4", category: "SUV" });

      const res = await request(app).get("/api/v1/vehicles/search?category=SUV");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].model).toBe("RAV4");
    });

    it("filters by price range", async () => {
      mockAdminSession();
      await seedVehicle({ maker: "A", model: "Cheap", price: 10000 });
      await seedVehicle({ maker: "B", model: "Mid", price: 25000 });
      await seedVehicle({ maker: "C", model: "Expensive", price: 50000 });

      const res = await request(app).get(
        "/api/v1/vehicles/search?minPrice=20000&maxPrice=30000",
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].model).toBe("Mid");
    });

    it("returns empty results when no match", async () => {
      mockAdminSession();
      await seedVehicle({ maker: "Toyota", model: "Camry" });

      const res = await request(app).get("/api/v1/vehicles/search?maker=BMW");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  describe("POST /api/v1/vehicles", () => {
    it("returns 401 without authentication", async () => {
      mockNoSession();

      const res = await request(app)
        .post("/api/v1/vehicles")
        .send({ maker: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 1 });

      expect(res.status).toBe(401);
    });

    it("returns 403 for regular user without create permission", async () => {
      mockUserSession();

      const res = await request(app)
        .post("/api/v1/vehicles")
        .send({ maker: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 1 });

      expect(res.status).toBe(403);
    });

    it("creates a vehicle with valid data", async () => {
      mockAdminSession();

      const res = await request(app)
        .post("/api/v1/vehicles")
        .send({ maker: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 3 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maker).toBe("Toyota");
      expect(res.body.data.model).toBe("Camry");
      expect(res.body.data.price).toBe(25000);
      expect(res.body.data.quantity).toBe(3);
      expect(res.body.data.id).toBeDefined();
    });

    it("returns 400 with missing required fields", async () => {
      mockAdminSession();

      const res = await request(app)
        .post("/api/v1/vehicles")
        .send({ maker: "Toyota" });

      expect(res.status).toBe(400);
    });

    it("returns 400 with invalid category", async () => {
      mockAdminSession();

      const res = await request(app)
        .post("/api/v1/vehicles")
        .send({ maker: "Toyota", model: "Camry", category: "Invalid", price: 25000, quantity: 1 });

      expect(res.status).toBe(400);
    });

    it("returns 400 with negative price", async () => {
      mockAdminSession();

      const res = await request(app)
        .post("/api/v1/vehicles")
        .send({ maker: "Toyota", model: "Camry", category: "Sedan", price: -100, quantity: 1 });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/v1/vehicles/:id", () => {
    it("returns 401 without authentication", async () => {
      mockNoSession();
      const row = await seedVehicle({});

      const res = await request(app)
        .put(`/api/v1/vehicles/${row.id}`)
        .send({ price: 30000 });

      expect(res.status).toBe(401);
    });

    it("returns 403 for regular user without update permission", async () => {
      mockUserSession();
      const row = await seedVehicle({});

      const res = await request(app)
        .put(`/api/v1/vehicles/${row.id}`)
        .send({ price: 30000 });

      expect(res.status).toBe(403);
    });

    it("updates a vehicle", async () => {
      mockAdminSession();
      const row = await seedVehicle({ price: 25000 });

      const res = await request(app)
        .put(`/api/v1/vehicles/${row.id}`)
        .send({ price: 30000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(30000);
    });

    it("returns 404 for non-existent vehicle", async () => {
      mockAdminSession();

      const res = await request(app)
        .put("/api/v1/vehicles/00000000-0000-0000-0000-000000000000")
        .send({ price: 30000 });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/vehicles/:id", () => {
    it("returns 401 without authentication", async () => {
      mockNoSession();
      const row = await seedVehicle({});

      const res = await request(app).delete(`/api/v1/vehicles/${row.id}`);

      expect(res.status).toBe(401);
    });

    it("returns 403 for regular user without delete permission", async () => {
      mockUserSession();
      const row = await seedVehicle({});

      const res = await request(app).delete(`/api/v1/vehicles/${row.id}`);

      expect(res.status).toBe(403);
    });

    it("deletes a vehicle", async () => {
      mockAdminSession();
      const row = await seedVehicle({});

      const res = await request(app).delete(`/api/v1/vehicles/${row.id}`);

      expect(res.status).toBe(204);

      const check = await request(app).get("/api/v1/vehicles");
      expect(check.body.data).toHaveLength(0);
    });

    it("returns 404 for non-existent vehicle", async () => {
      mockAdminSession();

      const res = await request(app).delete(
        "/api/v1/vehicles/00000000-0000-0000-0000-000000000000",
      );

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/v1/vehicles/:id/purchase", () => {
    it("returns 401 without authentication", async () => {
      mockNoSession();
      const row = await seedVehicle({ quantity: 3 });

      const res = await request(app).post(`/api/v1/vehicles/${row.id}/purchase`);

      expect(res.status).toBe(401);
    });

    it("allows regular user to purchase", async () => {
      mockUserSession();
      const row = await seedVehicle({ quantity: 3 });

      const res = await request(app).post(`/api/v1/vehicles/${row.id}/purchase`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(2);
    });

    it("returns 409 when out of stock", async () => {
      mockAdminSession();
      const row = await seedVehicle({ quantity: 0 });

      const res = await request(app).post(`/api/v1/vehicles/${row.id}/purchase`);

      expect(res.status).toBe(409);
    });

    it("returns 404 for non-existent vehicle", async () => {
      mockAdminSession();

      const res = await request(app).post(
        "/api/v1/vehicles/00000000-0000-0000-0000-000000000000/purchase",
      );

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/v1/vehicles/:id/restock", () => {
    it("returns 401 without authentication", async () => {
      mockNoSession();
      const row = await seedVehicle({ quantity: 3 });

      const res = await request(app)
        .post(`/api/v1/vehicles/${row.id}/restock`)
        .send({ amount: 5 });

      expect(res.status).toBe(401);
    });

    it("returns 403 for regular user without restock permission", async () => {
      mockUserSession();
      const row = await seedVehicle({ quantity: 3 });

      const res = await request(app)
        .post(`/api/v1/vehicles/${row.id}/restock`)
        .send({ amount: 5 });

      expect(res.status).toBe(403);
    });

    it("restocks a vehicle", async () => {
      mockAdminSession();
      const row = await seedVehicle({ quantity: 3 });

      const res = await request(app)
        .post(`/api/v1/vehicles/${row.id}/restock`)
        .send({ amount: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(8);
    });

    it("returns 400 with invalid amount", async () => {
      mockAdminSession();
      const row = await seedVehicle({ quantity: 3 });

      const res = await request(app)
        .post(`/api/v1/vehicles/${row.id}/restock`)
        .send({ amount: -5 });

      expect(res.status).toBe(400);
    });

    it("returns 404 for non-existent vehicle", async () => {
      mockAdminSession();

      const res = await request(app)
        .post("/api/v1/vehicles/00000000-0000-0000-0000-000000000000/restock")
        .send({ amount: 5 });

      expect(res.status).toBe(404);
    });
  });
});
