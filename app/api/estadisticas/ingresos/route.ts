import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Rol, EstadoFactura } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const role = (session.user as any)?.role as Rol;
    const allowedRoles: Rol[] = [Rol.ADMIN, Rol.JEFE_ESTUDIOS, Rol.CAJERO];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");
    const escuelaId = searchParams.get("escuelaId");
    const cursoId = searchParams.get("cursoId");
    const tipoFacturacion = searchParams.get("tipoFacturacion");

    let where: any = {
      estado: EstadoFactura.PAGADA,
    };

    if (fechaInicio || fechaFin) {
      where.fechaPago = {};
      if (fechaInicio) {
        where.fechaPago.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        where.fechaPago.lte = new Date(fechaFin);
      }
    }

    if (tipoFacturacion) {
      where.tipoFacturacion = tipoFacturacion;
    }

    const facturas = await prisma.factura.findMany({
      where,
      include: {
        inscripcion: {
          include: {
            curso: {
              include: {
                escuela: true,
              },
            },
          },
        },
      },
    });

    // Filtrar por escuela o curso si se especifica
    let facturasFiltradas = facturas;
    if (escuelaId) {
      facturasFiltradas = facturasFiltradas.filter(
        (f) => f.inscripcion.curso.escuelaId === escuelaId
      );
    }
    if (cursoId) {
      facturasFiltradas = facturasFiltradas.filter(
        (f) => f.inscripcion.cursoId === cursoId
      );
    }

    // Calcular estadísticas
    const totalIngresos = facturasFiltradas.reduce(
      (sum, f) => sum + Number(f.monto),
      0
    );

    const ingresosPorEscuela = facturasFiltradas.reduce((acc, f) => {
      const escuelaNombre = f.inscripcion.curso.escuela.nombre;
      acc[escuelaNombre] = (acc[escuelaNombre] || 0) + Number(f.monto);
      return acc;
    }, {} as Record<string, number>);

    const ingresosPorCurso = facturasFiltradas.reduce((acc, f) => {
      const cursoNombre = f.inscripcion.curso.nombre;
      acc[cursoNombre] = (acc[cursoNombre] || 0) + Number(f.monto);
      return acc;
    }, {} as Record<string, number>);

    const ingresosPorTipo = facturasFiltradas.reduce((acc, f) => {
      acc[f.tipoFacturacion] = (acc[f.tipoFacturacion] || 0) + Number(f.monto);
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por fecha para gráfico de tendencias
    const ingresosPorFecha = facturasFiltradas.reduce((acc, f) => {
      if (f.fechaPago) {
        const fecha = new Date(f.fechaPago).toISOString().split("T")[0];
        acc[fecha] = (acc[fecha] || 0) + Number(f.monto);
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalIngresos,
      totalFacturas: facturasFiltradas.length,
      ingresosPorEscuela,
      ingresosPorCurso,
      ingresosPorTipo,
      ingresosPorFecha,
      facturas: facturasFiltradas.map((f) => ({
        id: f.id,
        numero: f.numero,
        monto: Number(f.monto),
        fechaPago: f.fechaPago,
        tipoFacturacion: f.tipoFacturacion,
        escuela: f.inscripcion.curso.escuela.nombre,
        curso: f.inscripcion.curso.nombre,
      })),
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}

