import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Rol } from "@prisma/client";
import EstadisticasDashboard from "@/components/estadisticas/EstadisticasDashboard";

export default async function EstadisticasPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role as Rol;
  const allowedRoles: Rol[] = [Rol.ADMIN, Rol.JEFE_ESTUDIOS, Rol.CAJERO];

  if (!allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">
        Estadísticas de Ingresos
      </h1>
      <EstadisticasDashboard />
    </div>
  );
}

