import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { ApiError } from "../utils/api-error.js";

export type ValidatedRequest<T> = Omit<Request, "validated"> & {
  validated: T;
};

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw ApiError.validation("Validation failed", result.error.issues);
    }

    (req as ValidatedRequest<z.infer<T>>).validated = result.data;
    next();
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw ApiError.validation("Validation failed", result.error.issues);
    }

    (req as ValidatedRequest<z.infer<T>>).validated = result.data;
    next();
  };
}
