import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    return err.send(res);
  }

  console.error(err);
  return ApiError.internalServerError("Internal server error").send(res);
}
