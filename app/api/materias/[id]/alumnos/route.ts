import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Rol } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== Rol.PROFESOR) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: materiaId } = await params;
    const profesorId = (session.user as any)?.id;

    // Verificar que el profesor tiene asignada esta materia
    const materiaProfesor = await prisma.materiaProfesor.findUnique({
      where: {
        materiaId_profesorId: {
          materiaId,
          profesorId,
        },
      },
    });

    if (!materiaProfesor) {
      return NextResponse.json(
        { error: "No tiene asignada esta materia" },
        { status: 403 }
      );
    }

    // Obtener alumnos inscritos en el curso de esta materia
    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      include: {
        curso: {
          include: {
            inscripciones: {
              where: {
                estado: "INSCRITO",
              },
              include: {
                alumno: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    cedula: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!materia) {
      return NextResponse.json(
        { error: "Materia no encontrada" },
        { status: 404 }
      );
    }

    const alumnos = materia.curso.inscripciones.map((inscripcion) => ({
      ...inscripcion.alumno,
      inscripcionId: inscripcion.id,
    }));

    return NextResponse.json(alumnos);
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    return NextResponse.json(
      { error: "Error al obtener alumnos" },
      { status: 500 }
    );
  }
}

