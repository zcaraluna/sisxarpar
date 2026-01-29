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
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card text-card-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight">
                  Sis-ARPAR
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname.startsWith(item.href)
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {session.user?.name} - {roleLabels[role]}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}

