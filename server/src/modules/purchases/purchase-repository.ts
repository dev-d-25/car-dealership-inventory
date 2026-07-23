export type Purchase = {
  id: string;
  vehicleId: string;
  userId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
};

export type PurchaseWithVehicle = Purchase & {
  vehicle: {
    id: string;
    maker: string;
    model: string;
    category: string;
    price: number;
  };
};

export type DashboardStats = {
  totalModels: number;
  totalRevenue: number;
  carCategories: number;
  outOfStockModels: number;
};

export type ChartDataPoint = {
  date: string;
  vehiclesSold: number;
  revenue: number;
};

export interface PurchaseRepository {
  create(input: {
    vehicleId: string;
    userId: string;
    quantity: number;
    unitPrice: number;
  }): Promise<Purchase>;
  findById(id: string): Promise<PurchaseWithVehicle | null>;
  list(filters: {
    page: number;
    limit: number;
    vehicleId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: PurchaseWithVehicle[]; total: number }>;
  getDashboardStats(): Promise<DashboardStats>;
  getChartData(days: number): Promise<ChartDataPoint[]>;
}
