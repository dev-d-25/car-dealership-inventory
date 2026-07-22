import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
} from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  vehicle: [
    "create",
    "read",
    "update",
    "delete",
    "search",
    "purchase",
    "restock",
  ],
} as const;

export const ac = createAccessControl(statement);

export const superadmin = ac.newRole({
  ...adminAc.statements,
  vehicle: ["create", "read", "update", "delete", "search", "purchase", "restock"],
});

export const admin = ac.newRole({
  user: ["list", "get"],
  session: ["list", "revoke", "delete"],
  vehicle: ["create", "read", "update", "delete", "search", "purchase", "restock"],
});

export const moderator = ac.newRole({
  vehicle: ["create", "read", "update", "delete", "search", "purchase", "restock"],
});

export const user = ac.newRole({
  vehicle: ["read", "search", "purchase"],
});
