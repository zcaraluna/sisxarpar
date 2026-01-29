"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface Inscripcion {
  id: string;
  alumno: {
    nombre: string;
    apellido: string;
    email: string;
    cedula?: string;
  };
  curso: {
    nombre: string;
    costo: number;
    escuela: {
      nombre: string;
    };
  };
}

export default function FacturarPage() {
  const router = useRouter();
  const params = useParams();
  const inscripcionId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [formData, setFormData] = useState({
    monto: "",
    tipoFacturacion: "PROPIO" as "PROPIO" | "TERCERO",
    nombreTercero: "",
    cedulaTercero: "",
    direccionTercero: "",
    observaciones: "",
  });

  useEffect(() => {
    fetchInscripcion();
  }, [inscripcionId]);

  const fetchInscripcion = async () => {
    try {
      const response = await fetch(`/api/inscripciones`);
      const data = await response.json();
      const inscripcionData = data.find((i: any) => i.id === inscripcionId);
      if (inscripcionData) {
        setInscripcion(inscripcionData);
        setFormData((prev) => ({
          ...prev,
          monto: inscripcionData.curso.costo.toString(),
        }));
      }
    } catch (error) {
      console.error("Error al cargar inscripción:", error);
      setError("Error al cargar datos de la inscripción");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/facturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inscripcionId,
          monto: parseFloat(formData.monto),
          tipoFacturacion: formData.tipoFacturacion,
          nombreTercero:
            formData.tipoFacturacion === "TERCERO"
              ? formData.nombreTercero
              : undefined,
          cedulaTercero:
            formData.tipoFacturacion === "TERCERO"
              ? formData.cedulaTercero
              : undefined,
          direccionTercero:
            formData.tipoFacturacion === "TERCERO"
              ? formData.direccionTercero
              : undefined,
          observaciones: formData.observaciones || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Error al generar factura");
        setLoading(false);
        return;
      }

      router.push("/cajero");
    } catch (err) {
      setError("Error al generar factura");
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!inscripcion) {
    return <div className="text-center py-8">Inscripción no encontrada</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Generar Factura
        </h1>

        <div className="bg-card border shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Información de la Inscripción
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Alumno:</span> {inscripcion.alumno.nombre}{" "}
              {inscripcion.alumno.apellido}
            </p>
            <p>
              <span className="font-medium text-foreground">Escuela:</span> {inscripcion.curso.escuela.nombre}
            </p>
            <p>
              <span className="font-medium text-foreground">Curso:</span> {inscripcion.curso.nombre}
            </p>
            <p>
              <span className="font-medium text-foreground">Costo del curso:</span> G.{" "}
              {inscripcion.curso.costo.toLocaleString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border shadow-sm rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <Input
            label="Monto"
            type="number"
            step="0.01"
            value={formData.monto}
            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            required
          />

          <Select
            label="Tipo de Facturación"
            value={formData.tipoFacturacion}
            onChange={(e) =>
              setFormData({
                ...formData,
                tipoFacturacion: e.target.value as "PROPIO" | "TERCERO",
              })
            }
            options={[
              { value: "PROPIO", label: "A nombre del alumno" },
              { value: "TERCERO", label: "A nombre de tercero" },
            ]}
            required
          />

          {formData.tipoFacturacion === "TERCERO" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <Input
                label="Nombre del Tercero"
                value={formData.nombreTercero}
                onChange={(e) =>
                  setFormData({ ...formData, nombreTercero: e.target.value })
                }
                required
              />
              <Input
                label="Cédula del Tercero"
                value={formData.cedulaTercero}
                onChange={(e) =>
                  setFormData({ ...formData, cedulaTercero: e.target.value })
                }
                required
              />
              <Input
                label="Dirección del Tercero"
                value={formData.direccionTercero}
                onChange={(e) =>
                  setFormData({ ...formData, direccionTercero: e.target.value })
                }
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Generando..." : "Generar Factura"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

