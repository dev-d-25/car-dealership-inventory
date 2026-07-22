import { toNodeHandler } from "better-auth/node";
import { auth } from "../../lib/auth";

export const authHandler = toNodeHandler(auth);
