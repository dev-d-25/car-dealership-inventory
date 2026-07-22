import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { ApiError } from "../utils/api-error.js";

declare module 'express' {
  interface Request {
    user?: typeof auth.$Infer.Session.user;
    session?: typeof auth.$Infer.Session.session;
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

export function requirePermission(resource: string, action: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const result = await auth.api.userHasPermission({
      body: {
        userId: req.user!.id,
        permissions: { [resource]: [action] },
      },
    });

    if (result.success) {
      next();
      return;
    }

    throw ApiError.forbidden("Insufficient permissions");
  };
}
