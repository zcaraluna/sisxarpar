import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Rol } from "@prisma/client";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const path = request.nextUrl.pathname;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = (session.user as any)?.role as Rol;

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rutas protegidas por rol
  const roleRoutes: Record<Rol, string[]> = {
    [Rol.ADMIN]: ["/admin", "/estadisticas"],
    [Rol.ENCARGADO]: ["/encargado"],
    [Rol.CAJERO]: ["/cajero", "/estadisticas"],
    [Rol.PROFESOR]: ["/profesor"],
    [Rol.JEFE_ESTUDIOS]: ["/jefe-estudios", "/estadisticas"],
    [Rol.ALUMNO]: ["/alumno"],
  };

  // Verificar si el usuario tiene acceso a la ruta
  const allowedRoutes = roleRoutes[role] || [];
  const hasAccess = allowedRoutes.some((route) => path.startsWith(route));

  if (!hasAccess && path.startsWith("/dashboard")) {
    // Redirigir según el rol
    const redirectMap: Record<Rol, string> = {
      [Rol.ADMIN]: "/admin",
      [Rol.ENCARGADO]: "/encargado",
      [Rol.CAJERO]: "/cajero",
      [Rol.PROFESOR]: "/profesor",
      [Rol.JEFE_ESTUDIOS]: "/jefe-estudios",
      [Rol.ALUMNO]: "/alumno",
    };

    return NextResponse.redirect(new URL(redirectMap[role] || "/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/encargado/:path*",
    "/cajero/:path*",
    "/profesor/:path*",
    "/jefe-estudios/:path*",
    "/alumno/:path*",
    "/estadisticas/:path*",
    "/dashboard/:path*",
  ],
};

