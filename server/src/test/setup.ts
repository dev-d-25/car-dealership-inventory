import { db } from "../db/index.js";
import { vehicle } from "../db/schema.js";

beforeEach(async () => {
  await db.delete(vehicle);
});

afterAll(async () => {
  await db.delete(vehicle);
});
