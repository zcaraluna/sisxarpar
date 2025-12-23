import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Rol } from "@prisma/client";
import InscripcionesPendientesList from "@/components/caja/InscripcionesPendientesList";

export default async function CajeroPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== Rol.CAJERO) {
    redirect("/login");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-navy-900">Caja</h1>
          <p className="mt-2 text-sm text-navy-700">
            Gestiona los cobros y facturas de las inscripciones
          </p>
        </div>
      </div>

      <InscripcionesPendientesList />
    </div>
  );
}

