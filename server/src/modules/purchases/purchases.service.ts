import type { ListPurchasesInput } from "./purchases.dto.js";
import type { PurchaseRepository } from "./purchase-repository.js";

export class PurchaseService {
  constructor(private repo: PurchaseRepository) {}

  async createPurchase(input: {
    vehicleId: string;
    userId: string;
    quantity: number;
    unitPrice: number;
  }) {
    return this.repo.create(input);
  }

  async getPurchase(id: string) {
    return this.repo.findById(id);
  }

  async listPurchases(filters: ListPurchasesInput) {
    return this.repo.list(filters);
  }

  async getDashboardStats() {
    return this.repo.getDashboardStats();
  }

  async getChartData(days: number) {
    return this.repo.getChartData(days);
  }
}
