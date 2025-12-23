import { NextResponse } from "next/server";
import { getDepartamentos } from "@/lib/paraguay-data";

export async function GET() {
  try {
    const departamentos = getDepartamentos();
    return NextResponse.json(departamentos);
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return NextResponse.json(
      { error: "Error al obtener departamentos" },
      { status: 500 }
    );
  }
}

