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
    PENDIENTE: "bg-secondary text-secondary-foreground",
    INSCRITO: "bg-primary text-primary-foreground",
    CANCELADO: "bg-destructive text-destructive-foreground",
  };

  const estadoFacturaLabels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    PAGADA: "Pagada",
    CANCELADA: "Cancelada",
  };

  const estadoFacturaColors: Record<string, string> = {
    PENDIENTE: "bg-secondary text-secondary-foreground",
    PAGADA: "bg-primary text-primary-foreground",
    CANCELADA: "bg-destructive text-destructive-foreground",
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <div className="text-muted-foreground animate-pulse">Cargando detalles...</div>
        </div>
      </div>
    );
  }

  if (error || !inscripcion) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-4 text-sm">
          {error || "Inscripción no encontrada"}
        </div>
        <Link href="/encargado">
          <Button variant="outline">Volver a Inscripciones</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/encargado">
            <Button variant="ghost" className="-ml-3 mb-2 text-muted-foreground">
              ← Volver a Inscripciones
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Detalles de Inscripción</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Alumno */}
        <div className="bg-card border shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Información del Alumno
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre completo</span>
              <p className="text-foreground font-medium">
                {inscripcion.alumno.nombre} {inscripcion.alumno.apellido}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
              <p className="text-foreground">{inscripcion.alumno.email}</p>
            </div>
            {inscripcion.alumno.cedula && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cédula</span>
                <p className="text-foreground">{inscripcion.alumno.cedula}</p>
              </div>
            )}
            {inscripcion.alumno.telefono && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Teléfono</span>
                <p className="text-foreground">{inscripcion.alumno.telefono}</p>
              </div>
            )}
            {inscripcion.alumno.direccion && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dirección</span>
                <p className="text-foreground">{inscripcion.alumno.direccion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información del Curso */}
        <div className="bg-card border shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Información del Curso
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Escuela</span>
              <p className="text-foreground">{inscripcion.curso.escuela.nombre}</p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Curso</span>
              <p className="text-foreground font-semibold">{inscripcion.curso.nombre}</p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Código</span>
              <p className="text-foreground font-mono text-sm">{inscripcion.curso.codigo}</p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Costo</span>
              <p className="text-xl font-bold text-primary">
                G. {inscripcion.curso.costo.toLocaleString()}
              </p>
            </div>
            {inscripcion.curso.descripcion && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descripción</span>
                <p className="text-muted-foreground text-sm">{inscripcion.curso.descripcion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Estado de la Inscripción */}
        <div className="bg-card border shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Estado de la Inscripción
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Estado actual</span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${estadoColors[inscripcion.estado]
                  }`}
              >
                {estadoLabels[inscripcion.estado]}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha de inscripción</span>
              <p className="text-foreground">
                {new Date(inscripcion.fechaInscripcion).toLocaleDateString("es-PY", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {inscripcion.observaciones && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Observaciones</span>
                <p className="text-muted-foreground text-sm mt-1">{inscripcion.observaciones}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información de Factura */}
        {inscripcion.factura ? (
          <div className="bg-card border shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Información de Factura
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Número de factura</span>
                  <p className="text-foreground font-mono font-bold text-lg">{inscripcion.factura.numero}</p>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${estadoFacturaColors[inscripcion.factura.estado]
                    }`}
                >
                  {estadoFacturaLabels[inscripcion.factura.estado]}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monto total</span>
                <p className="text-xl font-bold text-foreground">
                  G. {inscripcion.factura.monto.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de facturación</span>
                <p className="text-muted-foreground text-sm">
                  {inscripcion.factura.tipoFacturacion === "PROPIO"
                    ? "A nombre del alumno"
                    : "A nombre de tercero"}
                </p>
              </div>
              {inscripcion.factura.tipoFacturacion === "TERCERO" && (
                <div className="bg-muted/30 p-3 rounded-md space-y-2">
                  {inscripcion.factura.nombreTercero && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tercero</span>
                      <p className="text-sm font-medium">{inscripcion.factura.nombreTercero}</p>
                    </div>
                  )}
                  {inscripcion.factura.cedulaTercero && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ID/RUC</span>
                      <p className="text-sm font-medium">{inscripcion.factura.cedulaTercero}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Emisión</span>
                  <p className="text-xs font-medium">
                    {new Date(inscripcion.factura.fechaEmision).toLocaleDateString()}
                  </p>
                </div>
                {inscripcion.factura.fechaPago && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pago</span>
                    <p className="text-xs font-medium">
                      {new Date(inscripcion.factura.fechaPago).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cajero responsable</span>
                <p className="text-xs font-medium">
                  {inscripcion.factura.cajero.nombre} {inscripcion.factura.cajero.apellido}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted/10 border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold mb-2 opacity-50">
              Sin Factura
            </h2>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              No se ha generado factura para esta inscripción todavía.
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-4 uppercase tracking-widest font-bold">
              Pendiente de Pago
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

