import type { Response } from "express";

type ApiErrorBody = {
  error?: string;
  error_description?: string;
  errors?: unknown;
  [key: string]: unknown;
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public body?: Omit<ApiErrorBody, "message">,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, "BAD_REQUEST", message);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, "CONFLICT", message);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static internalServerError(message: string): ApiError {
    return new ApiError(500, "INTERNAL_SERVER_ERROR", message);
  }

  static validation(message: string, errors?: unknown): ApiError {
    return new ApiError(400, "VALIDATION_ERROR", message, { errors });
  }

  static oauth(
    statusCode: number,
    error: string,
    error_description: string,
  ): ApiError {
    return new ApiError(statusCode, error, error_description, {
      error,
      error_description,
    });
  }

  static invalidRequest(error_description: string): ApiError {
    return this.oauth(400, "invalid_request", error_description);
  }

  static invalidGrant(error_description: string): ApiError {
    return this.oauth(400, "invalid_grant", error_description);
  }

  static invalidToken(error_description: string): ApiError {
    return this.oauth(401, "invalid_token", error_description);
  }

  static outOfStock(vehicleId: string): ApiError {
    return new ApiError(409, "OUT_OF_STOCK", `Out of stock: ${vehicleId}`);
  }

  static vehicleNotFound(id: string): ApiError {
    return new ApiError(404, "VEHICLE_NOT_FOUND", `Vehicle not found: ${id}`);
  }

  send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...this.body,
      },
    });
  }
}
