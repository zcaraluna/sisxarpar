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
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-navy-200">
          {inscripciones.length === 0 ? (
            <li className="px-6 py-4 text-center text-navy-500">
              No hay inscripciones pendientes de pago
            </li>
          ) : (
            inscripciones.map((inscripcion) => (
              <li key={inscripcion.id} className="px-6 py-4 hover:bg-navy-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-navy-900">
                        {inscripcion.alumno.nombre} {inscripcion.alumno.apellido}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-navy-500">
                      <span>{inscripcion.curso.escuela.nombre}</span>
                      <span className="mx-2">•</span>
                      <span>{inscripcion.curso.nombre}</span>
                      <span className="mx-2">•</span>
                      <span className="font-semibold text-navy-900">
                        G. {inscripcion.curso.costo.toLocaleString()}
                      </span>
                    </div>
                    {inscripcion.alumno.cedula && (
                      <div className="mt-1 text-xs text-navy-400">
                        Cédula: {inscripcion.alumno.cedula}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/cajero/facturar/${inscripcion.id}`}
                      className="bg-navy-700 text-white px-4 py-2 rounded-lg hover:bg-navy-800 text-sm font-medium transition-colors"
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

