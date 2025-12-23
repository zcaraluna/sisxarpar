import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const escuelas = await prisma.escuela.findMany({
      where: {
        activa: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(escuelas);
  } catch (error) {
    console.error("Error al obtener escuelas:", error);
    return NextResponse.json(
      { error: "Error al obtener escuelas" },
      { status: 500 }
    );
  }
}

