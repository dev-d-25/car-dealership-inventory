import type { Response } from "express";

export interface Pagination {
  currentPage: number;
  total: number;
  limit: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static paginated<T>(
    res: Response,
    data: T,
    pagination: Pagination,
    statusCode = 200,
  ): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      pagination,
    });
  }

  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
