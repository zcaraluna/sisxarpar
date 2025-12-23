import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Rol } from "@prisma/client";
import { z } from "zod";

const certificadoSchema = z.object({
  alumnoId: z.string().min(1),
  cursoId: z.string().min(1),
  fechaFinalizacion: z.string().min(1),
  observaciones: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== Rol.JEFE_ESTUDIOS) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = certificadoSchema.parse(body);
    const jefeEstudiosId = (session.user as any)?.id;

    // Verificar que el alumno está inscrito en el curso
    const inscripcion = await prisma.inscripcion.findUnique({
      where: {
        alumnoId_cursoId: {
          alumnoId: data.alumnoId,
          cursoId: data.cursoId,
        },
      },
      include: {
        curso: {
          include: {
            materias: true,
          },
        },
      },
    });

    if (!inscripcion || inscripcion.estado !== "INSCRITO") {
      return NextResponse.json(
        { error: "El alumno no está inscrito en este curso" },
        { status: 400 }
      );
    }

    // Obtener todas las notas del alumno en este curso
    const materiasIds = inscripcion.curso.materias.map((m) => m.id);
    const notas = await prisma.nota.findMany({
      where: {
        alumnoId: data.alumnoId,
        materiaId: {
          in: materiasIds,
        },
      },
    });

    if (notas.length === 0) {
      return NextResponse.json(
        { error: "El alumno no tiene notas registradas" },
        { status: 400 }
      );
    }

    // Calcular promedio
    const promedio =
      notas.reduce((sum, nota) => sum + Number(nota.calificacion), 0) /
      notas.length;

    // Generar número de certificado
    const count = await prisma.certificado.count();
    const numeroCertificado = `CERT-${String(count + 1).padStart(6, "0")}`;

    // Crear certificado
    const certificado = await prisma.certificado.create({
      data: {
        numero: numeroCertificado,
        alumnoId: data.alumnoId,
        cursoId: data.cursoId,
        jefeEstudiosId,
        fechaFinalizacion: new Date(data.fechaFinalizacion),
        promedio,
        observaciones: data.observaciones,
      },
    });

    // Crear relaciones con materias
    const certificadoMaterias = await Promise.all(
      notas.map((nota) =>
        prisma.certificadoMateria.create({
          data: {
            certificadoId: certificado.id,
            materiaId: nota.materiaId,
            calificacion: nota.calificacion,
            aprobada: Number(nota.calificacion) >= 60,
          },
        })
      )
    );

    const certificadoCompleto = await prisma.certificado.findUnique({
      where: { id: certificado.id },
      include: {
        alumno: true,
        curso: {
          include: {
            escuela: true,
          },
        },
        materias: {
          include: {
            materia: true,
          },
        },
        jefeEstudios: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return NextResponse.json(certificadoCompleto, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error al crear certificado:", error);
    return NextResponse.json(
      { error: "Error al crear certificado" },
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
    const alumnoId = searchParams.get("alumnoId");
    const cursoId = searchParams.get("cursoId");

    let where: any = {};

    if (alumnoId) {
      where.alumnoId = alumnoId;
    }

    if (cursoId) {
      where.cursoId = cursoId;
    }

    // Si es alumno, solo ver sus propios certificados
    if (role === Rol.ALUMNO) {
      where.alumnoId = (session.user as any)?.id;
    }

    const certificados = await prisma.certificado.findMany({
      where,
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
        curso: {
          include: {
            escuela: true,
          },
        },
        materias: {
          include: {
            materia: true,
          },
        },
        jefeEstudios: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        fechaEmision: "desc",
      },
    });

    return NextResponse.json(certificados);
  } catch (error) {
    console.error("Error al obtener certificados:", error);
    return NextResponse.json(
      { error: "Error al obtener certificados" },
      { status: 500 }
    );
  }
}

