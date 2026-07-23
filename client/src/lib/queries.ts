import { queryOptions } from "@tanstack/react-query"
import { auth, vehicles } from "./api"

// Query Key Factories
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
}

export const vehicleKeys = {
  all: ["vehicles"] as const,
  lists: () => [...vehicleKeys.all, "list"] as const,
  list: (params: { page?: number; limit?: number }) =>
    [...vehicleKeys.lists(), params] as const,
  searches: () => [...vehicleKeys.all, "search"] as const,
  search: (params: Record<string, unknown>) =>
    [...vehicleKeys.searches(), params] as const,
  details: () => [...vehicleKeys.all, "detail"] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
}

// Query Options Factories
export const authQueryOptions = {
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: () => auth.me(),
      staleTime: 5 * 60 * 1000, // 5 minutes - user data rarely changes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),
}

export const vehicleQueryOptions = {
  list: (page = 1, limit = 10) =>
    queryOptions({
      queryKey: vehicleKeys.list({ page, limit }),
      queryFn: () => vehicles.list(page, limit),
      staleTime: 30 * 1000, // 30 seconds - inventory changes moderately
    }),

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
  }) =>
    queryOptions({
      queryKey: vehicleKeys.search(params),
      queryFn: () => vehicles.search(params),
      staleTime: 30 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: vehicleKeys.detail(id),
      queryFn: () => vehicles.get(id),
      staleTime: 60 * 1000, // 1 minute - individual vehicle
      enabled: !!id,
    }),
}
