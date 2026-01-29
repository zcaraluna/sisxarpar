"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Inscripcion {
  id: string;
  estado: string;
  fechaInscripcion: string;
  observaciones?: string;
  alumno: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    cedula?: string;
    telefono?: string;
  };
  curso: {
    id: string;
    nombre: string;
    codigo: string;
    costo: number;
    escuela: {
      nombre: string;
    };
  };
  factura?: {
    id: string;
    numero: string;
    estado: string;
  };
}

export default function InscripcionesList() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState<string>("");

  useEffect(() => {
    fetchInscripciones();
  }, [estadoFilter]);

  const fetchInscripciones = async () => {
    try {
      const url = estadoFilter
        ? `/api/inscripciones?estado=${estadoFilter}`
        : "/api/inscripciones";
      const response = await fetch(url);
      const data = await response.json();
      setInscripciones(data);
    } catch (error) {
      console.error("Error al cargar inscripciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const estadoLabels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    INSCRITO: "Inscrito",
    CANCELADO: "Cancelado",
  };

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-secondary text-secondary-foreground",
    INSCRITO: "bg-primary text-primary-foreground",
    CANCELADO: "bg-destructive text-destructive-foreground",
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="flex h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="INSCRITO">Inscrito</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div className="bg-card border shadow-sm overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-border">
          {inscripciones.length === 0 ? (
            <li className="px-6 py-4 text-center text-muted-foreground">
              No hay inscripciones registradas
            </li>
          ) : (
            inscripciones.map((inscripcion) => (
              <li key={inscripcion.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-semibold text-foreground">
                        {inscripcion.alumno.nombre} {inscripcion.alumno.apellido}
                      </p>
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${estadoColors[inscripcion.estado]
                          }`}
                      >
                        {estadoLabels[inscripcion.estado]}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>{inscripcion.curso.escuela.nombre}</span>
                      <span className="mx-2 text-border">•</span>
                      <span>{inscripcion.curso.nombre}</span>
                      <span className="mx-2 text-border">•</span>
                      <span className="font-semibold text-foreground">G. {inscripcion.curso.costo.toLocaleString()}</span>
                    </div>
                    {inscripcion.factura && (
                      <div className="mt-1 text-xs text-muted-foreground/70">
                        Factura: {inscripcion.factura.numero} - {inscripcion.factura.estado}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/encargado/${inscripcion.id}`}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

