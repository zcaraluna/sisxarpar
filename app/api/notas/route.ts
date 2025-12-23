import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Rol } from "@prisma/client";
import { z } from "zod";

const notaSchema = z.object({
  alumnoId: z.string().min(1),
  materiaId: z.string().min(1),
  calificacion: z.number().min(0).max(100),
  periodo: z.string().min(1),
  observaciones: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== Rol.PROFESOR) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = notaSchema.parse(body);
    const profesorId = (session.user as any)?.id;

    // Verificar que el profesor tiene asignada esta materia
    const materiaProfesor = await prisma.materiaProfesor.findUnique({
      where: {
        materiaId_profesorId: {
          materiaId: data.materiaId,
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

    // Crear o actualizar nota
    const nota = await prisma.nota.upsert({
      where: {
        alumnoId_materiaId_periodo: {
          alumnoId: data.alumnoId,
          materiaId: data.materiaId,
          periodo: data.periodo,
        },
      },
      update: {
        calificacion: data.calificacion,
        observaciones: data.observaciones,
        profesorId,
      },
      create: {
        alumnoId: data.alumnoId,
        materiaId: data.materiaId,
        profesorId,
        calificacion: data.calificacion,
        periodo: data.periodo,
        observaciones: data.observaciones,
      },
      include: {
        alumno: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        materia: {
          select: {
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(nota, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error al crear/actualizar nota:", error);
    return NextResponse.json(
      { error: "Error al guardar nota" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const role = (session.user as any)?.role as Rol;
    const searchParams = request.nextUrl.searchParams;
    const materiaId = searchParams.get("materiaId");
    const periodo = searchParams.get("periodo");
    const alumnoId = searchParams.get("alumnoId");

    let where: any = {};

    if (materiaId) {
      where.materiaId = materiaId;
    }

    if (periodo) {
      where.periodo = periodo;
    }

    if (alumnoId) {
      where.alumnoId = alumnoId;
    }

    // Si es profesor, solo ver notas de sus materias
    if (role === Rol.PROFESOR) {
      const profesorId = (session.user as any)?.id;
      const materiasAsignadas = await prisma.materiaProfesor.findMany({
        where: { profesorId },
        select: { materiaId: true },
      });

      where.materiaId = {
        in: materiasAsignadas.map((m) => m.materiaId),
      };
    }

    // Si es alumno, solo ver sus propias notas
    if (role === Rol.ALUMNO) {
      where.alumnoId = (session.user as any)?.id;
    }

    const notas = await prisma.nota.findMany({
      where,
      include: {
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        materia: {
          include: {
            curso: {
              include: {
                escuela: true,
              },
            },
          },
        },
        profesor: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return NextResponse.json(notas);
  } catch (error) {
    console.error("Error al obtener notas:", error);
    return NextResponse.json(
      { error: "Error al obtener notas" },
      { status: 500 }
    );
  }
}

