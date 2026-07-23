const API_BASE = "http://localhost:3000/api/v1";

interface ApiOptions {
  method?: string;
  body?: unknown;
  credentials?: RequestCredentials;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, credentials = "include" } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const message =
      err?.error?.message
      ?? err?.message
      ?? err?.error
      ?? `Request failed: ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Vehicle {
  id: string;
  maker: string;
  model: string;
  category: string;
  price: string;
  quantity: number;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    total: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export const auth = {
  signUp: (data: { name: string; email: string; password: string }) =>
    request<SingleResponse<User>>("/auth/sign-up/email", { method: "POST", body: data }),
  signIn: (data: { email: string; password: string }) =>
    request<SingleResponse<User>>("/auth/sign-in/email", { method: "POST", body: data }),
  signOut: () =>
    request("/auth/sign-out", { method: "POST" }),
  me: () =>
    request<SingleResponse<{ user: User }>>("/auth/me"),
};

export const vehicles = {
  list: (page = 1, limit = 10) =>
    request<PaginatedResponse<Vehicle>>(`/vehicles?page=${page}&limit=${limit}`),
  search: (params: {
    maker?: string;
    model?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    return request<PaginatedResponse<Vehicle>>(`/vehicles/search?${q}`);
  },
  get: (id: string) =>
    request<SingleResponse<Vehicle>>(`/vehicles/${id}`),
  create: (data: {
    maker: string;
    model: string;
    category: string;
    price: number;
    quantity?: number;
    description?: string;
    imageUrl?: string;
  }) => request<SingleResponse<Vehicle>>("/vehicles", { method: "POST", body: data }),
  update: (id: string, data: Partial<{
    maker: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
    description: string;
    imageUrl: string;
  }>) => request<SingleResponse<Vehicle>>(`/vehicles/${id}`, { method: "PUT", body: data }),
  delete: (id: string) =>
    request(`/vehicles/${id}`, { method: "DELETE" }),
  purchase: (id: string) =>
    request<SingleResponse<Vehicle>>(`/vehicles/${id}/purchase`, { method: "POST" }),
  restock: (id: string, amount: number) =>
    request<SingleResponse<Vehicle>>(`/vehicles/${id}/restock`, { method: "POST", body: { amount } }),
};
