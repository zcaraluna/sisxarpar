import { Rol } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    role: Rol;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Rol;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Rol;
    id: string;
  }
}

