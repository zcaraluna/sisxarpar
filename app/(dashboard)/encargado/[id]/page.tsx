"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface InscripcionDetalle {
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
    direccion?: string;
  };
  curso: {
    id: string;
    nombre: string;
    codigo: string;
    costo: number;
    descripcion?: string;
    escuela: {
      nombre: string;
      codigo: string;
    };
  };
  factura?: {
    id: string;
    numero: string;
    estado: string;
    monto: number;
    tipoFacturacion: string;
    nombreTercero?: string;
    cedulaTercero?: string;
    fechaEmision: string;
    fechaPago?: string;
    cajero: {
      nombre: string;
      apellido: string;
    };
  };
}

export default function InscripcionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const inscripcionId = params.id as string;

  const [inscripcion, setInscripcion] = useState<InscripcionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInscripcion();
  }, [inscripcionId]);

  const fetchInscripcion = async () => {
    try {
      const response = await fetch(`/api/inscripciones/${inscripcionId}`);
      if (!response.ok) {
        setError("Inscripción no encontrada");
        setLoading(false);
        return;
      }
      const data = await response.json();
      setInscripcion(data);
    } catch (error) {
      console.error("Error al cargar inscripción:", error);
      setError("Error al cargar los detalles de la inscripción");
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

  const estadoFacturaLabels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    PAGADA: "Pagada",
    CANCELADA: "Cancelada",
  };

  const estadoFacturaColors: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    PAGADA: "bg-green-100 text-green-800",
    CANCELADA: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <div className="text-navy-700">Cargando detalles...</div>
        </div>
      </div>
    );
  }

  if (error || !inscripcion) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Inscripción no encontrada"}
        </div>
        <Link href="/encargado">
          <Button variant="secondary">Volver a Inscripciones</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/encargado">
          <Button variant="secondary" className="mb-4">
            ← Volver a Inscripciones
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-navy-900">Detalles de Inscripción</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Alumno */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Información del Alumno
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-navy-700">Nombre completo:</span>
              <p className="text-navy-900">
                {inscripcion.alumno.nombre} {inscripcion.alumno.apellido}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-navy-700">Email:</span>
              <p className="text-navy-900">{inscripcion.alumno.email}</p>
            </div>
            {inscripcion.alumno.cedula && (
              <div>
                <span className="text-sm font-medium text-navy-700">Cédula:</span>
                <p className="text-navy-900">{inscripcion.alumno.cedula}</p>
              </div>
            )}
            {inscripcion.alumno.telefono && (
              <div>
                <span className="text-sm font-medium text-navy-700">Teléfono:</span>
                <p className="text-navy-900">{inscripcion.alumno.telefono}</p>
              </div>
            )}
            {inscripcion.alumno.direccion && (
              <div>
                <span className="text-sm font-medium text-navy-700">Dirección:</span>
                <p className="text-navy-900">{inscripcion.alumno.direccion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información del Curso */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Información del Curso
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-navy-700">Escuela:</span>
              <p className="text-navy-900">{inscripcion.curso.escuela.nombre}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-navy-700">Curso:</span>
              <p className="text-navy-900">{inscripcion.curso.nombre}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-navy-700">Código:</span>
              <p className="text-navy-900">{inscripcion.curso.codigo}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-navy-700">Costo:</span>
              <p className="text-navy-900 font-semibold">
                G. {inscripcion.curso.costo.toLocaleString()}
              </p>
            </div>
            {inscripcion.curso.descripcion && (
              <div>
                <span className="text-sm font-medium text-navy-700">Descripción:</span>
                <p className="text-navy-900">{inscripcion.curso.descripcion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Estado de la Inscripción */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Estado de la Inscripción
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-navy-700">Estado:</span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    estadoColors[inscripcion.estado]
                  }`}
                >
                  {estadoLabels[inscripcion.estado]}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-navy-700">Fecha de inscripción:</span>
              <p className="text-navy-900">
                {new Date(inscripcion.fechaInscripcion).toLocaleDateString("es-PY", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {inscripcion.observaciones && (
              <div>
                <span className="text-sm font-medium text-navy-700">Observaciones:</span>
                <p className="text-navy-900 mt-1">{inscripcion.observaciones}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información de Factura */}
        {inscripcion.factura ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">
              Información de Factura
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-navy-700">Número de factura:</span>
                <p className="text-navy-900 font-semibold">{inscripcion.factura.numero}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-navy-700">Estado:</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      estadoFacturaColors[inscripcion.factura.estado]
                    }`}
                  >
                    {estadoFacturaLabels[inscripcion.factura.estado]}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-navy-700">Monto:</span>
                <p className="text-navy-900 font-semibold">
                  G. {inscripcion.factura.monto.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-navy-700">Tipo de facturación:</span>
                <p className="text-navy-900">
                  {inscripcion.factura.tipoFacturacion === "PROPIO"
                    ? "A nombre del alumno"
                    : "A nombre de tercero"}
                </p>
              </div>
              {inscripcion.factura.tipoFacturacion === "TERCERO" && (
                <>
                  {inscripcion.factura.nombreTercero && (
                    <div>
                      <span className="text-sm font-medium text-navy-700">Nombre del tercero:</span>
                      <p className="text-navy-900">{inscripcion.factura.nombreTercero}</p>
                    </div>
                  )}
                  {inscripcion.factura.cedulaTercero && (
                    <div>
                      <span className="text-sm font-medium text-navy-700">Cédula del tercero:</span>
                      <p className="text-navy-900">{inscripcion.factura.cedulaTercero}</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <span className="text-sm font-medium text-navy-700">Fecha de emisión:</span>
                <p className="text-navy-900">
                  {new Date(inscripcion.factura.fechaEmision).toLocaleDateString("es-PY", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {inscripcion.factura.fechaPago && (
                <div>
                  <span className="text-sm font-medium text-navy-700">Fecha de pago:</span>
                  <p className="text-navy-900">
                    {new Date(inscripcion.factura.fechaPago).toLocaleDateString("es-PY", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-navy-700">Cajero:</span>
                <p className="text-navy-900">
                  {inscripcion.factura.cajero.nombre} {inscripcion.factura.cajero.apellido}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">
              Información de Factura
            </h2>
            <p className="text-navy-500">No se ha generado factura para esta inscripción.</p>
            <p className="text-sm text-navy-400 mt-2">
              La factura será generada por el cajero cuando se procese el pago.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

