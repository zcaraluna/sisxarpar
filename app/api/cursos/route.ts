import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const escuelaId = searchParams.get("escuelaId");

    const where: any = {
      activo: true,
    };

    if (escuelaId) {
      where.escuelaId = escuelaId;
    }

    const cursos = await prisma.cursos.findMany({
      where,
      include: {
        escuela: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(cursos);
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return NextResponse.json(
      { error: "Error al obtener cursos" },
      { status: 500 }
    );
  }
}

