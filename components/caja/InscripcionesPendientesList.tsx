"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Inscripcion {
  id: string;
  estado: string;
  fechaInscripcion: string;
  alumno: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    cedula?: string;
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
}

export default function InscripcionesPendientesList() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const fetchInscripciones = async () => {
    try {
      const response = await fetch("/api/inscripciones?estado=PENDIENTE");
      const data = await response.json();
      setInscripciones(data);
    } catch (error) {
      console.error("Error al cargar inscripciones:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;
  }

  return (
    <div>
      <div className="bg-card border shadow-sm overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-border">
          {inscripciones.length === 0 ? (
            <li className="px-6 py-4 text-center text-muted-foreground">
              No hay inscripciones pendientes de pago
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
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>{inscripcion.curso.escuela.nombre}</span>
                      <span className="mx-2 text-border">•</span>
                      <span>{inscripcion.curso.nombre}</span>
                      <span className="mx-2 text-border">•</span>
                      <span className="font-semibold text-foreground">
                        G. {inscripcion.curso.costo.toLocaleString()}
                      </span>
                    </div>
                    {inscripcion.alumno.cedula && (
                      <div className="mt-1 text-xs text-muted-foreground/70">
                        Cédula: {inscripcion.alumno.cedula}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/cajero/facturar/${inscripcion.id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    >
                      Generar Factura
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

