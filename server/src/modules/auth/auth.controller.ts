import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { ApiError } from "../../common/utils/api-error.js";

export const getMe = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw ApiError.unauthorized("Not authenticated");
  }

  return res.json({ user: session.user });
};
