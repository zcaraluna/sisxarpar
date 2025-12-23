"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rol } from "@prisma/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const roleLabels: Record<Rol, string> = {
  [Rol.ADMIN]: "Administrador",
  [Rol.ENCARGADO]: "Encargado",
  [Rol.CAJERO]: "Cajero",
  [Rol.PROFESOR]: "Profesor",
  [Rol.JEFE_ESTUDIOS]: "Jefe de Estudios",
  [Rol.ALUMNO]: "Alumno",
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="text-navy-700">Cargando...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="text-navy-700">Verificando sesión...</div>
      </div>
    );
  }

  const role = (session.user as any)?.role as Rol;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { href: "/encargado", label: "Inscripciones", roles: [Rol.ENCARGADO] as Rol[] },
    { href: "/cajero", label: "Caja", roles: [Rol.CAJERO] as Rol[] },
    { href: "/profesor", label: "Notas", roles: [Rol.PROFESOR] as Rol[] },
    { href: "/jefe-estudios", label: "Certificados", roles: [Rol.JEFE_ESTUDIOS] as Rol[] },
    { href: "/alumno", label: "Mi Perfil", roles: [Rol.ALUMNO] as Rol[] },
    { href: "/admin", label: "Administración", roles: [Rol.ADMIN] as Rol[] },
    { href: "/estadisticas", label: "Estadísticas", roles: [Rol.ADMIN, Rol.JEFE_ESTUDIOS, Rol.CAJERO] as Rol[] },
  ].filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-navy-50">
      <nav className="bg-navy-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold">
                  Sis-ARPAR
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname.startsWith(item.href)
                        ? "border-white text-white"
                        : "border-transparent text-navy-200 hover:text-white hover:border-navy-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-navy-200">
                {session.user?.name} - {roleLabels[role]}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-navy-700 hover:bg-navy-600 px-4 py-2 rounded text-sm transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-navy-50 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}

