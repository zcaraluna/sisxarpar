import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Rol } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== Rol.PROFESOR) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const profesorId = (session.user as any)?.id;

    const materias = await prisma.materiaProfesor.findMany({
      where: {
        profesorId,
      },
      include: {
        materia: {
          include: {
            curso: {
              include: {
                escuela: true,
              },
            },
          },
        },
      },
      orderBy: {
        materia: {
          nombre: "asc",
        },
      },
    });

    return NextResponse.json(materias);
  } catch (error) {
    console.error("Error al obtener materias del profesor:", error);
    return NextResponse.json(
      { error: "Error al obtener materias" },
      { status: 500 }
    );
  }
}

