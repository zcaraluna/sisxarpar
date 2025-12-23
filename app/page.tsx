import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-navy-900 mb-4">
          Sis-ARPAR
        </h1>
        <p className="text-navy-700 mb-8">
          Sistema de Administración de Institutos de la Armada Paraguaya
        </p>
        <a
          href="/login"
          className="inline-block bg-navy-700 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors"
        >
          Iniciar Sesión
        </a>
      </div>
    </div>
  );
}

