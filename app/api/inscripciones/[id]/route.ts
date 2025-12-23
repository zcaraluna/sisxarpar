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

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const role = (session.user as any)?.role as Rol;

    let where: any = { id };

    // Si es alumno, solo ver sus propias inscripciones
    if (role === Rol.ALUMNO) {
      where.alumnoId = (session.user as any)?.id;
    }

    const inscripcion = await prisma.inscripcion.findUnique({
      where,
      include: {
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            cedula: true,
            telefono: true,
            direccion: true,
          },
        },
        curso: {
          include: {
            escuela: true,
          },
        },
        factura: {
          include: {
            cajero: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });

    if (!inscripcion) {
      return NextResponse.json(
        { error: "Inscripción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(inscripcion);
  } catch (error) {
    console.error("Error al obtener inscripción:", error);
    return NextResponse.json(
      { error: "Error al obtener inscripción" },
      { status: 500 }
    );
  }
}

