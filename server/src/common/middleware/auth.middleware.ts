import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { ApiError } from "../utils/api-error.js";

declare global {
  namespace Express {
    interface Request {
      user?: typeof auth.$Infer.Session.user;
      session?: typeof auth.$Infer.Session.session;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw ApiError.unauthorized("Not authenticated");
  }

  req.user = session.user;
  req.session = session.session;
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const role = (req.user as { role?: string } | undefined)?.role;

  if (role !== "admin") {
    throw ApiError.forbidden("Admin access required");
  }

  next();
}
