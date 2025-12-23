import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Rol } from "@prisma/client";
import InscripcionesList from "@/components/inscripciones/InscripcionesList";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default async function EncargadoPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== Rol.ENCARGADO) {
    redirect("/login");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-navy-900">Inscripciones</h1>
          <p className="mt-2 text-sm text-navy-700">
            Gestiona las inscripciones de alumnos a los cursos
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link href="/encargado/nueva">
            <Button>Nueva Inscripción</Button>
          </Link>
        </div>
      </div>

      <InscripcionesList />
    </div>
  );
}

