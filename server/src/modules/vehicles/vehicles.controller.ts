import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import type {
  CreateVehicleInput,
  ListVehicleInput,
  RestockVehicleInput,
  SearchVehicleInput,
  UpdateVehicleInput,
} from "./vehicles.dto.js";
import * as vehiclesService from "./vehicles.service.js";

function paginationMeta(page: number, limit: number, total: number) {
  return {
    currentPage: page,
    total,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

export async function createVehicle(req: Request, res: Response) {
  const input = req.validated as CreateVehicleInput;
  const vehicle = await vehiclesService.createVehicle(input);
  return ApiResponse.created(res, vehicle);
}

export async function listVehicles(req: Request, res: Response) {
  const { page, limit } = req.validated as ListVehicleInput;
  const result = await vehiclesService.listVehicles({ page, limit });
  return ApiResponse.paginated(
    res,
    result.data,
    paginationMeta(page, limit, result.total),
  );
}

export async function searchVehicles(req: Request, res: Response) {
  const filters = req.validated as SearchVehicleInput;
  const result = await vehiclesService.searchVehicles(filters);
  return ApiResponse.paginated(
    res,
    result.data,
    paginationMeta(filters.page, filters.limit, result.total),
  );
}

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export async function updateVehicle(req: Request, res: Response) {
  const input = req.validated as UpdateVehicleInput;
  const updated = await vehiclesService.updateVehicle(
    getRouteParam(req.params.id),
    input,
  );

  if (!updated) {
    throw ApiError.notFound("Vehicle not found");
  }

  return ApiResponse.success(res, updated);
}

export async function deleteVehicle(req: Request, res: Response) {
  const id = getRouteParam(req.params.id);
  const existing = await vehiclesService.getVehicleById(id);

  if (!existing) {
    throw ApiError.notFound("Vehicle not found");
  }

  await vehiclesService.deleteVehicle(id);
  return ApiResponse.noContent(res);
}

export async function purchaseVehicle(req: Request, res: Response) {
  try {
    const purchased = await vehiclesService.purchaseVehicle(
      getRouteParam(req.params.id),
    );

    if (!purchased) {
      throw ApiError.notFound("Vehicle not found");
    }

    return ApiResponse.success(res, purchased);
  } catch (error) {
    if (error instanceof Error && error.message === "Out of stock") {
      throw ApiError.conflict("Out of stock");
    }

    throw error;
  }
}

export async function restockVehicle(req: Request, res: Response) {
  const { amount } = req.validated as RestockVehicleInput;
  const restocked = await vehiclesService.restockVehicle(
    getRouteParam(req.params.id),
    amount,
  );

  if (!restocked) {
    throw ApiError.notFound("Vehicle not found");
  }

  return ApiResponse.success(res, restocked);
}
