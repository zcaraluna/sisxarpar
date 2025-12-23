import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Rol, EstadoFactura, TipoFacturacion } from "@prisma/client";
import { z } from "zod";

const facturaSchema = z.object({
  inscripcionId: z.string().min(1),
  monto: z.number().positive(),
  tipoFacturacion: z.enum(["PROPIO", "TERCERO"]),
  nombreTercero: z.string().optional(),
  cedulaTercero: z.string().optional(),
  direccionTercero: z.string().optional(),
  observaciones: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== Rol.CAJERO) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = facturaSchema.parse(body);

    // Verificar que la inscripción existe y no tiene factura
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: data.inscripcionId },
      include: {
        factura: true,
        curso: true,
      },
    });

    if (!inscripcion) {
      return NextResponse.json(
        { error: "Inscripción no encontrada" },
        { status: 404 }
      );
    }

    if (inscripcion.factura) {
      return NextResponse.json(
        { error: "La inscripción ya tiene una factura" },
        { status: 400 }
      );
    }

    // Generar número de factura
    const count = await prisma.factura.count();
    const numeroFactura = `FAC-${String(count + 1).padStart(6, "0")}`;

    // Crear factura (ya pagada porque el cajero la genera al cobrar)
    const factura = await prisma.factura.create({
      data: {
        numero: numeroFactura,
        inscripcionId: data.inscripcionId,
        cajeroId: (session.user as any)?.id,
        monto: data.monto,
        tipoFacturacion: data.tipoFacturacion as TipoFacturacion,
        nombreTercero: data.nombreTercero,
        cedulaTercero: data.cedulaTercero,
        direccionTercero: data.direccionTercero,
        estado: EstadoFactura.PAGADA,
        fechaPago: new Date(),
        observaciones: data.observaciones,
      },
      include: {
        inscripcion: {
          include: {
            alumno: true,
            curso: {
              include: {
                escuela: true,
              },
            },
          },
        },
        cajero: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Actualizar estado de inscripción
    await prisma.inscripcion.update({
      where: { id: data.inscripcionId },
      data: { estado: "INSCRITO" },
    });

    return NextResponse.json(factura, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error al crear factura:", error);
    return NextResponse.json(
      { error: "Error al crear factura" },
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

    // Si es cajero, solo ver sus facturas generadas
    if (role === Rol.CAJERO) {
      where.cajeroId = (session.user as any)?.id;
    }

    const facturas = await prisma.factura.findMany({
      where,
      include: {
        inscripcion: {
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
          },
        },
        cajero: {
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

    return NextResponse.json(facturas);
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return NextResponse.json(
      { error: "Error al obtener facturas" },
      { status: 500 }
    );
  }
}

