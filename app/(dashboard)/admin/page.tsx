import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Rol } from "@prisma/client";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default async function AdminPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== Rol.ADMIN) {
    redirect("/login");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Administración</h1>
        <p className="mt-2 text-sm text-navy-700">
          Panel de control del administrador del sistema
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-navy-600 mb-4">
            Administra usuarios del sistema
          </p>
          <Button variant="secondary" disabled>
            Próximamente
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Gestión de Escuelas
          </h2>
          <p className="text-sm text-navy-600 mb-4">
            Administra escuelas y cursos
          </p>
          <Button variant="secondary" disabled>
            Próximamente
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Estadísticas
          </h2>
          <p className="text-sm text-navy-600 mb-4">
            Ver estadísticas detalladas de ingresos
          </p>
          <Link href="/estadisticas">
            <Button variant="primary">Ver Estadísticas</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

