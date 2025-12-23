import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Rol } from "@prisma/client";
import CertificadosList from "@/components/jefe-estudios/CertificadosList";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default async function JefeEstudiosPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== Rol.JEFE_ESTUDIOS) {
    redirect("/login");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-navy-900">Certificados</h1>
          <p className="mt-2 text-sm text-navy-700">
            Gestiona los certificados de estudios de los alumnos
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link href="/jefe-estudios/nuevo">
            <Button>Nuevo Certificado</Button>
          </Link>
        </div>
      </div>

      <CertificadosList />
    </div>
  );
}

