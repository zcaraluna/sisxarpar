import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Rol } from "@prisma/client";
import AlumnoDashboard from "@/components/alumno/AlumnoDashboard";

export default async function AlumnoPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== Rol.ALUMNO) {
    redirect("/login");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Mi Perfil</h1>
      <AlumnoDashboard />
    </div>
  );
}

