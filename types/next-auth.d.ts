import type { DefaultSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    /** Populated from the User model at sign-in; "user" when unset. */
    role?: "user" | "admin";
    banned?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      banned?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    /** Role claim read by the middleware guard. Hydrated lazily for old sessions. */
    role?: "user" | "admin";
  }
}
