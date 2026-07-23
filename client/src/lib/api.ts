import api from "./axios"
import type { AxiosResponse } from "axios"
import {
  paginatedVehicleSchema,
  singleVehicleSchema,
  singleUserSchema,
  searchVehicleSchema,
  createVehicleSchema,
  updateVehicleSchema,
  restockVehicleSchema,
  listVehicleSchema,
} from "./schemas"
import type { Vehicle, User } from "./schemas"

export type { Vehicle, User }

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    currentPage: number
    total: number
    limit: number
    totalPages: number
  }
}

export interface SingleResponse<T> {
  success: boolean
  data: T
}

export interface DashboardStats {
  totalModels: number
  totalRevenue: number
  carCategories: number
  outOfStockModels: number
}

export interface ChartDataPoint {
  date: string
  vehiclesSold: number
  revenue: number
}

export interface Purchase {
  id: string
  vehicleId: string
  userId: string
  quantity: number
  unitPrice: number
  createdAt: string
}

function validateResponse<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  return schema.parse(data)
}

function parseVehicleResponse(res: AxiosResponse<unknown>): PaginatedResponse<Vehicle> {
  return validateResponse(paginatedVehicleSchema, res.data)
}

function parseSingleVehicleResponse(res: AxiosResponse<unknown>): SingleResponse<Vehicle> {
  return validateResponse(singleVehicleSchema, res.data)
}

function parseSingleUserResponse(res: AxiosResponse<unknown>): SingleResponse<{ user: User }> {
  return validateResponse(singleUserSchema, res.data)
}

// Auth API
export const auth = {
  signUp: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/sign-up/email", data).then((r) => ({ data: { user: r.data.user } })),
  signIn: (data: { email: string; password: string }) =>
    api.post("/auth/sign-in/email", data).then((r) => ({ data: { user: r.data.user } })),
  signOut: () =>
    api.post("/auth/sign-out").then((r: AxiosResponse) => r.data),
  me: () =>
    api.get("/auth/me").then((r) => parseSingleUserResponse(r)),
}

// Vehicles API
export const vehicles = {
  list: (page = 1, limit = 10) => {
    const validated = listVehicleSchema.parse({ page, limit })
    return api.get<PaginatedResponse<Vehicle>>(`/vehicles?page=${validated.page}&limit=${validated.limit}`).then((r) => parseVehicleResponse(r))
  },
  search: (params: {
    maker?: string
    model?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  }) => {
    const validated = searchVehicleSchema.parse(params)
    const q = new URLSearchParams()
    Object.entries(validated).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v))
    })
    return api.get<PaginatedResponse<Vehicle>>(`/vehicles/search?${q}`).then((r) => parseVehicleResponse(r))
  },
  get: (id: string) =>
    api.get(`/vehicles/${id}`).then((r) => parseSingleVehicleResponse(r)),
  create: (data: {
    maker: string
    model: string
    category: string
    price: number
    quantity?: number
    description?: string
    imageUrl?: string
  }) => {
    const validated = createVehicleSchema.parse(data)
    return api.post(`/vehicles`, validated).then((r) => parseSingleVehicleResponse(r))
  },
  update: (id: string, data: Partial<{
    maker: string
    model: string
    category: string
    price: number
    quantity: number
    description: string
    imageUrl: string
  }>) => {
    const validated = updateVehicleSchema.parse(data)
    return api.put(`/vehicles/${id}`, validated).then((r) => parseSingleVehicleResponse(r))
  },
  delete: (id: string) =>
    api.delete(`/vehicles/${id}`).then((r: AxiosResponse) => r.data),
  purchase: (id: string) =>
    api.post(`/vehicles/${id}/purchase`).then((r) => parseSingleVehicleResponse(r)),
  restock: (id: string, amount: number) => {
    const validated = restockVehicleSchema.parse({ amount })
    return api.post(`/vehicles/${id}/restock`, validated).then((r) => parseSingleVehicleResponse(r))
  },
}

// Purchases API
export const purchases = {
  getDashboardStats: () =>
    api.get<SingleResponse<DashboardStats>>("/purchases/dashboard/stats").then((r) => r.data),
  getChartData: (days: number = 30) =>
    api.get<SingleResponse<ChartDataPoint[]>>(`/purchases/dashboard/chart?days=${days}`).then((r) => r.data),
  list: (params?: {
    page?: number
    limit?: number
    vehicleId?: string
    userId?: string
    startDate?: string
    endDate?: string
  }) => {
    const q = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") q.set(k, String(v))
      })
    }
    return api.get<PaginatedResponse<Purchase>>(`/purchases?${q}`).then((r) => r.data)
  },
  get: (id: string) =>
    api.get<SingleResponse<Purchase>>(`/purchases/${id}`).then((r) => r.data),
}
