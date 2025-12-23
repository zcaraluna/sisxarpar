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
        <h1 className="text-3xl font-bold text-navy-900 mb-6">
          Generar Factura
        </h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Información de la Inscripción
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Alumno:</span> {inscripcion.alumno.nombre}{" "}
              {inscripcion.alumno.apellido}
            </p>
            <p>
              <span className="font-medium">Escuela:</span> {inscripcion.curso.escuela.nombre}
            </p>
            <p>
              <span className="font-medium">Curso:</span> {inscripcion.curso.nombre}
            </p>
            <p>
              <span className="font-medium">Costo del curso:</span> G.{" "}
              {inscripcion.curso.costo.toLocaleString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
            <>
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
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-900 placeholder:text-navy-400"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
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

