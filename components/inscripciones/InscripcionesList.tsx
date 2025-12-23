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
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    INSCRITO: "bg-green-100 text-green-800",
    CANCELADO: "bg-red-100 text-red-800",
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-900 bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="INSCRITO">Inscrito</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-navy-200">
          {inscripciones.length === 0 ? (
            <li className="px-6 py-4 text-center text-navy-500">
              No hay inscripciones registradas
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
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          estadoColors[inscripcion.estado]
                        }`}
                      >
                        {estadoLabels[inscripcion.estado]}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-navy-500">
                      <span>{inscripcion.curso.escuela.nombre}</span>
                      <span className="mx-2">•</span>
                      <span>{inscripcion.curso.nombre}</span>
                      <span className="mx-2">•</span>
                      <span>G. {inscripcion.curso.costo.toLocaleString()}</span>
                    </div>
                    {inscripcion.factura && (
                      <div className="mt-1 text-xs text-navy-400">
                        Factura: {inscripcion.factura.numero} - {inscripcion.factura.estado}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/encargado/${inscripcion.id}`}
                      className="text-navy-600 hover:text-navy-900 text-sm font-medium"
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

