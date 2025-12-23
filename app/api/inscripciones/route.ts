import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Rol, EstadoInscripcion } from "@prisma/client";
import { z } from "zod";

const inscripcionSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  email: z.string().email(),
  cedula: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  cursoId: z.string().min(1),
  observaciones: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== Rol.ENCARGADO) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = inscripcionSchema.parse(body);

    // Verificar si el usuario ya existe
    let usuario = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    // Si no existe, crear el usuario como alumno
    if (!usuario) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(data.cedula || "123456", 10);

      usuario = await prisma.usuario.create({
        data: {
          email: data.email,
          password: hashedPassword,
          nombre: data.nombre,
          apellido: data.apellido,
          cedula: data.cedula,
          telefono: data.telefono,
          direccion: data.direccion,
          rol: Rol.ALUMNO,
        },
      });
    }

    // Verificar si ya está inscrito en el curso
    const inscripcionExistente = await prisma.inscripcion.findUnique({
      where: {
        alumnoId_cursoId: {
          alumnoId: usuario.id,
          cursoId: data.cursoId,
        },
      },
    });

    if (inscripcionExistente) {
      return NextResponse.json(
        { error: "El alumno ya está inscrito en este curso" },
        { status: 400 }
      );
    }

    // Crear la inscripción
    const inscripcion = await prisma.inscripcion.create({
      data: {
        alumnoId: usuario.id,
        cursoId: data.cursoId,
        estado: EstadoInscripcion.PENDIENTE,
        observaciones: data.observaciones,
      },
      include: {
        alumno: true,
        curso: {
          include: {
            escuela: true,
          },
        },
      },
    });

    return NextResponse.json(inscripcion, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error al crear inscripción:", error);
    return NextResponse.json(
      { error: "Error al crear inscripción" },
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
    const estado = searchParams.get("estado");

    let where: any = {};

    if (estado) {
      where.estado = estado;
    }

    // Si es alumno, solo ver sus propias inscripciones
    if (role === Rol.ALUMNO) {
      where.alumnoId = (session.user as any)?.id;
    }

    const inscripciones = await prisma.inscripcion.findMany({
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
          },
        },
        curso: {
          include: {
            escuela: true,
          },
        },
        factura: true,
      },
      orderBy: {
        fechaInscripcion: "desc",
      },
    });

    return NextResponse.json(inscripciones);
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);
    return NextResponse.json(
      { error: "Error al obtener inscripciones" },
      { status: 500 }
    );
  }
}

