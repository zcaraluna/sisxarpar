import { NextRequest, NextResponse } from "next/server";
import { getCiudadesByDepartamento } from "@/lib/paraguay-data";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departamento = searchParams.get("departamento");

    if (!departamento) {
      return NextResponse.json(
        { error: "Departamento requerido" },
        { status: 400 }
      );
    }

    const ciudades = getCiudadesByDepartamento(departamento);
    return NextResponse.json(ciudades);
  } catch (error) {
    console.error("Error al obtener ciudades:", error);
    return NextResponse.json(
      { error: "Error al obtener ciudades" },
      { status: 500 }
    );
  }
}

