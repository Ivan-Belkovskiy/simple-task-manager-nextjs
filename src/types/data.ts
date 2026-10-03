import { Prisma } from "@prisma/client";

export type AppAccount = Prisma.app_accountsGetPayload<{ omit: { password_hash: true } }>;