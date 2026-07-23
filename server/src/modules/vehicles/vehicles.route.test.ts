import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { app } from "../../app.js";
import { auth } from "../../lib/auth.js";
import { InMemoryVehicleRepository } from "./in-memory-vehicle-repository.js";
import { VehicleService } from "./vehicles.service.js";

const mockSession = {
  user: {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
  },
  session: {
    id: "session-1",
    userId: "user-1",
    token: "session-token",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    impersonatedBy: null,
  },
};

function mockAuthenticatedSession() {
  vi.spyOn(auth.api, "getSession").mockResolvedValue(mockSession);
}

describe("vehicles routes", () => {
  it("GET /api/v1/vehicles returns 401 without authentication", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue(null);

    const response = await request(app).get("/api/v1/vehicles");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/v1/vehicles returns paginated inventory for authenticated users", async () => {
    mockAuthenticatedSession();

    const response = await request(app).get("/api/v1/vehicles");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
