import type { Request, Response } from "express";
import type { ValidatedRequest } from "../../common/middleware/validate.middleware.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import type { ChartDataInput, ListPurchasesInput } from "./purchases.dto.js";
import { PurchaseService } from "./purchases.service.js";

function paginationMeta(page: number, limit: number, total: number) {
  return {
    currentPage: page,
    total,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

function getValidated<T>(req: Request): T {
  return (req as ValidatedRequest<T>).validated;
}

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export function createPurchaseController(service: PurchaseService) {
  return {
    async listPurchases(req: Request, res: Response) {
      const filters = getValidated<ListPurchasesInput>(req);
      const result = await service.listPurchases(filters);
      return ApiResponse.paginated(
        res,
        result.data,
        paginationMeta(filters.page, filters.limit, result.total),
      );
    },

    async getPurchase(req: Request, res: Response) {
      const purchase = await service.getPurchase(getRouteParam(req.params.id));
      if (!purchase) {
        return ApiResponse.success(res, null, 404);
      }
      return ApiResponse.success(res, purchase);
    },

    async getDashboardStats(_req: Request, res: Response) {
      const stats = await service.getDashboardStats();
      return ApiResponse.success(res, stats);
    },

    async getChartData(req: Request, res: Response) {
      const { days } = getValidated<ChartDataInput>(req);
      const data = await service.getChartData(days);
      return ApiResponse.success(res, data);
    },
  };
}

export type PurchaseController = ReturnType<typeof createPurchaseController>;
