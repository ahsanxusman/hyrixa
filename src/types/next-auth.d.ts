import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole | null;
      emailVerified: Date | null;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole | null;
    emailVerified: Date | null;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole | null;
    emailVerified: Date | null;
    isAdmin: boolean;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: UserRole | null;
    isAdmin: boolean;
  }
}
