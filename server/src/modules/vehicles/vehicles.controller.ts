import type { Request, Response } from "express";
import type { ValidatedRequest } from "../../common/middleware/validate.middleware.js";
import { ApiError } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import type {
  CreateVehicleInput,
  ListVehicleInput,
  RestockVehicleInput,
  SearchVehicleInput,
  UpdateVehicleInput,
} from "./vehicles.dto.js";
import { VehicleService } from "./vehicles.service.js";

function paginationMeta(page: number, limit: number, total: number) {
  return {
    currentPage: page,
    total,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function getValidated<T>(req: Request): T {
  return (req as ValidatedRequest<T>).validated;
}

export function createVehicleController(service: VehicleService) {
  return {
    async createVehicle(req: Request, res: Response) {
      const input = getValidated<CreateVehicleInput>(req);
      const vehicle = await service.createVehicle(input);
      return ApiResponse.created(res, vehicle);
    },

    async listVehicles(req: Request, res: Response) {
      const { page, limit } = getValidated<ListVehicleInput>(req);
      const result = await service.listVehicles({ page, limit });
      return ApiResponse.paginated(
        res,
        result.data,
        paginationMeta(page, limit, result.total),
      );
    },

    async searchVehicles(req: Request, res: Response) {
      const filters = getValidated<SearchVehicleInput>(req);
      const result = await service.searchVehicles(filters);
      return ApiResponse.paginated(
        res,
        result.data,
        paginationMeta(filters.page, filters.limit, result.total),
      );
    },

    async updateVehicle(req: Request, res: Response) {
      const input = getValidated<UpdateVehicleInput>(req);
      const updated = await service.updateVehicle(
        getRouteParam(req.params.id),
        input,
      );

      if (!updated) {
        throw ApiError.notFound("Vehicle not found");
      }

      return ApiResponse.success(res, updated);
    },

    async deleteVehicle(req: Request, res: Response) {
      const id = getRouteParam(req.params.id);
      const existing = await service.getVehicleById(id);

      if (!existing) {
        throw ApiError.notFound("Vehicle not found");
      }

      await service.deleteVehicle(id);
      return ApiResponse.noContent(res);
    },

    async purchaseVehicle(req: Request, res: Response) {
      const purchased = await service.purchaseVehicle(
        getRouteParam(req.params.id),
      );
      return ApiResponse.success(res, purchased);
    },

    async restockVehicle(req: Request, res: Response) {
      const { amount } = getValidated<RestockVehicleInput>(req);
      const restocked = await service.restockVehicle(
        getRouteParam(req.params.id),
        amount,
      );
      return ApiResponse.success(res, restocked);
    },
  };
}

export type VehicleController = ReturnType<typeof createVehicleController>;
