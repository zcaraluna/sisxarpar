import fs from "fs";
import path from "path";

interface DepartamentoCiudad {
  departamento: string;
  distrito: string;
}

let paraguayData: DepartamentoCiudad[] | null = null;

export function getParaguayData(): DepartamentoCiudad[] {
  if (paraguayData) {
    return paraguayData;
  }

  try {
    // Intentar leer desde la raíz del proyecto primero
    let filePath = path.join(process.cwd(), "paraguay.csv");
    
    if (!fs.existsSync(filePath)) {
      // Si no existe, intentar desde public
      filePath = path.join(process.cwd(), "public", "paraguay.csv");
    }

    if (!fs.existsSync(filePath)) {
      console.error("No se encontró el archivo paraguay.csv");
      return [];
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n").slice(1); // Skip header

    paraguayData = lines
      .filter((line) => line.trim())
      .map((line) => {
        const [departamento, distrito] = line.split(";");
        return {
          departamento: departamento?.trim() || "",
          distrito: distrito?.trim() || "",
        };
      })
      .filter((item) => item.departamento && item.distrito);

    return paraguayData;
  } catch (error) {
    console.error("Error al leer paraguay.csv:", error);
    return [];
  }
}

export function getDepartamentos(): string[] {
  const data = getParaguayData();
  const departamentos = new Set(data.map((item) => item.departamento));
  return Array.from(departamentos).sort();
}

export function getCiudadesByDepartamento(departamento: string): string[] {
  const data = getParaguayData();
  const ciudades = data
    .filter((item) => item.departamento === departamento)
    .map((item) => item.distrito);
  return Array.from(new Set(ciudades)).sort();
}

