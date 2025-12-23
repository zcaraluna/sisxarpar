import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Rol } from "@prisma/client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  // Redirigir según el rol
  const redirectMap: Record<Rol, string> = {
    [Rol.ADMIN]: "/admin",
    [Rol.ENCARGADO]: "/encargado",
    [Rol.CAJERO]: "/cajero",
    [Rol.PROFESOR]: "/profesor",
    [Rol.JEFE_ESTUDIOS]: "/jefe-estudios",
    [Rol.ALUMNO]: "/alumno",
  };

  redirect(redirectMap[role] || "/login");
}

